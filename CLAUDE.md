# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (Vite)
pnpm build        # Client build + SSR build + prerender injection
pnpm build:client # Client build only, no prerender (debugging)
pnpm cv           # Regenerate the two A4 CV pages in public/
pnpm typecheck    # tsc over src/ and over scripts/ + vite.config.ts
pnpm preview      # Preview production build
pnpm lint         # ESLint (TypeScript + React)
```

Everything in this repo is TypeScript, the two build scripts included; they run through `tsx`. Do not add build scripts in another language.

> pnpm is what CI uses; npm works locally too. Both lockfiles are kept in sync; if you change dependencies, update `pnpm-lock.yaml` too or the GitHub Actions build fails on `--frozen-lockfile`.

## Architecture

Single-page React 18 portfolio/CV website built with Vite, TypeScript, and TailwindCSS.

**Component layout** (rendered in order inside `src/App.tsx`):
`Header` → `Hero` → `About` → `Experience` → `Skills` → `Education` → `Projects` → `Contact` → `Footer`

Each section is a self-contained component in `src/components/`. There is no routing, everything is a vertically scrolling single page. The two legal pages and the two A4 CV pages are static HTML in `public/`, outside React.

## Prerendering (important)

The site is linked from CVs and job applications, so an ATS parser or an LLM screener that follows the link must find real content in the HTML. `pnpm build` therefore runs three steps:

1. `vite build` produces the client bundle and `dist/index.html`.
2. `vite build --ssr src/entry-server.tsx` produces `dist-ssr/entry-server.js`.
3. `tsx scripts/prerender.ts` renders `<App />` to a string and injects it into `<div id="root">`, then deletes `dist-ssr`.

`src/index.tsx` hydrates when it finds prerendered markup and falls back to a plain client render otherwise (which is what happens in dev).

Consequences to respect when editing components:
- No `window`, `document` or `localStorage` access during render. Effects are fine, they do not run on the server.
- Anything conditionally hidden should stay in the DOM with a `hidden` class rather than being unmounted, so crawlers still read it. `Experience` does this for the collapsed roles.
- If `<div id="root"></div>` in `index.html` ever changes shape, `scripts/prerender.ts` throws rather than silently shipping an empty page.

## Content source of truth

Site copy is a deliberate **copy** of the Word CV, not a live import. The Word CVs live in a private folder outside this repository and must never become a build dependency of a public repo, so nothing here reads a `.docx`.

He versions his CVs by number (`Luka_Engels_CV_13.docx`, then `_14`, and so on) and never overwrites an earlier one, so any hardcoded filename goes stale. The `SYNCED_FROM` constant at the top of `scripts/build-cv-pages.ts` records which document the content was last reconciled against. When a higher-numbered CV exists in the Job Search folder, re-read it, update the content model and the React components, then bump `SYNCED_FROM`. Nothing breaks if that is missed, the pages simply keep saying what they said last time.

Editorial rules that apply to everything with his name on it:

- **No em dashes or en dashes in prose.** Rewrite with commas, colons, semicolons or a full stop. Exceptions: date ranges (`Sep 2024 – Present`) and structural separators in titles.
- **Collective voice for delivery claims.** "we" / "our team" for anything the team shipped. First person singular only for his title, leadership scope, what he is looking for, and his working style.
- Headline everywhere: `Lead Software Engineer · Agentic AI & LLM Platforms · TypeScript / AWS`. Python is deliberately not in the headline.
- Citizenship (German and Croatian) is stated on the site and in both CV pages.
- He is looking for permanent, fully remote employment only. Never describe him as available for freelance, contract or project work, and never claim immediate availability.

## Styling conventions

- Black background (`bg-black`), white text, dark theme throughout
- Custom fonts: `font-grotesk` (Space Grotesk, headings) and `font-inter` (Inter, body)
- **Fonts are self-hosted** via `@fontsource/*` imported in `src/index.css`, not loaded from Google Fonts. This is deliberate: loading them from Google transfers visitor IP addresses to a US server, which German courts have treated as a DSGVO violation. Do not reintroduce the Google Fonts `<link>`.
- Responsive breakpoints follow mobile-first Tailwind defaults (`md:`, `lg:`)

## Print / CV export

- `src/index.css` contains `@media print` rules for A4 layout with page-break control
- `Header` links to the two standalone A4 pages, `public/cv-luka-engels-en.html` and `-de.html`
- **Those two pages are generated, do not hand-edit them.** Edit the content model in `scripts/build-cv-pages.ts` and run `pnpm cv`. Their base stylesheet lives in `scripts/cv-styles.css`; the generator reads that file rather than scraping the CSS back out of its own output, which is what keeps repeated runs idempotent.

## Contact form

`Contact.tsx` posts to Web3Forms when `VITE_WEB3FORMS_KEY` is set, and falls back to a `mailto:` handoff when it is not, so the build never depends on the key being present. In CI the key comes from the `VITE_WEB3FORMS_KEY` repository secret. A hidden honeypot field named `company` drops bot submissions.

## Static assets

`public/` is copied verbatim into `dist/`: images, `favicon.svg`, `robots.txt`, `sitemap.xml`, `llms.txt`, `CNAME`, `.nojekyll`, the two legal pages and the two CV pages. Images are referenced with root-relative paths (e.g. `/images/luka-web-bw.jpg`).

## Deployment

GitHub Actions builds and deploys to GitHub Pages on every push to `main`. Custom domain `luka-engels.de` via `CNAME`.
