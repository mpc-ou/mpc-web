# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MPC Web — the public site and admin panel for Mobile Programming Club (Ho Chi Minh City Open University). Next.js 16 (App Router, React Compiler, Turbopack), React 19, TypeScript, Tailwind CSS 4 + Shadcn UI, PostgreSQL via Prisma 7, Supabase (storage only — auth is NOT Supabase Auth, see below), next-intl (vi/en).

## Commands

- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint:check` — Biome check (lint + format check)
- `pnpm lint:fix` — Biome check --write (autofix)
- `pnpm lint:unsafe` — Biome check --write --unsafe (includes unsafe fixes)
- `pnpm exec tsc --noEmit -p .` — typecheck only
- `pnpm exec biome check <path>` — lint/format a single file or directory
- There is no test runner configured in this repo.

Biome (not ESLint/Prettier) is the sole linter/formatter, configured via `biome.jsonc` and Ultracite rules (see `.github/copilot-instructions.md` for the full strict-mode ruleset it enforces — type safety, a11y, no `any`, etc.). Husky + lint-staged run Biome on commit; commitlint enforces Conventional Commits (`feat:`, `fix:`, `docs:`, …).

## Architecture

### Auth: centralized SSO (OIDC + PKCE), not Supabase Auth

Authentication is handled by an external NestJS SSO service (`SSO_ISSUER`), not Supabase. Supabase is used only for Postgres storage buckets (avatars/covers/gallery uploads).

- `proxy.ts` (Next 16's replacement for `middleware.ts`) chains `next-intl`'s locale routing with `configs/auth/middleware.ts#updateSession`, which reads/refreshes the `mpc_session` cookie (JWT, encrypted via `jose` in `utils/session.ts`) and redirects based on route group membership (`constants/route.ts` defines `_ROUTE_PRIVATES` / `_ROUTE_AUTH`).
- `services/sso.ts` talks to the SSO service: JWKS verification (`createRemoteJWKSet`), token refresh, and member-role sync.
- `app/api/auth/callback/route.ts` handles the OIDC callback (PKCE exchange); `app/api/auth/logout/route.ts` clears the session; `app/api/cron/sync-sso/route.ts` is a cron endpoint (guarded by `CRON_SECRET`) that pulls member/role data from SSO into the local DB via `services/sso.ts`.
- `utils/session.ts` defines `UserSession` (id, email, name, `role: WebRole`, tokens, expiry) and `getSession()`/`encrypt`/`decrypt`.
- Root admin bypass: `services/... ` no — `utils/admin.ts` parses `ADMIN_ACCOUNT` env (JSON array of emails) for `isRootAdmin()`, independent of the DB-driven `WebRole` on `Member`.

### Server actions convention (`app/_actions/`)

All data mutations/reads that aren't plain page-level Prisma queries live under `app/_actions/`, split by audience: `admin/`, `main/` (public site), `profile/` (self-service). Every action is wrapped with one of two helpers from `utils/handle-error-server.ts`:

- `handleErrorServerNoAuth({ cb })` — no session required; catches errors, logs them, and returns a `ResponseType` (`{ error, data }` from `types/response.ts`).
- `handleErrorServerWithAuth({ cb })` — requires a valid session (401 `ResponseType` if absent); `cb` receives `{ user: UserSession }`.

Admin actions additionally call `requireAdmin(user)` (`app/_actions/admin/helpers.ts`) inside `cb`, which checks `Member.webRole === "ADMIN"` in the DB (throws `Forbidden` otherwise) — this is a *second* check beyond session auth, so don't skip it when adding new admin actions. `app/_actions/admin/helpers.ts` also re-exports `prisma` and `handleErrorServerWithAuth` and provides `generateSlug`/`generateUniqueSlug`.

Client code always gets back a `ResponseType` (`{ error: {status, message} | null, data: {status, payload} | null }`) — never a raw thrown error — so callers branch on `res.error` / `res.data?.payload`.

### `utils/` vs `services/` split

- `services/` — anything that performs I/O against an external system: direct Prisma/DB queries used across features (`auth-val.ts`, `blog-permission.ts`), third-party API calls (`deepseek.ts` for AI text ops, `geocode.ts` for Nominatim), Supabase Storage (`supabase-upload.ts`), and the SSO client (`sso.ts`).
- `utils/` — pure helpers with no external I/O: `response.ts`, `handle-error-server.ts`, `session.ts` (crypto/cookie logic, no network), `handle-datetime.ts`, `color.ts`, `sanitize-html.ts`, `seo.ts`, `fuse-search.ts`, `dicebear-avatar.ts`, `admin.ts`.

When adding a new helper, put it in `services/` if it calls Prisma, an external API, or storage; otherwise `utils/`.

### Routing structure (`app/[locale]/`)

Locale-prefixed routes under `next-intl`, split into route groups:

- `(main)` — public site (home, about, events, projects, achievements, blogs, members/[slug], sponsors, training, search).
- `(private)` — requires session (enforced by `proxy.ts`): `(main)/profile`, `(main)/my-blogs`, `(main)/member-card`, and `admin/*` (12+ modules: activities, announcements, departments, faq, gallery, homepage, members, posts, projects, recaps, sponsors, settings — each typically `page.tsx` + `manager.tsx`/`columns.tsx` + `_components/`).
- `(public)/auth`, `(public)/error` — unauthenticated-only pages.
- `(recap)/recap/[year]` — standalone "year in review" slide deck route (separate layout, `components/slide-*.tsx`).

Route-local UI lives in `_components/` (or `_components` per feature folder) next to the `page.tsx` that uses it; only cross-route shared UI belongs in top-level `components/`.

### Data layer

- Prisma schema: `configs/prisma/schema.prisma` (client output: `configs/prisma/generated/prisma`, imported as `@/configs/prisma/generated/prisma/client`; `@prisma/adapter-pg` driver). Client instance: `configs/prisma/db.ts` (`@/configs/prisma/db`). Config lives in `prisma.config.ts` (uses `DIRECT_URL` for migrations, pooled `DATABASE_URL` at runtime).
- Core models (see schema for full field/relation list): `Member`, `Department`, `ClubRole`, `Post` (unified content type — `PostType` differentiates blog/event/achievement/project-adjacent posts, `PostStatus` drives the Draft → Review → Published/Unlisted workflow, with `PostRevision` history), `Activity`, `Project`, `Sponsor`, `YearRecap`, `Notification`, plus site-config models (`SiteSetting`, `Announcement`, `HomepageSection`, `FaqItem`, `GalleryImage`, `ExternalLink`).
- Prefer `Prisma.XGetPayload<{ include/select: {...} }>` for typing query results instead of hand-written interfaces or `any` — this codebase enforces `noExplicitAny` strictly (Biome/Ultracite) and existing `_actions` files show the pattern.

### i18n

`next-intl` with locales `vi` (default) and `en`. Translation JSON is split by namespace under `configs/messages/{namespace}.{locale}.json` (`common`, `main`, `events`, `admin`, `auth`) and merged in `configs/i18n/request.ts`, which reads files with `readFileSync` (not dynamic `import()`) specifically to avoid Turbopack's aggressive JSON module caching — keep that pattern if you touch message loading. Locale routing config is in `configs/i18n/routing.ts`.

### API docs

`app/api/docs` exposes a Swagger JSON spec (via `next-swagger-doc`, config in `configs/swagger/`) rendered by `app/api-docs/page.tsx` using the swagger-ui CDN bundle.
