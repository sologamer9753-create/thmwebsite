# TMH Website — Anchored Summary

## Goal
Premium 6-page dark agency website for **The Millennial Hub (TMH)**: Home, About, Services, Clients, Training, Contact.

## Brand System
| Token | Value |
|---|---|
| Primary bg | `#07111F` (navy) |
| Accent | `#12D6E7` (cyan) |
| Text | `#ffffff` headings, `#cbd5e1` body |
| Display | Space Grotesk (weights 400-800) |
| Body | Inter |
| Style | Dark, glassmorphism, cinematic, WebGL "Living Interface" |

## Pages
| File | Contents |
|---|---|
| `index.html` | Home — hero, trust marquee, 7 services, why TMH, timeline, training highlight, CTA |
| `about.html` | Story, mission/vision, 3 differences, 5-year timeline, 4 values, animated counters |
| `services.html` | 6 detail sections with exact TMH payload, premium glass cards |
| `clients.html` | 8 verified client typographic grid + masonry portfolio + testimonials |
| `training.html` | 8 focus areas, 6 delivery models, 4 audience segments |
| `contact.html` | Glass form, detail cards, map, CTA aurora section, all text visible |

## Key Systems
- **Navbar**: Permanent glass `rgba(7,17,31,0.82)` + `backdrop-filter: blur(24px)`. rAF-throttled `translateY(-100%)` hide past 100px. Mobile overlay `rgba(7,17,31,0.95)`.
- **Scroll**: Lenis `1.0.33`, duration `1.2`, synced to GSAP ScrollTrigger.
- **Animation**: GSAP 3.12.5 + ScrollTrigger. 5 `data-reveal` archetypes (mask/stagger/float/wipe/fade). Hero 8-step timeline. Counters via proxy. rAF-throttled magnetic buttons + scroll progress. Parallax desktop-only.
- **Three.js**: r128, TorusKnot→Box morph (5000 particles, `morphTargets: true`, `AdditiveBlending`), GSAP scrub `1.5`, auto-rotation ± cursor lerp. Canvas `position: fixed` behind all content.
- **CSS**: `#webgl-canvas { position: fixed; z-index: 0 }`, `.section { background: #07111F !important; color: #fff }` (no `!important` on color — overridden downstream), smoked glass shield `.hero-left::before`, `overflow-x: hidden`, mobile blur reduction, `@media (hover: none) and (pointer: coarse)` hover reset.
- **Fonts**: Space Grotesk 800 on hero/counters, 700 on H2, 600 on nav/labels. Tight `letter-spacing` on headings. `font-size: clamp()` on hero and counters.

## Bug Fixes (12+ cycles)
- 8 broken `<div data-reveal="fade">` tags in `services.html`
- 2 double-`>>` instances
- GSAP nav-links init limited to `<768px`
- Mobile nav `display:none` → `transform/opacity` slide
- 4 button contrast fixes (white→black on red/cyan bg)
- Cyan leak on mobile nav CTA button
- Counter `innerHTML` → `textContent` (preserves `<span class="accent">`)
- `.page-hero` background from transparent → `#07111F`
- Stripped `.nav-scrolled` class (nav now permanently glass)
- Raw scroll → rAF throttle for navbar hide/reveal
- Random particles → Torus Knot geometry with morph targets
- Radial gradient RGB `7,11,31` → `7,17,31` (wrong navy hex)
- Global text contrast scan: removed all `text-slate-800/900`, `text-gray-700/800`
- Footer: replaced all `var(--muted-on-dark)` with `#94a3b8` hex to avoid OKLCH fallback (Browser ~8%)
- `p { color: #cbd5e1 !important }` cascade: added white-card rescue block for 12 card types
- Contact page: `btn-secondary` (invisible) → `btn-outline`; office hours/FAQ/footer text fixed
- White card headings: `color: var(--fg)` added to 17 card heading selectors
- Removed `--muted-on-dark` CSS variable (previously `oklch(72% 0.018 260)`) — all 4 usages replaced with `#94a3b8`

## Assets
- `css/style.css` — complete design system (~1715 lines)
- `js/main.js` — animation engine (~900 lines)
- `brand-spec.md` — brand tokens
- `navbar-component.html` — standalone React demo (unused)
- `tmh-website-index.html` — legacy file (stale)
