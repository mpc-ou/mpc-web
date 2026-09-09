# Plan: Admin Management Overhaul

## Overview
Refactor 4 admin sections with bilingual support, DB-backed data, and improved UX.

---

## Phase 1: Activities Table + Admin

### Schema Changes
```prisma
model Activity {
  id            String   @id @default(cuid())
  slug          String   @unique
  titleVi       String
  titleEn       String   @default("")
  descriptionVi String   @default("")
  descriptionEn String   @default("")
  frequencyVi   String?
  frequencyEn   String?
  thumbnail     String?
  images        String[] @default([])
  isActive      Boolean  @default(true)
  order         Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts        Post[]            // FK from Post
  sponsors     Sponsor[]         // FK from Sponsor
  eventPosts   PostActivity[]    // existing relation

  @@schema("public")
}
```

### Files to Create
| File | Purpose |
|------|---------|
| `app/[locale]/(private)/admin/activities/page.tsx` | Admin list page |
| `app/[locale]/(private)/admin/activities/actions.ts` | CRUD + seed actions |
| `app/[locale]/(private)/admin/activities/columns.tsx` | Table columns |
| `app/[locale]/(private)/admin/activities/activity-form.tsx` | Bilingual form (like blog form) |
| `app/[locale]/(private)/admin/activities/new/page.tsx` | New activity page |
| `app/[locale]/(private)/admin/activities/[id]/edit/page.tsx` | Edit activity page |

### Form Layout (like blog form)
```
┌─ LanguageToggle + TranslateButton ─┐
├─ Thumbnail upload ─────────────────┤
├─ Title (VI/EN via viewLang) ───────┤
├─ Description (Markdown, VI/EN) ────┤
├─ Frequency (VI/EN) ────────────────┤
├─ Images gallery ───────────────────┤
└────────────────────────────────────┘
```

### Seed Feature
- Button "Nhập nhanh từ JSON" calls `adminSeedActivities()`
- Reads `configs/data/activities.json`
- Creates Activity records from JSON data
- Pattern: same as FAQ seed

---

## Phase 2: Post ↔ Activity FK

### Schema Changes
```prisma
model Post {
  // ...existing fields...
  activityId String?
  activity   Activity? @relation(fields: [activityId], references: [id], onDelete: SetNull)

  @@index([activityId])
}
```

### Post Form Changes
- Add `<Select>` for "Loại hoạt động" in the classification card
- Fetch activities list for the dropdown

### Search Impact
- Update `searchAll` FTS to include activity title in tsvector for posts

---

## Phase 3: Sponsors Rewrite

### Schema Changes
```prisma
model Sponsor {
  id            String    @id @default(cuid())
  name          String
  nameEn        String    @default("")
  slug          String    @unique
  descriptionVi String?
  descriptionEn String?
  logo          String?
  email         String?
  phone         String?
  website       String?
  activityId    String?
  startAt       DateTime?
  endAt         DateTime?
  images        String[]  @default([])
  isActive      Boolean   @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  activity     Activity?          @relation(fields: [activityId], references: [id], onDelete: SetNull)
  sponsorships PostSponsorship[]

  @@index([activityId])
  @@schema("public")
}
```

### Admin Files
| File | Purpose |
|------|---------|
| Update `actions.ts` | CRUD with bilingual fields |
| Update `columns.tsx` | New columns |
| Rewrite `form-dialog.tsx` → `sponsor-form.tsx` | Full-page bilingual form |
| `new/page.tsx`, `[id]/edit/page.tsx` | Routes |

### Form Layout (like blog form)
```
┌─ LanguageToggle + TranslateButton ─┐
├─ Logo upload ──────────────────────┤
├─ Name (VI/EN) ─────────────────────┤
├─ Description (Markdown, VI/EN) ────┤
├─ Email / Phone / Website ──────────┤
├─ Activity (Select) ────────────────┤
├─ Sponsorship period (start/end) ───┤
├─ Gallery images ───────────────────┤
└────────────────────────────────────┘
```

### Frontend Change
- `/sponsors` page: keep grid layout, click → **modal** with full details
- Create `sponsor-detail-dialog.tsx` component

---

## Phase 4: Departments Rewrite

### Schema Already Has Bilingual (nameVi/nameEn/descriptionVi/descriptionEn)
No schema changes needed, just update:
- `icon`, `bgImage` fields are already present
- `missionsVi`, `missionsEn` already JSON arrays

### Admin Changes
| File | Change |
|------|--------|
| `form-dialog.tsx` | Rewrite to bilingual form (like blog form) |
| `manager.tsx` | Add seed button |
| `actions.ts` | Add `adminSeedDepartments()` |

### Seed Feature
- Reads `configs/data/departments.json`
- Creates Department records
- **Special**: "Ban Chủ nhiệm" (PRESIDENT role) is default, cannot be deleted → client-side guard

### Form Layout
```
┌─ LanguageToggle + TranslateButton ─┐
├─ Name (VI/EN) ─────────────────────┤
├─ Slug ─────────────────────────────┤
├─ Description (Markdown, VI/EN) ────┤
├─ Missions (VI/EN, array input) ────┤
├─ Icon selector ────────────────────┤
├─ bgImage upload ───────────────────┤
├─ Link label (VI/EN) + Link URL ────┤
├─ Order ────────────────────────────┤
└────────────────────────────────────┘
```

### Frontend Impact
- `departments-carousel.client.tsx`: already reads from props → no change needed
- Parent page just switches from JSON import to DB fetch
- Update `app/[locale]/(main)/about/page.tsx` to fetch from DB

---

## Implementation Order
1. **Activities** schema + migration + admin CRUD + seed
2. **Post FK** to Activity + form update
3. **Sponsors** schema + migration + admin rewrite + modal frontend
4. **Departments** admin rewrite + seed + DB-backed frontend
5. **Search** update for new fields

## Estimated New/Modified Files
| Type | Count |
|------|-------|
| New files | ~12 |
| Modified files | ~10 |
| Schema migrations | 3 |
