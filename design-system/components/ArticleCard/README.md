# ArticleCard

An entry in a writing listing: optional cover, meta line, title, summary, tags and action buttons, under a top ink rule.

The cover, meta, title and summary share one link; the buttons sit beside it as siblings, because an anchor inside an anchor is invalid HTML.

**Consumer provides:** `href`, `title`, `summary`, `meta` (date · reading time, e.g. "25 September 2026 · 11 min read"), optional `coverImage` (1200×500), `tags`, `actions` (Buttons: an outline "Read article", optionally a quiet "Repository").

- Title underlines on hover of the linked block.
- Summary in `ink-soft`; tags use the quiet `Chip`.
- Stack cards 32px apart inside `measure-list`.

_Hand-written from cv-2026/src/components/Writing.tsx._
