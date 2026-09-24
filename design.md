# Snip design tokens

## Core palette
- background: `#0b0a0e` near-black
- surface: `#121117` elevated panels, soft warm-gray
- surface-strong: `#17151b`
- text: `#f4efe9` warm white
- muted: `#c4b8b1` secondary text / helper text
- accent-1: `#ff9b7a` coral
- accent-2: `#ff6e8f` pink
- accent-3: `#ffb78a` peach/orange
- border: `rgba(255,255,255,0.08)`
- shadow: `0 24px 60px rgba(0,0,0,0.35)`

## Accent gradient
- `linear-gradient(90deg, rgba(255,155,122,0.22), rgba(255,110,143,0.22), rgba(255,183,138,0.18))`
- spread: full viewport width behind hero, fixed and full bleed

## Type scale
- hero headline: `clamp(2.6rem, 5vw, 4.8rem)`; weight `700` / `800`
- subtitle: `1.05rem`; color muted
- form input: `1.05rem`
- card headings: `1.1rem`
- table labels: uppercase small caps with letter spacing

## Layout tokens
- page width: `max-width: 1100px`
- content padding: `5rem 1.5rem 4rem`
- spacing scale: `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `3rem`, `4rem`
- radius: `18px` for notices, `26px` for panels/cards, `999px` for pill input/button
- border width: `1px`
- glow height: `36rem`

## Element mapping
- page header: hero section with centered headline + muted subline
- URL form: chat-style input with pill shape, attached action button, subtle glass panel
- result/error notices: rounded, high-contrast text blocks; success green tint, error coral tint
- links table: contained card panel with bordered rows and airy spacing

## Usage guidance
- Keep the page dark and minimal, with one warm glow behind the header.
- The glow should be fixed and full width; never contained inside a max-width column.
- Use generous whitespace and rounded corners to keep the UI airy and calm.
- Prefer clean sans-serif typography and soft contrast instead of heavy decoration.
