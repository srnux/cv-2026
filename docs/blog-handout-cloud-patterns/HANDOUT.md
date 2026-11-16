# Handout: two articles on cloud design patterns

You're working in the repository of Luka's personal site (luka-engels.de). Your job is to turn the material in this folder into **two published articles**, each in two forms:

1. A post on the personal site (the canonical version, interactive where possible)
2. A cross-post for dev.to (static, pointing back to the personal site as canonical)

Everything in this folder was prepared in an earlier session. The facts, structure and visuals are final. Your work is adaptation: fitting it to the site's stack, design and voice, then producing the dev.to variants.

---

## 0. Before you write anything

Already known: this repo is `cv-2026` (Vite, pnpm, Tailwind). Published articles live in `content/articles/` and their dev.to versions in `content/devto/` (see `gates-not-prompts.md` and `proptech-inquiry-agent.md` as the reference pair). Read `CLAUDE.md` first and follow its conventions over anything in this handout. This handout itself lives in `docs/blog-handout-cloud-patterns/` and is not part of the site build.

Explore the repository and answer these questions. Show Luka the answers and a short plan before you start editing.

- Which framework and content format does the site use (Astro, Next.js, Hugo, Eleventy, plain Markdown, MDX (Markdown with embedded components))?
- Where do posts live, and what front matter do existing posts use (title, date, tags, description, cover, draft flag)?
- How are images handled (a public folder, colocated assets, an image pipeline)?
- Can a post include custom HTML (HyperText Markup Language) or a script tag, or does it need a component wrapper (MDX component, Astro island, shortcode)?
- What are the site's colors, fonts and dark mode mechanism (class on `html`, `data-theme`, media query only)?
- Is there an existing "series" or "related posts" mechanism to link the two articles?
- Is there Node.js with Playwright available locally to re-render images? Luka works on Windows with PowerShell, so give him PowerShell commands.

---

## 1. Writing rules (Luka's own preferences, non-negotiable)

- **No semicolons** anywhere in prose: article text, headings, captions, alt text, front matter descriptions. Rewrite as two sentences or use a comma or a dash. This also applies to code comments in the article.
- **Every abbreviation is followed by its full name in brackets**, for example CQRS (Command Query Responsibility Segregation). The source files already do this. Never introduce a bare abbreviation. Before relaxing this to "first use per article", ask Luka.
- **One language per document.** Write in English. If Luka wants German versions, make separate files, never mixed.
- First-person voice is fine and fits the site ("in my projects I've seen…"), but don't invent experiences. Only use personal anecdotes Luka gives you.
- No hype words ("game-changer", "unlock", "seamless"). Plain, practical, engineer-to-engineer.

---

## 2. What's in this folder

```
HANDOUT.md                                  this file
content/
  source-01-cloud-patterns.md               all 20 patterns, grouped A to F, with connections
  source-02-saga.md                         Saga deep dive, examples, verified CDK code
assets/
  infographic/
    cloud-patterns-infographic.html         SOURCE of the infographic (themeable, see §3)
    render.js                               renders the HTML to PNG with Playwright
    cloud-design-patterns-grouped-light.png 3200 px wide, light theme
    cloud-design-patterns-grouped-dark.png  3200 px wide, dark theme
  saga/
    saga-stepper.js                         <saga-stepper> web component (no dependencies)
    demo.html                               minimal page that uses the component
    record-gifs.js + frames-to-gif.py       re-record the GIFs after restyling
    saga-{happy,credit,sign,deposit}-{light,dark}.gif   one GIF per scenario
    choreography-vs-orchestration.svg/.png  static comparison diagram
```

---

## 3. Adapting the infographic to the site

The infographic is an original design made for these articles. **Don't use the third-party "20 cloud design patterns" image** that inspired it. Only use the files here.

