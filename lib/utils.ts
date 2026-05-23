import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic hash-based random — same input always returns the same number.
 *  Avoids hydration mismatch when seeding particles or decorative motes. */
export function seededRandom(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Coarse pointer = touch device. Used to disable cursor/hover-only effects. */
export const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
