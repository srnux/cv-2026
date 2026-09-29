# Card

A 1px ink-bordered box with no fill, no shadow and no radius, holding a title and content.

Used for project highlights, skill groups and fact tiles. `compact` gives the fact-tile form (24px padding, 20px title, 16px body) used in a two-column grid beside the About text.

**Consumer provides:** `title`, optional `body` text, optional children (typically a `.le-chips` list or a small heading like "Technologies").

- Lay cards in `.le-grid .le-grid-2` (one column on phones, two from 768px, 32px gap). A lead card may span both columns.
- Body grows to push trailing chips to the bottom, so sibling cards align.
- Border only. A filled or grey card breaks the system.

_Hand-written from cv-2026/src/components/About.tsx, src/components/Projects.tsx, src/components/Skills.tsx._
