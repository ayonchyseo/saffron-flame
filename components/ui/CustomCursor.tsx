"use client";

import { useEffect, useRef, useState } from "react";
import {
  useIsCoarsePointer,
  usePrefersReducedMotion,
} from "@/hooks/useMediaQuery";

export function CustomCursor() {
  const isCoarse = useIsCoarsePointer();
  const reduced = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const enabled = !isCoarse && !reduced;

  useEffect(() => {
    if (!enabled) return;

    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
    let targetX = 0, targetY = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const el = e.target as HTMLElement | null;
      const close = el?.closest?.(
        '[data-cursor="hover"], a, button, input, textarea, select',
      );
      setHovering(!!close);
    };

    const tick = () => {
      // Dot follows immediately
      dotX = targetX;
      dotY = targetY;
      // Ring lerps with slight trail
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Dot — always 6px gold */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] h-1.5 w-1.5 rounded-full bg-gold"
        style={{ willChange: "transform" }}
      />
      {/* Ring — inflates on hover */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] rounded-full border border-gold/60 transition-[width,height,opacity,border-color] duration-300 ease-out"
        style={{
          width: hovering ? 80 : 40,
          height: hovering ? 80 : 40,
          opacity: hovering ? 0.85 : 0.45,
          mixBlendMode: "difference",
          willChange: "transform, width, height",
        }}
      />
    </>
  );
}
