"use client";

import { useEffect, useRef } from "react";

/** Returns a ref whose .current is `{x, y}` normalised to -1..1.
 *  Designed for use inside R3F frame loops (no re-render thrash). */
export function useMouseNormalized() {
  const ref = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", handler, { passive: true });
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return ref;
}