1. Open `cloud-patterns-infographic.html`. The `:root` block at the top holds the theme: `--page-bg`, `--ink`, `--muted`, `--accent`, `--card-bg`, `--card-border`, `--chip-bg`, `--font-body`, `--font-display`. A dark theme sits under `html[data-theme=dark]`.
2. Set these to the site's palette and fonts. Each group band carries its own color inline (`--c` main color, `--tl` light tint). Change those only if they clash with the site. They encode the groups, so keep six clearly different colors.
3. If the site uses a web font, load it in the HTML `<head>` so the render picks it up.
4. Render: `node render.js light 2 cloud-design-patterns-grouped-light.png` and the same with `dark`. The output is 3200 px wide, so let the site's image pipeline produce smaller sizes.
5. On the site, show the light or dark PNG (Portable Network Graphics) with a `<picture>` element and `prefers-color-scheme`, or follow the site's own dark mode mechanism. Link the image to the full-size file so readers can zoom.
6. Alt text (no semicolons): "Infographic of 20 cloud design patterns in six groups. A Resilience: Retry, Circuit Breaker, Bulkhead, Health Endpoint Monitoring. B Messaging and load: Queue-Based Load Leveling, Competing Consumers, Publisher-Subscriber. C Data: Cache-Aside, CQRS (Command Query Responsibility Segregation), Event Sourcing, Sharding. D Distributed transactions: Saga, Compensating Transaction. E Gateway and edge: Backends for Frontends, Gateway Routing, Gateway Aggregation, Gateway Offloading. F Operations and evolution: Sidecar, Strangler Fig, External Configuration Store."
7. Optional: render a cropped cover image for each article (dev.to recommends 1000 × 420, Open Graph images are usually 1200 × 630). A crop of the header plus one band works well. Verify the current dev.to recommendation.

---

## 4. Article 1: "20 cloud design patterns, grouped by the problem they solve"

Source: `content/source-01-cloud-patterns.md`

Title ideas (pick with Luka): "20 cloud design patterns, grouped by the problem they solve", "Cloud design patterns: a map, not a list". Don't claim "most used" without a source. It can't be proven.

Suggested structure:

1. **Intro** (short): why a flat list of 20 patterns is hard to learn, and why grouping by problem helps you choose.
2. **The infographic**, full width.
3. **One section per group (A to F).** For each pattern: what, when, where (concrete services), caution if any, connections. Keep the A1 to F3 numbering so readers can match the image.
4. **How the patterns cluster in practice:** the six combinations.
5. **Rule of thumb for choosing.**
6. **Teaser for article 2** at the end of the D section and in the closing paragraph, linking to the Saga article.
7. **Further reading.**

