'use client';

import dynamic from 'next/dynamic';

// All sections are loaded client-only — Three.js, GSAP, Framer Motion, and
// Lenis all touch browser APIs that don't exist during server-side render.
// Loading them via dynamic({ ssr: false }) prevents Next.js from trying to
// prerender them at build time, which avoids the React internals crash.

const Navigation = dynamic(
  () => import('@/components/Navigation').then((m) => ({ default: m.Navigation })),
  { ssr: false },
);
const Hero = dynamic(
  () => import('@/components/sections/Hero').then((m) => ({ default: m.Hero })),
  { ssr: false },
);
const Story = dynamic(
  () => import('@/components/sections/Story').then((m) => ({ default: m.Story })),
  { ssr: false },
);
const Gallery = dynamic(
  () => import('@/components/sections/Gallery').then((m) => ({ default: m.Gallery })),
  { ssr: false },
);
const Menu = dynamic(
  () => import('@/components/sections/Menu').then((m) => ({ default: m.Menu })),
  { ssr: false },
);
const Signature = dynamic(
  () => import('@/components/sections/Signature').then((m) => ({ default: m.Signature })),
  { ssr: false },
);
const Testimonials = dynamic(
  () => import('@/components/sections/Testimonials').then((m) => ({ default: m.Testimonials })),
  { ssr: false },
);
const Reservation = dynamic(
  () => import('@/components/sections/Reservation').then((m) => ({ default: m.Reservation })),
  { ssr: false },
);
const LocationSection = dynamic(
  () => import('@/components/sections/Location').then((m) => ({ default: m.Location })),
  { ssr: false },
);
const Footer = dynamic(
  () => import('@/components/sections/Footer').then((m) => ({ default: m.Footer })),
  { ssr: false },
);

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <Hero />
        <Gallery />
        <Story />
        <Menu />
        <Signature />
        <Testimonials />
        <Reservation />
        <LocationSection />
      </main>
      <Footer />
    </>
  );
}
