# TMH — The Millennial Hub · Brand spec

## Brand identity

- **Name:** The Millennial Hub (TMH)
- **Tagline:** "A to Z of Digital Marketing"
- **Domain:** Premium digital marketing & behavioural training
- **Audience:** Premium clients, digital-first brands, corporate HR teams
- **Tone:** Confident, modern, trustworthy, cinematic, premium

## Color tokens

| Token | Hex | OKLch | Usage |
|-------|-----|-------|-------|
| `--bg` | `#000000` | `oklch(0% 0 0)` | Page background |
| `--surface` | `#0a0a0a` | `oklch(8% 0.005 0)` | Card / section surface |
| `--fg` | `#ffffff` | `oklch(100% 0 0)` | Primary text |
| `--muted` | `#d1d1d1` | `oklch(82% 0 0)` | Secondary / body text |
| `--border` | `#1a1a1a` | `oklch(15% 0 0)` | Subtle borders |
| `--accent` | `#ff2b2b` | `oklch(58% 0.22 29)` | Primary accent (red) |
| `--accent-dark` | `#b30000` | `oklch(38% 0.18 29)` | Secondary / hover accent |
| `--glow` | — | `oklch(58% 0.22 29)` | Red glow (used via box-shadow / filter) |

## Typography

- **Display:** Space Grotesk, bold condensed weight, tight tracking
- **Body:** Inter, clean readable weight
- **Fallback:** system-ui, sans-serif

## Layout posture

- Dark canvas, glassmorphism card surfaces with subtle backdrop-blur
- Thin 1px borders with red glow on interactive elements
- Layered depth with z-index stacking and staggered reveals
- Smooth rounded corners (12px cards, 8px buttons, 24px sections)
- One decisive red glow per viewport section — never more
- Strong typographic hierarchy: 64–96px headlines, 18–24px body
- Ample vertical spacing (clamp-based)
- Floating gradient orbs as subtle background atmosphere
- No stock imagery — abstract geometric / data-visual shapes only
- Scroll-triggered fade-in animations (IntersectionObserver)
