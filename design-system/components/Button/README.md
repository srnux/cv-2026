# Button

A square, 1px-bordered control that inverts to a solid ink fill on hover.

Variants: **outline** (default: ink border, transparent), **quiet** (`rule-quiet` border, `ink-soft` text, for a secondary action beside an outline one), **solid** (ink fill, `solid-hover` on hover; one per view, for the form's submit). Sizes: **sm** is the chip button in Space Grotesk 14px with 0.05em tracking (hero focus areas, "Read article", header "More"); **md** is 18px Inter Light with 12/32px padding (section-closing buttons, "Send").

**Consumer provides:** children (a short verb phrase, sentence case), `href` to render a link, else `onClick`/`type`; optional `icon` (an `Icon` name, drawn at 16px).

- Never rounded, never shadowed. Hover is the inversion, over 150ms.
- Focus: 2px `focus-ring` outline, 2px offset.
- Disabled: `opacity-disabled`, cursor not-allowed.
- Three dots ("...") is an accepted sm button label meaning "more", with an `aria-label`.

_Hand-written from cv-2026/src/components/Header.tsx, src/components/Hero.tsx, src/components/Experience.tsx, src/components/Contact.tsx, src/components/Writing.tsx._
