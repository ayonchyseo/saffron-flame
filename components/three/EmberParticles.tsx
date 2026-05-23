"use client";

import { seededRandom } from "@/lib/utils";

interface EmberParticlesProps {
  count?: number;
  seed?: number;
  className?: string;
}

/** Cheap, additive-blend gold motes — no WebGL, no JS animation loop.
 *  Each mote uses CSS keyframes `ember-rise` with deterministic seed. */
export function EmberParticles({
  count = 24,
  seed = 7,
  className = "",
}: EmberParticlesProps) {
  const rand = seededRandom(seed);
  const motes = Array.from({ length: count }).map((_, i) => {
    const left = rand() * 100;
    const size = 2 + rand() * 4;
    const dur = 6 + rand() * 8;
    const delay = -rand() * 12;
    const drift = (rand() - 0.5) * 80;
    const startY = 70 + rand() * 30;
    const blur = rand() > 0.7 ? 1 : 0;
    return { i, left, size, dur, delay, drift, startY, blur };
  });

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {motes.map((m) => (
        <span
          key={m.i}
          className="absolute rounded-full bg-gold-100 mix-blend-screen animate-ember-rise"
          style={{
            left: `${m.left}%`,
            top: `${m.startY}%`,
            width: m.size,
            height: m.size,
            opacity: 0,
            filter: m.blur ? "blur(1px)" : undefined,
            boxShadow: "0 0 8px rgba(255, 190, 100, 0.7)",
            // CSS custom properties consumed by keyframe + animation shorthand
            ["--dur" as any]: `${m.dur}s`,
            ["--drift" as any]: `${m.drift}px`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
