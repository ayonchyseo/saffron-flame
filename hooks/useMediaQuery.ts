"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatch(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return match;
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

export const useIsMobile = () => useMediaQuery("(max-width: 768px)");

export const useIsCoarsePointer = () => useMediaQuery("(pointer: coarse)");
