# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint (TypeScript + React)
```

> pnpm is also configured — either package manager works.

## Architecture

Single-page React 18 portfolio/CV website built with Vite, TypeScript, and TailwindCSS.

**Component layout** (rendered in order inside `src/App.tsx`):
`Header` → `Hero` → `About` → `Experience` → `Skills` → `Education` → `Projects` → `Contact` → `Footer`

Each section is a self-contained component in `src/components/`. There is no routing — everything is a vertically scrolling single page.

**Styling conventions:**
- Black background (`bg-black`), white text — dark theme throughout
- Custom fonts: `font-grotesk` (Space Grotesk, headings) and `font-inter` (Inter, body), loaded from Google Fonts via `index.html`
- Responsive breakpoints follow mobile-first Tailwind defaults (`md:`, `lg:`)

**Print / CV export:**
- `src/index.css` contains dedicated `@media print` rules for A4 layout with page-break control
- `Header` has DE/EN language buttons that trigger CV download actions

**Header scroll behavior:** the Header component tracks scroll position to conditionally show/hide itself using a `useState`/`useEffect` pattern — no external scroll library.

**Images** live in `public/images/` and are referenced with root-relative paths (e.g., `/images/Profilna.png`).
