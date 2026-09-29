# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (Vite)
pnpm build        # Client build + SSR build + prerender injection
pnpm build:client # Client build only, no prerender (debugging)
pnpm cv           # Regenerate the two A4 CV pages in public/
pnpm articles     # Regenerate the article pages (both languages), the dev.to copies, articles.json and sitemap.xml
pnpm typecheck    # tsc over src/ and over scripts/ + tests/ + vite.config.ts
pnpm test         # Vitest unit tests in src/
pnpm test:build   # Vitest checks of the built dist/; run after pnpm build
pnpm preview      # Preview production build
pnpm lint         # ESLint (TypeScript + React); currently broken, ESLint 10 no longer reads .eslintrc.cjs
```

Everything in this repo is TypeScript, the two build scripts included; they run through `tsx`. Do not add build scripts in another language.

> pnpm is what CI uses; npm works locally too. Both lockfiles are kept in sync; if you change dependencies, update `pnpm-lock.yaml` too or the GitHub Actions build fails on `--frozen-lockfile`.

## Architecture

Single-page React 18 portfolio/CV website built with Vite, TypeScript, and TailwindCSS.

**Component layout** (rendered in order inside `src/App.tsx`):
`Header` → `Hero` → `About` → `Experience` → `Skills` → `Education` → `Projects` → `Writing` → `Contact` → `Footer`

Each section is a self-contained component in `src/components/`. There is no routing, everything is a vertically scrolling single page, served in English at `/` and in German at `/de/` (see Languages). The four legal pages, the two A4 CV pages and the article pages are static HTML in `public/`, outside React.

## Prerendering (important)

The site is linked from CVs and job applications, so an ATS parser or an LLM screener that follows the link must find real content in the HTML. `pnpm build` therefore runs three steps:

1. `vite build` produces the client bundle and `dist/index.html`.
2. `vite build --ssr src/entry-server.tsx` produces `dist-ssr/entry-server.js`.
3. `tsx scripts/prerender.ts` renders `<App lang>` once per language, swaps in that language's head, injects the markup into `<div id="root">`, writes `dist/index.html` and `dist/de/index.html`, then deletes `dist-ssr`.

`src/index.tsx` hydrates when it finds prerendered markup and falls back to a plain client render otherwise (which is what happens in dev).

Consequences to respect when editing components:
- No `window`, `document` or `localStorage` access during render. Effects are fine, they do not run on the server.
- Anything conditionally hidden should stay in the DOM with a `hidden` class rather than being unmounted, so crawlers still read it. `Experience` does this for the collapsed roles.
- If `<div id="root"></div>`, `<html lang="en">` or the `<!--i18n-head--><!--/i18n-head-->` markers in `index.html` ever change shape, `scripts/prerender.ts` throws rather than silently shipping an empty page or German content under an English head.

## Languages

The site is en-GB at `/` and de-DE at `/de/`. Everything language-specific lives in `src/i18n/`:

- `en.ts` and `de.ts` hold every string on the home page, typed against `Messages` in `messages.ts`, so a key missing from either fails `pnpm typecheck`. Components read them through `useMessages()` and hold no copy of their own. Change wording in the dictionaries, in both languages.
- The language comes from the URL (`langFromPath` in `paths.ts`): the prerender passes it to `render(lang)`, the client reads `location.pathname` before hydrating, so both sides always agree.
- `head.ts` renders the language-dependent `<head>` (title, description, canonical, hreflang, Open Graph, Twitter, Person JSON-LD) from the dictionaries. `index.html` holds only the markers; the `i18nHead` plugin in `vite.config.ts` fills them with English in dev and build, and the prerender replaces the block for German. In dev, `/de/` therefore renders German content under the English head; only the build is exact.
- `inline.ts` is the one script on every home and article page. A stored choice of German (`localStorage.lang === 'de'`) replaces the English page with `/de` + path before it paints. With no stored choice and a browser that prefers German (`navigator.languages`, nothing else: no IP lookup, no time zone), it shows a bar at the bottom offering the German page. Detection never navigates and never stores anything; only a click does. It builds the bar at runtime, so the bar is never in prerendered HTML. It is ES5 and tested as a string in `inline.test.ts`.
- The header switcher (`EN / DE`) and the switchers on the static pages are real links that also store the choice on click.
- The Datenschutzerklärung and its translation describe that stored value. If what is stored changes, update both.

The German copy follows the German CV model in `scripts/build-cv-pages.ts` where they say the same thing. The editorial rules below apply to German too: "wir" / "unser Team" for delivery claims, no dashes in prose.

## Content source of truth

Site copy is a deliberate **copy** of the Word CV, not a live import. The Word CVs live in a private folder outside this repository and must never become a build dependency of a public repo, so nothing here reads a `.docx`.

He versions his CVs by number (`Luka_Engels_CV_13.docx`, then `_14`, and so on) and never overwrites an earlier one, so any hardcoded filename goes stale. The `SYNCED_FROM` constant at the top of `scripts/build-cv-pages.ts` records which document the content was last reconciled against. When a higher-numbered CV exists in the Job Search folder, re-read it, update the content model and the React components, then bump `SYNCED_FROM`. Nothing breaks if that is missed, the pages simply keep saying what they said last time.

Editorial rules that apply to everything with his name on it:

- **No em dashes or en dashes in prose.** Rewrite with commas, colons, semicolons or a full stop. Exceptions: date ranges (`Sep 2024 – Present`) and structural separators in titles.
- **Collective voice for delivery claims.** "we" / "our team" for anything the team shipped. First person singular only for his title, leadership scope, what he is looking for, and his working style.
- Headline everywhere: `Lead Software Engineer · Agentic AI & LLM Platforms · TypeScript / AWS`. Python is deliberately not in the headline.
- Citizenship (German and Croatian) is stated on the site and in both CV pages.
- He is looking for permanent, fully remote employment only. Never describe him as available for freelance, contract or project work, and never claim immediate availability.

## Articles

Articles are Markdown in `content/articles/<slug>.md` with YAML frontmatter: `title`, `description`, `date`, `tags`, plus the optional `coverImage` (a path under `public/`), `devtoPublished`, `devtoUrl` and `repoUrl` (linked as a second button in the home page listing). `pnpm articles` turns each one into:

- `public/writing/<slug>/index.html`, the canonical page, served at `https://luka-engels.de/writing/<slug>/`
- `public/de/writing/<slug>/index.html`, always, so a visitor redirected to `/de` + path never lands on a 404 (see below)
- `content/devto/<slug>.md`, a dev.to-ready copy with dev.to's own frontmatter keys and `canonical_url` already pointing back here, from the English source only
- `src/content/articles.json`, `{ "en": [...], "de": [...] }`, which `Writing.tsx` imports to render the listing on the home page
- `public/sitemap.xml`, the whole sitemap, with hreflang alternates for every translated pair

