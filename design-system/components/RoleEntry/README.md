# RoleEntry

One position in a career timeline: a top ink rule, meta in the left third, description and dot bullets in the right two thirds.

**Consumer provides:** `title`, `organisation`, `period` (en dash date range: "Sep 2024 – Present"), optional `location`, `context` (one small muted line: team size, domain), `description`, `highlights` (array of strings).

- Stack entries 48px apart. The top rule is the separator; no cards.
- Bullets are a middle dot (·) in `ink-muted`, 20px hanging indent.
- Collapsed older entries stay in the DOM with a `hidden` class so crawlers and print still read them.
- Copy uses "we" for what the team shipped; "I" only for the role, scope and working style.

_Hand-written from cv-2026/src/components/Experience.tsx._
