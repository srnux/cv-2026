---
name: Deployment setup
description: GitHub Pages hosting with custom domain luka-engels.de, DNS on strato.de
type: project
---

Site is deployed to GitHub Pages via GitHub Actions workflow (`.github/workflows/deploy.yml`).

- **Hosting:** GitHub Pages (repo must stay public)
- **Domain:** luka-engels.de
- **DNS:** Managed at strato.de — single A record pointing to `185.199.108.153` (strato.de doesn't allow multiple A records or apex CNAME)
- **HTTPS:** Enforced via GitHub Pages (Let's Encrypt)
- **Build:** pnpm install + pnpm build → `dist/`
- **Important:** `public/.nojekyll` is required to prevent GitHub Pages Jekyll processing (causes MIME type errors on JS assets without it)
- **Image paths:** Hardcoded absolute paths like `/images/...` in components — these only work when served from root (`/`), not from a subdirectory like `/cv-2026/`

**Why:** User wanted cheap static hosting. GitHub Pages is free and integrates directly with the existing GitHub repo.
**How to apply:** Any deployment changes should maintain this setup. If ever serving from a subdirectory, use `import.meta.env.BASE_URL` for asset paths and set `base` in vite.config.ts.