**German translations are optional.** `content/articles/<slug>.de.md` is the German version: same slug, its own `title`, `description` and optionally `tags`; `date`, `coverImage` and `repoUrl` fall back to the English file, `devtoUrl` does not. With a translation, both pages declare each other as hreflang alternates. Without one, the German route shows the English body in German chrome with a note, its canonical points at the English page, and the sitemap leaves it out. A `.de.md` without an English sibling fails the build.

**Adding an article is: drop a `.md` file in `content/articles/` (and optionally its `.de.md`), run `pnpm articles`, add the URL to `public/llms.txt`.** Everything under `public/writing/`, `public/de/writing/`, `content/devto/`, `src/content/articles.json` and `public/sitemap.xml` is generated; do not hand-edit it. A new static page outside the generator goes into the sitemap list at the end of `scripts/build-articles.ts`.

**The slug is the canonical URL, so never rename a published article's file.** The title can change freely; `content/articles/gates-not-prompts.md` keeps that slug even though the title no longer contains those words, because `https://luka-engels.de/writing/gates-not-prompts/` is what the dev.to cross-post points at.

**`coverImage` is validated.** A declared cover that is not on disk fails the build rather than shipping a broken hero image and a broken `og:image` that every share preview would silently fall back from. When set, the page gets the image as a hero, an absolute `og:image` and `twitter:image`, `summary_large_image` instead of `summary`, and an `image` entry in the JSON-LD; the listing card shows it too, and the dev.to copy gets the absolute URL.

**`Writing.tsx` declares its own `Article` type rather than inferring it from the JSON.** TypeScript would otherwise type the optional fields against whatever the current articles happen to set, so `coverImage`, `repoUrl` or `devtoUrl` would stop compiling the moment no article used one. Keep that type in step with `ArticleMeta` in the generator.

**The listing card is not one big anchor.** The buttons are real links, and an anchor inside an anchor is invalid HTML, so the cover, date, title and summary share one link and the buttons sit beside it.

**dev.to accepts at most four tags.** The site page has no such limit, so extra tags are fine here and the generator prints a warning naming the four dev.to will keep.

**luka-engels.de is canonical, dev.to is the cross-post.** The generated dev.to copy carries the canonical link, so the cross-post feeds this domain rather than competing with it. Publish here first. `devtoPublished: false` in the source keeps `published: false` in the generated copy until you flip it.

The pages are deliberately plain static HTML rather than React routes: no router to add, and a crawler reads them without executing anything, which is the same reason the home page is prerendered.

There is no syntax highlighter. Code blocks are styled monospace on a dark panel, which suits the site's black-and-white design and keeps a ~90 kB dependency out of a page whose job is to be read. Revisit only if an article genuinely needs it.

Fonts for the static pages are copied out of `@fontsource` into `public/fonts/` by the generator, so they stay in sync with the package and are never fetched from Google. See the styling note below.

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

`public/` is copied verbatim into `dist/`: images, `fonts/`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `llms.txt`, `CNAME`, `.nojekyll`, the four legal pages, the two CV pages and the generated article pages under `writing/` and `de/writing/`.

The legal pages come in pairs: `impressum.html` / `legal-notice.html` and `datenschutz.html` / `privacy.html`. The English ones are close translations of the German ones, section for section, with no "German version prevails" line. An edit to one is an edit to both. Images are referenced with root-relative paths (e.g. `/images/luka-web-bw.jpg`).

## Design system snapshot

`design-system/` is the site's visual language extracted for reuse in other apps: `tokens.json` (the source of truth for that folder), a `tokens.css` generated from it, the fonts, `le-*` component CSS, a hand-written React bundle and a README of usage rules. Nothing in the build reads it, so it does not follow changes to the site on its own: when colours, type or component styling change here, update `tokens.json` and the component files there too, and regenerate `tokens.css`.

## Deployment

GitHub Actions typechecks, runs `pnpm test`, builds, runs `pnpm test:build` against `dist/`, and deploys to GitHub Pages on every push to `main`. Custom domain `luka-engels.de` via `CNAME`.
