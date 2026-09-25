# Luka Engels - Personal Portfolio, Curriculum Vitae

**Live:** [luka-engels.de](https://luka-engels.de)

## About

This repository contains the source code for my personal portfolio and online CV. It serves as a central place to present my professional background, including work experience, technical skills, education, and selected projects.

The site is a single-page application with a dark, minimal aesthetic. It is prerendered at build time so that crawlers, applicant tracking systems and LLM-based screeners see the full content rather than an empty page, and it ships two printable A4 CVs in English and German.

## Tech Stack

- **React 18** with TypeScript
- **Vite 5** for build and dev server
- **TailwindCSS 3** for styling
- **Self-hosted fonts** via `@fontsource`, no third-party font requests
- **GitHub Pages** hosting via GitHub Actions

## Development

```bash
pnpm install
pnpm dev          # local dev server
pnpm build        # production build with prerendering → dist/
pnpm cv           # regenerate the two printable A4 CV pages
pnpm articles     # regenerate the article pages and dev.to copies
pnpm typecheck    # TypeScript over src/ and scripts/
pnpm preview      # preview production build locally
pnpm lint         # ESLint
```

## Prerendering

`pnpm build` runs three steps: the client build, an SSR build of `src/entry-server.tsx`, and `scripts/prerender.ts`, which renders the app to a string and injects it into `dist/index.html`. The client hydrates that markup instead of creating it.

Without this step the deployed document is an empty `<div id="root">`, which matters because the site is linked from every CV and application I send.

## Printable CVs

`public/cv-luka-engels-en.html` and `public/cv-luka-engels-de.html` are **generated files**. Edit the content model in `scripts/build-cv-pages.ts` and regenerate both:

```bash
pnpm cv
```

The content model is a deliberate copy of my Word CV rather than a live import, since that document lives outside this repository. `SYNCED_FROM` in the script records which version it was last reconciled against.

## Articles

Articles live as Markdown in `content/articles/`. `pnpm articles` renders each into a static page under `public/writing/<slug>/`, emits a dev.to-ready copy in `content/devto/` with `canonical_url` pointing back at this site, and refreshes `src/content/articles.json`, which the Writing section on the home page reads.

This site is the canonical home for anything I write; dev.to is a cross-post.

## Contact form

The form posts to Web3Forms when `VITE_WEB3FORMS_KEY` is available at build time, and otherwise falls back to opening the visitor's own mail client. In CI the value comes from the `VITE_WEB3FORMS_KEY` repository secret.

## Deployment

Automated via GitHub Actions. Every push to `main` triggers a build and deploy to GitHub Pages. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Project Structure

```
scripts/
├── prerender.ts          # Injects prerendered markup into dist/index.html
├── build-cv-pages.ts     # Generates the two A4 CV pages in public/
├── build-articles.ts     # Renders content/articles/*.md into public/writing/
└── cv-styles.css         # Base stylesheet for the generated CV pages

content/
├── articles/             # Article sources (Markdown + frontmatter)
└── devto/                # Generated dev.to copies with canonical_url

src/
├── App.tsx               # Root component
├── index.tsx             # Client entry, hydrates prerendered markup
├── entry-server.tsx      # SSR entry used by the prerender step
├── index.css             # Font imports, global styles, print media queries
└── components/
    ├── Header.tsx        # Sticky nav with scroll detection, CV language switcher
    ├── Hero.tsx          # Landing section with portrait and focus areas
    ├── About.tsx         # Profile text and key facts
    ├── Experience.tsx    # Work history, earlier roles collapsed but present in the DOM
    ├── Skills.tsx        # Technical skills by category
    ├── Education.tsx     # Education, certifications, languages, citizenship
    ├── Projects.tsx      # Portfolio highlights
    ├── Writing.tsx       # Article listing, reads src/content/articles.json
    ├── Contact.tsx       # Contact details and form
    └── Footer.tsx        # Footer with legal links

public/
├── cv-luka-engels-en.html / -de.html   # Generated A4 CVs
├── impressum.html / datenschutz.html   # Legal pages
├── llms.txt, robots.txt, sitemap.xml   # Machine-readable metadata
└── images/, favicon.svg, CNAME, .nojekyll
```

## License

All rights reserved.
