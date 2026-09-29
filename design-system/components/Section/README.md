# Section

A full-width band on a black or white ground that re-scopes every colour token.

Pages alternate grounds section by section: black, white, black, white. That alternation is the only colour the system has, so keep it strict: never two adjacent sections on the same ground, never a grey band.

**Consumer provides:** `ground` (`"dark"` | `"light"`, default dark), an `id` for in-page navigation, and children (usually a `SectionHeading` then content).

- Padding steps up with the viewport: 40/32px on phones, 48/64px from 768px, `section-pad-y`/`section-pad-x` from 1024px.
- Content sits in a centred container capped at `container-max`.
- Do not nest sections. Do not add borders between them; the ground change is the divider.

_Hand-written from cv-2026/src/components/Hero.tsx, src/components/About.tsx … (every section)._
