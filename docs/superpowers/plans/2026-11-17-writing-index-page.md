# Writing Index Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the full article cards to a generated `/writing/` index page (English and German) and shrink the home page Writing section to a compact text list of all articles.

**Architecture:** `scripts/build-articles.ts` already writes every article page as static HTML; it gains an `indexPage(lang, articles)` template and writes `public/writing/index.html` and `public/de/writing/index.html` from the same `listing` it puts in `articles.json`. `Writing.tsx` keeps reading `articles.json` but renders a compact list. All "Articles" links (header, footer, article page chrome) go to the index through one helper, `writingPath(lang)`.

**Tech Stack:** TypeScript, React 18, Vite, Tailwind, tsx, Vitest, marked, gray-matter.

**Spec:** `docs/superpowers/specs/2026-11-17-writing-index-page-design.md`

## Global Constraints

- Read `CLAUDE.md` first. pnpm only; never `npm install`.
- No em dashes or en dashes in prose (new copy in both languages). The existing `Title — Luka Engels` separator in `<title>` is a structural separator and is allowed.
- Every user-visible string exists in English and German.
- No router, no React route. The index page is static HTML that needs no JavaScript to show its content.
- Everything under `public/writing/`, `public/de/writing/`, `content/devto/`, `src/content/articles.json`, `public/sitemap.xml` is generated: change the generator and run `pnpm articles`, never hand-edit.
- Home page: all articles visible, no collapsing, no "All articles" link, no covers, tags or buttons. Keep `id="writing"` on the section.
- No render-time access to `window`, `document` or `localStorage` in components (prerendered).

## Review Focus

1. A visitor with German stored lands on `/writing/` and the inline script sends them to `/de/writing/`: that page must exist. (Task 1 test: `de/writing/index.html` exists, `lang="de-DE"`.)
2. An untranslated article on the German index and German home list: marked "Artikel auf Englisch", with `lang="en-GB"` on its title, and its link goes to `/de/writing/<slug>/` (the fallback page), not the English page. (Task 1 and Task 2 tests.)
3. A title or description containing `&`, `<` or `"` must be HTML-escaped on the index page. (Task 1 test: each listing title appears as `escapeHtml(title)`.)
4. German home page header and footer "Artikel" links go to `/de/writing/`, never `/writing/`. (Task 2 test.)
5. Old links to `/#writing` (dev.to, shared URLs) still land on the section. (Task 2 test: home root still contains `id="writing"`.)

---

### Task 1: Generated index pages

**Files:**
- Modify: `src/i18n/paths.ts` (add `writingPath`)
- Test: `src/i18n/paths.test.ts`
- Modify: `scripts/build-articles.ts` (`CHROME`, new `indexPage`, write loop, sitemap)
- Modify: `public/llms.txt`
- Test: `tests/build-output.test.ts`
- Regenerated: `public/writing/**`, `public/de/writing/**`, `public/sitemap.xml`

**Interfaces:**
- Produces: `export const writingPath = (lang: Lang): string` in `src/i18n/paths.ts`, returning `'/writing/'` for `en` and `'/de/writing/'` for `de`. Task 2 uses it in `Header.tsx` and `Footer.tsx`.
- Produces: index pages at `/writing/` and `/de/writing/`; every card links `ArticleMeta.url`.

- [ ] **Step 1: Write the failing unit test** in `src/i18n/paths.test.ts`:

```ts
it('writingPath points at the index page in each language', () => {
  expect(writingPath('en')).toBe('/writing/');
  expect(writingPath('de')).toBe('/de/writing/');
});
```

- [ ] **Step 2: Run it, expect FAIL** (`writingPath` is not exported): `pnpm test`

- [ ] **Step 3: Add `writingPath` to `src/i18n/paths.ts`**, next to `homePath`.

- [ ] **Step 4: Run, expect PASS:** `pnpm test`

- [ ] **Step 5: Write the failing build tests** in `tests/build-output.test.ts`. First hoist `listing` (read from `src/content/articles.json`, typed with `title` added) and a local `escapeHtml` (same four replacements as the generator) to module level, next to `read`, so the `articles` block and Task 2's tests share them. Then a new `describe('writing index', ...)`:

```ts
it.each([['en', 'writing/index.html', 'en-GB'], ['de', 'de/writing/index.html', 'de-DE']] as const)(
  '%s index page exists, is in its language and links every article',
  (lang, path, htmlLang) => {
    const html = read(path);
    expect(html).toContain(`<html lang="${htmlLang}">`);
    for (const a of listing[lang]) {
      expect(html).toContain(`href="${a.url}"`);
      expect(html).toContain(escapeHtml(a.title));
    }
  },
);

it('index pages are hreflang alternates with their own canonicals', () => {
  const en = read('writing/index.html');
  const de = read('de/writing/index.html');
  expect(en).toContain(`<link rel="canonical" href="${SITE}/writing/">`);
  expect(de).toContain(`<link rel="canonical" href="${SITE}/de/writing/">`);
  expect(en).toContain(`<link rel="alternate" hreflang="de-DE" href="${SITE}/de/writing/">`);
  expect(de).toContain(`<link rel="alternate" hreflang="en-GB" href="${SITE}/writing/">`);
});

it('German index marks English-only articles', () => {
  const de = read('de/writing/index.html');
  if (listing.de.some(a => a.lang === 'en')) expect(de).toContain('Artikel auf Englisch');
});

it('sitemap lists both index pages', () => {
  const xml = read('sitemap.xml');
  expect(xml).toContain(`<loc>${SITE}/writing/</loc>`);
  expect(xml).toContain(`<loc>${SITE}/de/writing/</loc>`);
});
```

Also change the existing assertion in the `articles` block from `'<a class="back" href="/de/#writing">'` to `'<a class="back" href="/de/writing/">'`, and add `expect(en).toContain('<a class="back" href="/writing/">')`.

- [ ] **Step 6: Run, expect FAIL** (index pages missing): `pnpm build && pnpm test:build`

- [ ] **Step 7: Extend `CHROME` in `scripts/build-articles.ts`.** Set `writing` to `writingPath(lang)` (import from `../src/i18n/paths`; also rewrite `articleUrl` as `` `${writingPath(lang)}${slug}/` ``). Add these keys with exactly this copy:

| key | en | de |
|---|---|---|
| `indexTitle` | `Articles` | `Artikel` |
| `indexIntro` | `On technology, work, and the ideas shaping both.` | `Über Technologie, Arbeit und die Ideen, die beide prägen.` |
| `indexDescription` | `Articles by Luka Engels on agentic AI, LLM platforms and cloud architecture.` | `Artikel von Luka Engels über agentische KI, LLM-Plattformen und Cloud-Architektur.` |
| `read` | `Read the article` | `Artikel lesen` |
| `repo` | `GitHub Repo` | `GitHub-Repo` |
| `englishOnlyMark` | `''` | `Artikel auf Englisch` |

- [ ] **Step 8: Implement `indexPage(lang: Lang, articles: ArticleMeta[]): string`** in `scripts/build-articles.ts`, below `page()`. It reuses `STYLES`, `I18N_STYLES`, `languageScript`, the same topbar (back link to `CHROME[lang].home` labelled `AUTHOR`, language switcher between `/writing/` and `/de/writing/` built like the one in `page()`; factor the switcher into a shared `switcher(pageLang, urls)` helper rather than copying it), and a generated-file comment. Head: `<title>${indexTitle} — ${AUTHOR}</title>`, description, canonical `${SITE}${writingPath(lang)}`, hreflang en-GB, de-DE and x-default (→ `/writing/`), `og:type` `website`, `og:url`, `og:title`, `og:description`, `og:locale`, `twitter:card` `summary`. No JSON-LD. Body: `<h1>` with `indexTitle`, `.lede` with `indexIntro`, then one card per article mirroring today's home card in `src/components/Writing.tsx`: one `<a>` around cover (`width="1200" height="500" loading="lazy"`, `alt=""`, only when `coverImage`), meta line `displayDate · minRead(readingMinutes)` plus ` · englishOnlyMark` when `article.lang !== lang`, `<h2>` title and description (both with `lang="${HTML_LANG[article.lang]}"` when `article.lang !== lang`); then the tags as `<ul class="tags">`, then the `read` button and, when `repoUrl` is set, a `repo` button with `target="_blank" rel="noopener noreferrer"`. All text through `escapeHtml`. Add the card CSS to a new `INDEX_STYLES` constant, matching the black and white style of the article pages.

- [ ] **Step 9: Write the index pages and the sitemap entry.** After the `listing` sort, for each lang write `indexPage(lang, listing[lang])` to `resolve(PUBLIC, \`.${writingPath(lang)}\`, 'index.html')` and log it. In `buildSitemap([...])`, add after the CV pair: `...pair(\`${SITE}/writing/\`, \`${SITE}/de/writing/\`, { lastmod: listing.en[0].date, changefreq: 'monthly', priority: '0.9' })`.