Personal site extras (only if they fit the site's style): anchor links per group, a small table of contents, the infographic's group letters as jump links.

---

## 5. Article 2: "The Saga pattern in practice"

Source: `content/source-02-saga.md`

Title ideas: "The Saga pattern in practice: compensations, pivots and the hard parts", "Distributed transactions without two-phase commit: the Saga pattern".

Suggested structure:

1. **Intro:** why ACID (Atomicity, Consistency, Isolation, Durability) breaks with a database per service, and a link back to article 1 (Saga is D1).
2. **The three kinds of steps** (compensatable, pivot, retriable). This is the core idea.
3. **Interactive demo** on the personal site: `<saga-stepper>`. Introduce it in one sentence ("click a scenario and watch what gets undone").
4. **Choreography versus orchestration** with `choreography-vs-orchestration` diagram.
5. **Where Sagas are used:** seven examples. Rental onboarding is the running example that matches the demo.
6. **Implementation with AWS (Amazon Web Services) Step Functions and the AWS CDK (Cloud Development Kit).** The code type-checks with `tsc --strict` and synthesises with `aws-cdk-lib` 2.277.0. If the site has a newer major version in mind, re-check.
7. **The hard parts:** seven production pitfalls.
8. **When not to use a Saga.**
9. **Connections to the other patterns,** linking back to article 1.
10. **Further reading.**

### Embedding the stepper on the personal site

- Copy `saga-stepper.js` into the site's static scripts folder and load it as a module only on this post: `<script type="module" src="/js/saga-stepper.js"></script>` then `<saga-stepper></saga-stepper>`.
- In MDX or Astro, wrap it in a tiny component that renders the tag and loads the script on the client.
- Theming: set `--saga-font`, `--saga-text`, `--saga-muted`, `--saga-card`, `--saga-surface`, `--saga-border` and the state colors (`--saga-run-*`, `--saga-ok-*`, `--saga-bad-*`, `--saga-cmp-*`, `--saga-pivot-*`) on the element or a parent to match the site. The full list is in the file header.
- Dark mode: by default it follows `prefers-color-scheme`. If the site toggles dark mode with a class or attribute, set `theme="dark"` or `theme="light"` on the element to match, for example from the site's theme toggle script.
- It's responsive. Below 720 px the five steps stack vertically.
- It respects `prefers-reduced-motion`, announces log lines through `aria-live`, and fires a `saga-finished` event.
- Provide a fallback for readers without JavaScript: a `<noscript>` with the `saga-sign-light.gif`.

### If you restyle the stepper, re-record the GIFs (Graphics Interchange Format animations)

PowerShell, from `assets/saga`:

```powershell
npm install playwright
npx playwright install chromium
pip install pillow
Start-Process python -ArgumentList '-m','http.server','8765'
node record-gifs.js light
node record-gifs.js dark
```

`record-gifs.js` calls `python3` to assemble the GIFs. On Windows change it to `python` (or `py`) if `python3` isn't available.

---

## 6. dev.to versions

dev.to renders Markdown with its own Liquid tags. It **doesn't run custom JavaScript or arbitrary HTML**, so the stepper can't be embedded there. Use the GIFs and link to the interactive version on the personal site.

Front matter for each dev.to post:

```yaml
---
title: "…"
published: false
description: "…"            # one sentence, no semicolons
tags: architecture, cloud, aws, microservices   # max 4, lowercase, no spaces
canonical_url: https://luka-engels.de/…         # the personal site URL, so search engines credit the original
cover_image: https://…                           # absolute URL
series: Cloud design patterns                    # links both posts on dev.to
---
```

- Keep `published: false` until Luka has reviewed the draft.
- Images must be absolute URLs (Uniform Resource Locators) (uploaded to dev.to or served from the personal site).
- Replace the stepper with the four GIFs, each with a one-line caption, then: "Try the interactive version on my site: [link]".
- Replace the infographic with the light PNG (dev.to readers can switch themes, and the light version reads well in both).
- Use fenced code blocks with a language tag (`typescript`, `powershell`).
- Use `{% embed https://… %}` only for links that should render as cards.
- Check the current dev.to editor guide for front matter and Liquid tag syntax. Details change over time.

Save the dev.to versions next to the existing ones in `content/devto/`, using the same file name as the matching article in `content/articles/`. Luka pastes them into dev.to or publishes them with the dev.to API (Application Programming Interface).

---

## 7. Facts to double-check before publishing

These were correct as of November 2026, but verify quickly:

- Further reading URLs in both source files (Microsoft Learn, AWS Prescriptive Guidance, microservices.io).
- dev.to cover image size and front matter fields.
- The CDK code (re-run `tsc` if the site's own version of `aws-cdk-lib` differs).

---

## 8. Definition of done

- [ ] Repo conventions confirmed with Luka (framework, content folder, front matter, images, dark mode)
- [ ] Infographic re-themed to the site and rendered in light and dark
- [ ] Article 1 on the site, with infographic, alt text, A to F sections and a link to article 2
- [ ] Article 2 on the site, with working `<saga-stepper>` in light and dark mode and on mobile width, a `<noscript>` fallback, the diagram, the code and a link to article 1
- [ ] Both dev.to Markdown files with canonical URLs, `series`, at most 4 tags, GIFs instead of the stepper, `published: false`
- [ ] Prose scan: no semicolons (`Select-String -Pattern ';'` on the Markdown, ignoring code blocks) and no bare abbreviations
- [ ] Site builds locally without errors, and the article pages have been checked in a browser
- [ ] Luka has reviewed both drafts before anything is published or pushed
