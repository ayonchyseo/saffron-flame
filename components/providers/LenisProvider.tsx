"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * LenisProvider
 * - Buttery scroll on desktop only (touch devices use native momentum)
 * - Bridges Lenis RAF into GSAP ticker so ScrollTrigger updates are perfectly in sync
 * - Cleans up on unmount; safe to mount once at the root
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect touch / reduced motion
    const isTouch = matchMedia("(hover: none)").matches;
    const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || prefersReduced) return;

    try {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
      });

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const tickerCb = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);

      return () => {
        lenis.off("scroll", onScroll);
        gsap.ticker.remove(tickerCb);
        lenis.destroy();
      };
    } catch {
      // Lenis failed to initialise (unusual environment) — fall back to native scroll
    }
  }, []);

  return <>{children}</>;
}
