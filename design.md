# Snip design language

## Tokens
- Color: background `#0c0b0f`; surface `rgba(20,18,23,0.88)`; surface-strong `#1a171d`; text `#f8f4f1`; muted `#b9afb3`; coral `#ff8a72`; pink `#f65f8d`; amber `#ffb36b`; border `rgba(255,255,255,0.10)`.
- Accent: `linear-gradient(115deg, #ff8a72 0%, #f65f8d 52%, #ffb36b 100%)`. Use solid warm color only for links and small labels; reserve the full gradient for the primary action and ambient glow.
- Font: `"Avenir Next", Avenir, "Segoe UI", Helvetica, Arial, sans-serif`. Hero `4.5rem/1.03 750` (`3rem` mobile); body and input `1.0625rem/1.6`; card title `1.125rem/1.3 700`; label `0.75rem/1.3 700`.
- Space: `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `3rem`, `4rem`, `6rem`; content width `68.75rem`; working width `53.75rem`.
- Radius: control `999px`; notice `1rem`; card `1.75rem`; compact/mobile control `1.5rem`.
- Edge: `1px solid rgba(255,255,255,0.10)`; divider `rgba(255,255,255,0.07)`.
- Depth: card `0 24px 70px rgba(0,0,0,0.38)`; control `0 18px 60px rgba(0,0,0,0.34)`; action glow `0 12px 30px rgba(246,95,141,0.25)`.
- Hero glow: fixed `40rem`-high, full-viewport band using broad coral, pink, and amber radial gradients fading into the page background. It must use `position: fixed; top: 0; left: 0; right: 0; pointer-events: none`; never place or size it relative to the centered content.

## Snip mapping
- Header: centered hero with a small coral product label, one bold headline, one muted sentence, and generous top space.
- URL form: the visual centerpiece; a large dark translucent pill, subtle border, attached gradient action, and warm focus ring.
- Result/error: compact rounded notices below the form; green-tinted success and coral-tinted error with readable high-contrast text.
- Links table: one generously rounded surface card with quiet dividers, muted labels, warm links, and horizontal overflow on small screens.

Keep decoration limited to the ambient glow. Preserve open space, soft contrast, clear focus states, and a single dominant action.
