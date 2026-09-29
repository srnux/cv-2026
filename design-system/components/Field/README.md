# Field

A labelled text input or textarea: 18px Inter Light label above a transparent, square, 1px ink-bordered control.

**Consumer provides:** `id` (required, ties the label), `label`, optional `type`, `placeholder` (in `ink-muted`), `required`, `autoComplete`, `multiline` + `rows`, and `value`/`onChange` or `defaultValue`.

- Stack fields 24px apart; end the form with a solid md `Button`.
- Focus is a 2px `focus-ring` with 2px offset, never a colour change of the border.
- Status after submit goes in a polite live region as plain body text; no coloured alerts.
- A spam honeypot is a hidden text input, `tabIndex -1`, `aria-hidden`.

_Hand-written from cv-2026/src/components/Contact.tsx._
