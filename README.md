# Luka Engels - Personal Portfolio, Curriculum Vitae

**Live:** [luka-engels.de](https://luka-engels.de)

## About

This repository contains the source code for my personal portfolio and online CV. It serves as a central place to present my professional background — including work experience, technical skills, education, and selected projects — to potential employers, clients, and collaborators.

The site is designed as a single-page application with a dark, minimal aesthetic. It also functions as a printable CV with dedicated print styles and supports both German and English exports.

## Tech Stack

- **React 18** with TypeScript
- **Vite 5** — build and dev server
- **TailwindCSS 3** — utility-first styling
- **GitHub Pages** — hosting via GitHub Actions

## Development

```bash
pnpm install
pnpm dev          # local dev server
pnpm build        # production build → dist/
pnpm preview      # preview production build locally
pnpm lint         # ESLint
```

## Deployment

Automated via GitHub Actions — every push to `main` triggers a build and deploy to GitHub Pages. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Project Structure

```
src/
├── App.tsx              # Root component
├── index.tsx            # Entry point
├── index.css            # Global styles + print media queries
└── components/
    ├── Header.tsx       # Sticky nav with scroll detection, CV language switcher
    ├── Hero.tsx         # Landing section with profile image
    ├── About.tsx        # About me
    ├── Experience.tsx   # Work history
    ├── Skills.tsx       # Technical skills by category
    ├── Education.tsx    # Education background
    ├── Projects.tsx     # Project showcase
    ├── Contact.tsx      # Contact form
    └── Footer.tsx       # Footer
```

## License

All rights reserved.
