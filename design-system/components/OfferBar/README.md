# OfferBar

A bar at the bottom of the viewport offering the page in another language, with an accept link and a dismiss button.

Shown only when the browser prefers that language and no choice is stored. It never navigates or stores anything on its own; only a click does.

**Consumer provides:** `message`, `acceptHref`, `acceptLabel`, `dismissLabel`, `onAccept`, `onDismiss`, `lang` of the message, `label` for the region, `fixed`.

- Black with a white top rule, whatever the section behind it. Accept is the solid (white) button, dismiss the outline.

_Hand-written from cv-2026/src/i18n/inline.ts._
