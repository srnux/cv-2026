# Icon

An inline SVG icon from the system's small set, drawn in `currentColor`.

Names: `mail`, `location`, `check-circle`, `print`, `linkedin`, `github`. Stroke widths are fixed per icon as the source draws them (1px, 2px for check-circle, 1.5px for print).

**Consumer provides:** `name`, optional `size` (24 default; 20 in lists and the footer; 16 in buttons; 14 for the header print link), optional `label` when the icon stands alone (otherwise it is `aria-hidden`).

- Icons sit 16px left of their text (8px in lists).
- No emoji, no filled or duotone icon sets.

_Hand-written from cv-2026/src/components/Contact.tsx, src/components/Education.tsx, src/components/Header.tsx, src/components/Footer.tsx._
