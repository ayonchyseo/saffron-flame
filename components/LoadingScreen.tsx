"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame++;
      // Eased ramp — fast early, slow at the end
      const t = Math.min(frame / 60, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 320);
      }
    };
    let rafId = requestAnimationFrame(tick);

    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (done) {
      document.body.style.overflow = "";
    }
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            clipPath: "circle(0% at 50% 50%)",
            transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
          }}
          style={{ clipPath: "circle(120% at 50% 50%)" }}
          className="fixed inset-0 z-[200] grid place-items-center bg-ink"
        >
          {/* Vignette wash */}
          <div className="pointer-events-none absolute inset-0 bg-ember-radial opacity-50" />

          <div className="relative flex flex-col items-center">
            {/* Monogram SVG with stroke draw-in */}
            <svg
              width="64"
              height="84"
              viewBox="0 0 64 84"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <motion.path
                d="M32 4 C 40 18, 56 28, 56 50 C 56 70, 44 82, 32 82 C 20 82, 8 70, 8 50 C 8 32, 24 22, 32 4 Z"
                stroke="#c89b3c"
                strokeWidth="1.2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              />
              <motion.path
                d="M32 22 C 36 32, 44 38, 44 50 C 44 60, 38 68, 32 68 C 26 68, 20 60, 20 50 C 20 42, 28 36, 32 22 Z"
                fill="url(#flameGrad)"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.9 }}
                style={{ transformOrigin: "32px 50px" }}
              />
              <defs>
                <linearGradient id="flameGrad" x1="32" y1="22" x2="32" y2="68">
                  <stop offset="0" stopColor="#fff2cc" />
                  <stop offset="0.5" stopColor="#ff7a3d" />
                  <stop offset="1" stopColor="#b8330e" />
                </linearGradient>
              </defs>
            </svg>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 font-display text-2xl text-bone tracking-wider"
            >
              Saffron Flame
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="mt-3 eyebrow"
            >
              Where Fire Meets Flavor
            </motion.p>

            {/* Progress counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-10 flex items-baseline gap-1 font-mono text-xs tracking-widest2 text-gold/70"
            >
              <span className="tabular-nums">{String(progress).padStart(3, "0")}</span>
              <span>%</span>
            </motion.div>

            {/* Loading bar */}
            <div className="mt-3 h-px w-32 overflow-hidden bg-gold/15">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-gold to-transparent"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
