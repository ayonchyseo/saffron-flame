# Saffron Flame

A cinematic, production-grade marketing site for **Saffron Flame** — a luxury Asian Fusion & Steakhouse in Dubai Marina. Built with Next.js 15, React 19, Three.js, GSAP, and Lenis. Designed for Awwwards-level polish: smooth scroll, custom cursor, ambient WebAudio, procedural 3D dish renders, scroll-pinned horizontal experience, and a full reservation flow.

## Stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS 3.4, custom design tokens |
| 3D | Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` |
| Motion | Framer Motion 11, GSAP 3.13 (+ ScrollTrigger) |
| Smooth scroll | Lenis 1.1 (bridged to GSAP ScrollTrigger) |
| UI primitives | Radix (Dialog, Label, Toast, Slot), CVA, `tailwind-merge` |
| Icons | Lucide React |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

## Project structure

```
saffron-flame/
├── app/
│   ├── api/reserve/route.ts     # POST handler — returns synthetic confirmation code
│   ├── globals.css              # Design tokens, utility classes, keyframes
│   ├── layout.tsx               # Root layout — fonts, JSON-LD, providers
│   └── page.tsx                 # Single landing page — all sections in order
│
├── components/
│   ├── LoadingScreen.tsx        # Flame monogram with iris-wipe exit
│   ├── Navigation.tsx           # Sticky nav with mobile drawer
│   │
│   ├── providers/
│   │   ├── LenisProvider.tsx    # Smooth scroll + GSAP ScrollTrigger bridge
│   │   └── SoundProvider.tsx    # Procedural ambient WebAudio
│   │
│   ├── sections/
│   │   ├── Hero.tsx             # 3D plated steak, word-by-word title reveal
│   │   ├── Story.tsx            # Chef story, parallax visual, timeline
│   │   ├── Menu.tsx             # 9 dishes, per-card R3F thumbnail, modal detail
│   │   ├── Signature.tsx        # GSAP horizontal scroll, 4 rooms
│   │   ├── Testimonials.tsx     # Glass slider, auto-advance, press strip
│   │   ├── Reservation.tsx      # Full form, POST to /api/reserve, toast feedback
│   │   ├── Location.tsx         # Stylised SVG night map of the Marina
│   │   └── Footer.tsx           # Brand, newsletter, social, sitemap
│   │
│   ├── three/
│   │   ├── CanvasShell.tsx      # R3F Canvas wrapper with DPR + frameloop guards
│   │   ├── HeroScene.tsx        # 3-point lighting + postprocessing (Bloom/CA/Vignette)
│   │   ├── PlatedSteak.tsx      # Hero centerpiece, cursor tilt, auto-rotate
│   │   ├── MenuItem3D.tsx       # Procedural geometry per category
│   │   ├── SmokeParticles.tsx   # InstancedMesh smoke with additive blend
│   │   └── EmberParticles.tsx   # CSS-only gold motes (no WebGL cost)
│   │
│   └── ui/
│       ├── button.tsx           # CVA variants (gold/outline/ghost/sang)
│       ├── input.tsx, label.tsx, textarea.tsx, select.tsx
│       ├── dialog.tsx           # Radix dialog with glass content
│       ├── toaster.tsx          # Custom toast provider + useToast hook
│       └── CustomCursor.tsx     # Two-layer cursor, inflates on hover targets
│
├── hooks/
│   ├── useMediaQuery.ts         # + usePrefersReducedMotion, useIsMobile, useIsCoarsePointer
│   ├── useMouseNormalized.ts    # Ref-based pointer for R3F frame loops
│   └── useInView.ts             # One-shot intersection observer
│
├── lib/
│   ├── animations.ts            # gsap + ScrollTrigger registration
│   ├── data.ts                  # MENU, CATEGORIES, SIGNATURE_PANELS, TESTIMONIALS
│   └── utils.ts                 # cn(), seededRandom() — SSR-safe pseudo-random
│
├── types/index.ts               # Shared types
└── tailwind.config.ts           # Brand tokens, fluid sizes, keyframes
```

## Design system

**Palette.** Matte obsidian (`#0a0908`) → char (`#1a1817`) → deep gold (`#c89b3c`) with ember (`#ff5b1f`) and wine/sang (`#3a0a0e`, `#5c1f1a`) accents. Bone (`#f5efe4`) for body text.

**Typography.** Cormorant Garamond (display, weight 300–500) over Manrope (body, 200–700). Fluid font sizes scale between mobile and desktop via `clamp()`.

**Motion principles.** Everything obeys `prefers-reduced-motion`: Lenis is disabled, GSAP scrubs collapse, postprocessing drops, particle counts fall back to zero, and the custom cursor is replaced with the native one.

## Performance notes

- **DPR clamp** on every `<Canvas>`: `[1, 1.5]` mobile, `[1, 2]` desktop.
- **Postprocessing** (Bloom + CA + Vignette) only runs in the hero, and only when reduced-motion is off.
- **Smoke particles** are skipped entirely on coarse pointers (touch devices).
- **Ember particles** are CSS-only — no WebGL cost.
- **Menu thumbnails** use a tiny R3F canvas per card, but procedural geometry only (no textures to load).
- **Font loading** uses `display: swap` to avoid invisible-text flashes.

## Accessibility

- All decorative SVG flagged `aria-hidden`.
- Form fields fully labeled; `:focus-visible` states use a 1px gold ring.
- Reservation form validates on the server (`app/api/reserve/route.ts`) and returns explicit error messages.
- Reduced-motion path covers Lenis, GSAP, postprocessing, particles, and the cursor.
- Mobile nav drawer is keyboard-trappable via Radix Dialog patterns (close on Escape, return focus).

## SEO / AEO

- Full `Restaurant` JSON-LD schema in `app/layout.tsx` (cuisine, hours, geo, address, price range).
- OpenGraph + Twitter card metadata.
- Semantic landmarks (`<main>`, `<section>`, `<address>`, `<header>`, `<footer>`) throughout.
- Canonical URL set.

## Deploying

Optimised for Vercel:

```bash
vercel --prod
```

The `/api/reserve` route runs on the **Edge runtime** for low-latency confirmation handshakes. Replace its body with your real reservation backend (CRM POST, email send, DB insert) — the contract returns `{ ok: true, code: 'SF-XXX' }`.

## Where to edit common things

| Want to change… | Edit… |
|---|---|
| Menu items, prices, copy | `lib/data.ts` |
| Brand colors / fonts | `tailwind.config.ts` |
| Schema markup | `app/layout.tsx` (`restaurantSchema`) |
| Reservation logic | `app/api/reserve/route.ts` |
| Page section order | `app/page.tsx` |
| Toast styling | `components/ui/toaster.tsx` |

---

Built with restraint. 2026.
