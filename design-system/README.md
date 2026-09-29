# Luka Engels Monochrome

The design system of luka-engels.de, extracted so another app can use it. This folder is a snapshot, not a build input: nothing in the site imports it, and the site's own styles stay in Tailwind classes, `src/index.css` and `scripts/build-articles.ts`.

- `tokens.json`: every token, both themes, with a usage note on each. The source of truth for this folder.
- `tokens.css`: CSS custom properties, `@font-face` rules and one `.le-<style>` class per text style, generated from `tokens.json`. Do not edit it by hand.
- `fonts/`: Inter and Space Grotesk woff2 files from `@fontsource` 5.3.0, self-hosted.
- `components/`: `bundle.css` (the `le-*` classes), `bundle.js` (React 18 components on `window.LE`), `index.d.ts` (props), and one README of guidelines per component.
- `assets/`: the mark, the favicon and the icons as SVG.

In another app: load `tokens.css` then `components/bundle.css`, and put `data-theme="dark"` or `"light"` on each section (or on `<html>`).

---

A strict black-and-white system for a personal engineering site: full-bleed bands that alternate between a black and a white ground, 1px ink borders, light-weight Space Grotesk headings over Inter Light body copy, and nothing else. No accent colour, no radius, no shadow, no gradient. The structure comes from borders and whitespace; headings stay quiet.

## Content fundamentals

- **Voice.** Plain, specific, a little dry. Claims come with numbers ("6,000+ customers", "an eleven-person cross-functional team") rather than adjectives.
- **Person.** "We" and "our team" for anything the team built or shipped ("We shipped a customer-facing agentic UI…"). "I" only for a personal title, leadership scope, what the person is looking for and their working style ("I hold the technical direction…").
- **No em dashes or en dashes in prose.** Use a comma, colon, semicolon or full stop. En dashes stay in date ranges (`Sep 2024 – Present`); a middle dot `·` separates items in meta lines (`25 September 2026 · 11 min read`) and taglines (`Agentic AI & LLM Platforms · TypeScript / AWS`).
- **Casing.** Section titles in Title Case ("Professional Experience", "Get In Touch"); buttons in sentence case with a verb first ("Read article", "Show earlier roles", "Send message"). Uppercase only for the eyebrow and tag styles on long-form pages.
- **No emoji.** Not in copy, not as icons, not as bullets. Bullets are a middle dot.
- **Bilingual.** Everything ships in English (en-GB) and German (de-DE) with the same structure. Keep strings out of components so both dictionaries stay complete.
- **Honesty lines.** Section intros set expectations in one sentence: "Everything below is in daily or recent production use, not a wish list."

## Visual foundations

### Colour

- The page is a stack of `Section`s alternating `ground` dark (black `#000000`) and light (white `#ffffff`). Set `data-theme="dark"` or `data-theme="light"` on the section; every token below re-scopes with it. The hero, header, footer and article pages are always black.
- `ink` for all text, headings, icons and structural lines. `rule` aliases `ink`: borders are full contrast, never grey.
- `ink-muted` for dates, locations, taglines, role context and section intros on black. `ink-soft` for summaries one step below ink.
- `rule-subtle` only for decorative separators (footer divider, definition-list rows). `rule-quiet` for secondary chips and the secondary button.
- The only hover colour change is the inversion: an outline control fills with `ink` and its text turns `ground`. The solid button's hover is `solid-hover`.
- Long-form pages use the `prose-*`, `code-*`, `pre-*`, `table-*` and `tag-*` tokens. They are dark-first; their white values are derived and not yet used in production.
- `print-*` tokens belong to the printable A4 CV only: `print-banner` for the name banner, `print-sidebar` for the left column, `print-ink` (never pure black) for text, `print-rule` for underlines.
- There are no semantic colours. Status is words: "Sending…", "Thank you. Your message is on its way…". If an app needs error or success states, express them with text and an icon first; any hue added must be listed as an intentional addition.

### Type

- Headings in `display` (Space Grotesk); body in `body` (Inter). Both are self-hosted from `fonts/`; never load them from Google Fonts (a DSGVO issue for a German site).
- Home-page headings are **light (300)**: `display-name`, `section-title`, `hero-title`. Titles of items step up to **medium (500)**: `card-title`, `item-title`. Nothing is bold on screen except `strong` in prose (Inter 600).
- Body copy is Inter **Light (300)** at 18px (`body-lg`) with 1.625 leading. 16px (`body`) for card details and chips, 14px (`small`) for context lines.
- `label` (Space Grotesk 14px, 0.05em tracking) for chip buttons, nav, the language switch and meta lines.
- Long-form pages switch to Inter 400 at 17px/1.75 (`prose`) and Space Grotesk 500 headings (`article-h1` … `article-h3`), with `pull-quote`, `eyebrow`, `tag` and `code`.
- Print uses Arial (`print` family) so output never depends on web fonts.

### Space and layout

- Section padding: 40/32px on phones, 48/64px from 768px, `section-pad-y`/`section-pad-x` (64/96px) from 1024px.
- 48px (`space-12`) between a section title and its content, and between stacked roles. 32px (`space-8`) card padding and grid gap. 8px (`space-2`) between chips.
- Two-column splits at 768px: a text column and a card column, or a one-third meta column and a two-thirds content column (`RoleEntry`).
- Section titles are centred; everything else is left-aligned.
- Long-form columns cap at `measure-prose` (48rem); listings at `measure-list`; centred intros at `measure-intro`.
- The hero is full viewport height with a greyscale portrait filling the left half. That is the only full-height element.

### Borders, radius, shadow, motion

- Every border is `border-hairline` (1px). The only 2px line is the blockquote rule and the focus ring.
- Radius is `radius-none` everywhere. `radius-code` (2px) exists for inline code only.
- No shadows. No gradients. No filled or tinted cards.
- Motion: colour inversion over 150ms on hover; the header slides in over 300ms. Nothing else animates. Respect `prefers-reduced-motion`.
- Focus: a 2px solid `focus-ring` outline with 2px offset on every interactive element.

### Imagery

- Photography is black and white (`grayscale`), contained, never cropped into circles.
- Article covers are 1200×500 with a `rule-subtle` 1px border.

## Iconography

- A small set of Heroicons v1 outline paths at a 24px grid (`mail`, `location`, `check-circle`, `print`) plus the LinkedIn and GitHub glyphs. Use the `Icon` component so they draw in `currentColor`.
- Stroke weights are thin and fixed per icon: 1px for mail and location, 1.5px for print, 2px for check-circle.
- The mark is a terminal prompt (a rectangle with `>` and `_`) at 24px and 1px stroke, always followed by the name in Space Grotesk 300. There is no wordmark; see `assets/Logos/`.
- No emoji and no decorative icons. An icon either labels a contact method or stands alone as a link with an `aria-label`.

## Using it in another app

- Load `tokens.css`, then `components/bundle.css`. Put `data-theme="dark"` or `"light"` on each section, or on `<html>` for a single-ground page.
- With React 18, load `components/bundle.js` after React and ReactDOM and use `window.LE.<Component>`. Without React, the classes in `bundle.css` (`le-btn`, `le-card`, `le-chip`, `le-role`, `le-prose` …) work on plain markup; each component's card shows the markup it renders.
- With Tailwind, keep default greys: the tokens map to `black`, `white`, `gray-300/400/500/600/800` and the `font-grotesk` / `font-inter` families.
- Prerendered or server-rendered pages: keep collapsed content in the DOM with a `hidden` class instead of unmounting it, so crawlers still read it.
