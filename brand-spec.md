# TMH — The Millennial Hub brand spec

## Color tokens (OKLch)

```css
:root {
  --bg:       oklch(10.8% 0.034 264);  /* #07111F deep navy */
  --surface:  oklch(14.5% 0.028 264);  /* #0D1B2D card surface */
  --fg:       oklch(100% 0 0);         /* #FFF text */
  --muted:    oklch(72% 0.01 264);     /* #C7D0D9 soft gray */
  --border:   oklch(30% 0.02 264);     /* rgba(255,255,255,0.06) */
  --accent:   oklch(78% 0.14 200);     /* #12D6E7 cyan */
  --blue:     oklch(58% 0.18 260);     /* #367CFF electric blue */
  --purple:   oklch(55% 0.16 290);     /* #7B61FF soft purple */
}
```

## Font stacks

- **Display**: `'Space Grotesk', 'Clash Display', system-ui, sans-serif`
- **Body**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- **Mono**: `'JetBrains Mono', ui-monospace, monospace`

## Posture rules

- Dark premium canvas: deep navy `#07111F` background, no warm tones
- Glassmorphism: `backdrop-filter: blur()` on nav/modals, `rgba(255,255,255,0.04)` surface fills
- Thin borders: `1px solid rgba(255,255,255,0.06)` with subtle glow via `box-shadow: 0 0 20px rgba(18,214,231,0.08)`
- Rounded cards: `border-radius: 16px` or `20px` for premium feel
- Cyan as primary accent, electric blue as secondary, purple for optional glow moments
- Staggered reveal animations on scroll (Intersection Observer), marquee loops, fade + lift cards
- Ensure WCAG AA contrast (4.5:1) on all text — white on navy passes comfortably
- No serif fonts, no beige/warm backgrounds, no generic stock imagery
