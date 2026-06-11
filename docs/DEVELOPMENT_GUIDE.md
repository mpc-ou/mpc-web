# MPC Web Developer & Agent Guidelines

This document outlines the core architecture, visual guidelines, coding standards, and design patterns of the **MPC Web** project. Any developer or AI agent modifying or creating pages in this repository must strictly adhere to these patterns to ensure visual consistency, type safety, and clean code.

---

## 1. Project Architecture & Folder Conventions

The application uses the **Next.js App Router** with internationalization (`next-intl`). 

### Key Directory Layout
```bash
├── app/[locale]/
│   ├── (main)/              # Main marketing and club activity pages
│   │   ├── activities/      # Club activities (e.g., webdesign/)
│   │   │   └── webdesign/   # Page folder
│   │   │       ├── _components/  # Route-specific modular subcomponents
│   │   │       └── page.tsx      # Main layout coordinator (Client component)
│   │   └── _components/     # Shared layout-specific components (e.g. GalleryMasonry)
├── components/
│   ├── ui/                  # Shadcn primitives (Button, Badge, etc.)
│   └── custom/              # Reusable custom interactive elements (e.g. FaqAccordion, EditorWindow)
├── configs/
│   ├── data/                # Static data JSON files (e.g., wd.json, faq-webdesign.json)
│   └── messages/            # i18n Translation dictionaries (en.json, vi.json)
```

### Component Boundaries
* **Client Components:** Must be named with the `.client.tsx` suffix (e.g., `editor-window.client.tsx`). They must be placed under route-specific `_components` or global `components/custom/`.
* **Server Components:** Default components without the client suffix.
* **Component Size Limit:** Keep files under **300 lines**. If a page grows large, split it into modular subcomponents inside a local `_components/` directory. The main `page.tsx` should only act as a clean page coordinator (importing and laying out the subcomponents).

---

## 2. Visual Style & Aesthetic Guidelines

The platform uses a premium, developer-centric, tech-inspired design system. 

### Base Theme & Glassmorphism
* **Background:** Dark-theme base utilizing `bg-slate-950`.
* **Cards & Containers:** `bg-slate-900/40` with a subtle white border `border-white/5` and backdrop blur `backdrop-blur-md` or `backdrop-blur-xs`.
* **Glow/Orbs:** Overlay background glowing radial gradients (e.g. `<div className="bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />`) to add depth and vibrant visual aesthetics.

### Accent Palette
* **Orange/Amber (`from-orange-500 to-amber-500`):** Used as the primary brand color, hover effects, highlight badges, and interactive cues.
* **Blue/Cyan (`from-blue-500 to-cyan-400`):** Used for partnership, sponsor banners, and collaborative sections.
* **Emerald (`stroke-emerald-400`, `text-emerald-400`):** Used for successful audits, criteria checklists, and performance metrics.
* **Pink/Rose (`from-pink-500 to-rose-400`):** Used as high-contrast developer nodes or code highlights.

### Figma Blueprint Styling
To establish a premium developer design narrative, use blueprint design details:
* **Dot Grid Background:**
  ```css
  background-image: radial-gradient(rgba(249, 115, 22, 0.15) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 32px 32px, 16px 16px;
  ```
* **Coordinate Badges:** Tiny monospace coordinate indicators simulating layout canvases (e.g. `[x, y, w, h]`, `Frame: Info_Panel [W: 768px, H: 450px]`).
* **Hover Handles:** Corner handles simulating Figma resize handlers:
  ```tsx
  <div className='absolute top-[-3px] left-[-3px] h-1.5 w-1.5 bg-white border border-orange-500 opacity-0 group-hover:opacity-100 transition-opacity' />
  ```
* **Grid Lines:** Border highlights on hover:
  ```tsx
  <div className='absolute top-0 left-0 w-full h-[1px] bg-orange-500/0 group-hover:bg-orange-500/40 transition-colors' />
  ```

---

## 3. Core Reusable Patterns & Components

### 3.1. ScrollReveal Client wrapper
* **Path:** `@/components/ui/scroll-reveal.client`
* **Purpose:** Smooth fade-in, zoom-in, or slide-in entry animations as the user scrolls.
* **Usage:**
  ```tsx
  import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
  
  <ScrollReveal delay={150} variant="fade-up">
    <div>Animated Content</div>
  </ScrollReveal>
  ```

### 3.2. EditorWindow Component
* **Path:** `@/components/custom/editor-window.client`
* **Purpose:** Renders a gorgeous VS Code / terminal-style window. Supports file tabs, dynamic custom panel renders, and line numbers.
* **Usage:**
  ```tsx
  import { EditorWindow } from "@/components/custom/editor-window.client";
  
  <EditorWindow
    title="project-structure.json"
    tabs={[
      {
        name: "index.json",
        content: <pre><code>{`{ "status": "active" }`}</code></pre>
      },
      {
        name: "preview.jpg",
        content: <img src="/image.jpg" alt="Preview" />
      }
    ]}
  />
  ```

### 3.3. FaqAccordion Component
* **Path:** `@/components/custom/faq-accordion.client`
* **Purpose:** Accordion-based FAQ panel matching the site theme. Avoid hardcoding custom FAQ triggers on every page.
* **Data Schema:** Keep FAQ data in JSON format under `configs/data/` (e.g. `faq-webdesign.json`):
  ```json
  [
    {
      "id": "item-1",
      "question": {
        "vi": "Câu hỏi bằng tiếng Việt?",
        "en": "Question in English?"
      },
      "answer": {
        "vi": "Câu trả lời.",
        "en": "Answer text."
      }
    }
  ]
  ```
* **Usage:**
  ```tsx
  import { FaqAccordion } from "@/components/custom/faq-accordion.client";
  import faqData from "@/configs/data/faq-webdesign.json";
  
  const locale = useLocale(); // "vi" | "en"
  
  <FaqAccordion
    title={t("faqSectionTitle")}
    badge="faq"
    items={faqData.map((item) => ({
      id: item.id,
      question: item.question[locale] || item.question.vi,
      answer: item.answer[locale] || item.answer.vi
    }))}
  />
  ```

### 3.4. Lighthouse-Style Indicators
* **Purpose:** Visual audit metric indicators designed like Google Chrome Lighthouse ratings.
* **Usage:** Create a circular SVG that uses `strokeDasharray` and `strokeDashoffset` to animate the circle filling relative to a percentage score. Accent color is styled with `stroke-emerald-400` or `stroke-orange-500`.

---

## 4. Internationalization (i18n)

We use `next-intl` to localize the application. Hardcoded text strings inside components are strictly prohibited.

1. Add translation tokens to `configs/messages/vi.json` and `configs/messages/en.json`.
2. Access translations using `useTranslations`:
   ```tsx
   const t = useTranslations("webdesign");
   return <h3>{t("title")}</h3>;
   ```
3. Rich text formatting can be handled using `.rich`:
   ```tsx
   t.rich("desc", {
     b: (chunks) => <strong className="font-bold text-white">{chunks}</strong>
   })
   ```

---

## 5. Development Workflow & Quality Assurance

* **Code Formatting:** We use **Biome**. Run `pnpm biome format --write "path/to/folder"` to automatically clean up file formatting.
* **TypeScript Validation:** Run `pnpm tsc --noEmit` to verify type safety before completing tasks.
* **Git Branching:** **NEVER** write code directly on the `main` branch. Write code in the `dev` branch or feature branches, and merge via rebase.
* **Conventional Commits:** Ensure commits are descriptive and conform to conventional standards.
