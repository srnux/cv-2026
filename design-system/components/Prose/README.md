# Prose

Long-form article typography: Inter 400 at 17px/1.75 in `prose-ink`, Space Grotesk 500 headings, a 2px-ruled pull quote, monospace code on a flat panel, bordered tables.

**Consumer provides:** rendered Markdown HTML as `html`, or children. Wrap the page in `.le-prose-page` on the dark ground, with a centred column capped at `measure-prose` and 48/20/96px padding (32/16/64px under 640px). Optional classes: `.le-prose-meta` for the date line, `.le-prose-lede` for the paragraph under the title, `.le-table-wrap` around tables, `.le-back` for the uppercase back link.

- No syntax highlighting. Code is monospace on `pre-surface`; that is the whole treatment.
- Links are ink with a 3px underline offset; the underline disappears on hover.
- Articles are dark-first; the white values are derived and untested in production.

_Hand-written from cv-2026/scripts/build-articles.ts (STYLES)._