- [ ] **Step 10: Add the index to `public/llms.txt`** as the first line under `## Writing`: `- [All articles](https://luka-engels.de/writing/): Index of every article, newest first.`

- [ ] **Step 11: Regenerate and verify:** `pnpm articles && pnpm typecheck && pnpm test && pnpm build && pnpm test:build`. Expected: all pass. Running `pnpm articles` a second time gives no `git diff`.

- [ ] **Step 12: Commit**

```bash
git add src/i18n/paths.ts src/i18n/paths.test.ts scripts/build-articles.ts tests/build-output.test.ts public/llms.txt public/writing public/de/writing public/sitemap.xml
git commit -m "writing: generated index page at /writing/ and /de/writing/"
```

---

### Task 2: Compact home list and nav links

**Files:**
- Modify: `src/components/Writing.tsx`
- Modify: `src/components/Header.tsx:66`, `src/components/Footer.tsx:43`
- Modify: `src/i18n/messages.ts`, `src/i18n/en.ts`, `src/i18n/de.ts` (`writing` block)
- Modify: `src/index.css` (print rule for `#writing`)
- Modify: `CLAUDE.md` (Articles section)
- Test: `tests/build-output.test.ts`

**Interfaces:**
- Consumes: `writingPath(lang)` from Task 1; `articles.json` unchanged in shape.

- [ ] **Step 1: Write the failing build tests**, new `describe('home writing list', ...)`:

```ts
it.each([['en', 'index.html'], ['de', 'de/index.html']] as const)('%s home lists every article compactly', (lang, path) => {
  const root = rootOf(read(path));
  expect(root).toContain('id="writing"');
  for (const a of listing[lang]) {
    expect(root).toContain(`href="${a.url}"`);
    expect(root).toContain(escapeHtml(a.title));
  }
  expect(root).not.toMatch(/<img[^>]+src="\/images\/writing\//); // no covers on the home page
  expect(root).not.toContain('Read the article');
  expect(root).not.toContain('Artikel lesen');
});

it('nav links go to the index page in the page language', () => {
  expect(rootOf(read('index.html'))).toContain('href="/writing/"');
  const de = rootOf(read('de/index.html'));
  expect(de).toContain('href="/de/writing/"');
  expect(de).not.toContain('href="/writing/"');
});
```

Covers live under `/images/writing/` (checked in all four articles).

- [ ] **Step 2: Run, expect FAIL:** `pnpm build && pnpm test:build`

- [ ] **Step 3: Remove `minRead`, `read` and `repo` from `writing` in `messages.ts`, `en.ts` and `de.ts`.** Keep `heading`, `intro`, `englishOnly`.

- [ ] **Step 4: Rewrite the list in `Writing.tsx`.** Same section, heading and intro. Replace the cards with a list (`<ul>`/`<li>`), newest first, each item a single `<a href={article.url}>` containing: date (`displayDate`, plus ` · {m.englishOnly}` when `article.lang !== lang`), title, description; `lang` attribute on title and description when `article.lang !== lang`, as today. No image, tags or buttons. Keep the `Article` type as it is (it mirrors `ArticleMeta`) and update the header comment: the "not one big link" paragraph no longer applies here, it now describes the index page in the generator.

- [ ] **Step 5: Point the nav links at the index.** In `Header.tsx` and `Footer.tsx` replace `href="#writing"` with `href={writingPath(lang)}` (use `useLang()`; add it to `Footer.tsx` if missing).

- [ ] **Step 6: Print CSS.** In `src/index.css` remove the `#writing` page-break rule so the short list follows Projects without a forced page.

- [ ] **Step 7: Update `CLAUDE.md`.** In the Articles section: add `public/writing/index.html` and `public/de/writing/index.html` to the list of generated outputs; change the `repoUrl` note to "linked as a second button on the index page"; move "The listing card is not one big anchor" to describe the index page card; note that the home page shows a compact list of all articles without covers. Keep the editorial rules (no dashes).

- [ ] **Step 8: Verify:** `pnpm typecheck && pnpm test && pnpm build && pnpm test:build`. Expected: all pass. Then `pnpm dev`, open `http://localhost:6001/` and `/de/`, check the list, and click "Articles" in the header.

- [ ] **Step 9: Commit**

```bash
git add src/components/Writing.tsx src/components/Header.tsx src/components/Footer.tsx src/i18n src/index.css tests/build-output.test.ts CLAUDE.md
git commit -m "writing: compact article list on the home page, nav links to the index"
```
