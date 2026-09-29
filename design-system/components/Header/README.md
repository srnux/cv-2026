# Header

The top bar: mark and name left, a few in-page links centre, actions right, on `header-scrim` (black at 90%) in every section.

On the site it is fixed and auto-hides: it slides in (300ms) once the page scrolls or the pointer enters the top 10% of the viewport. The consumer owns that behaviour; the component takes `fixed` and `hidden`.

**Consumer provides:** `name`, `homeHref`, `links` (`[{ href, label }]`, four at most, hidden under 768px), `actions` (typically an icon link, a `LanguageSwitch` and an sm `Button`), `fixed`, `hidden`.

- Text stays white whatever the section beneath.
- Links underline on hover; no active-state colour.

_Hand-written from cv-2026/src/components/Header.tsx._
