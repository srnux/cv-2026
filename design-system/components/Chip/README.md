# Chip

A static bordered label for a skill, a technology or a topic tag. It is not clickable; use `Button` size sm for anything that links.

Variants: **default** (ink border, 16px Inter Light, for skill lists), `size="sm"` (14px, technology lists on project cards), **quiet** (`rule-quiet` border, `ink-muted` text, 14px, article tags in the home listing), **tag** (uppercase Space Grotesk 12px, `tag-border`/`tag-ink`, article pages only).

**Consumer provides:** children (the label, as the source names it: "Node.js / NestJS", "AWS CDK"), optional `as="li"` inside a `.le-chips` list.

- Wrap chips in `<ul class="le-chips">` so they flow with an 8px gap.
- Never colour-code chips. They are all the same ink.

_Hand-written from cv-2026/src/components/Skills.tsx, src/components/Projects.tsx, src/components/Writing.tsx; article pages._
