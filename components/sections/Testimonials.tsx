"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduced = usePrefersReducedMotion();

  // Autoplay — pauses on hover via :hover query on wrapper
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setDirection(1);
      setActive((a) => (a + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(id);
  }, [reduced]);

  const go = (next: number) => {
    setDirection(next > active ? 1 : -1);
    setActive((next + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[active];

  return (
    <section className="relative section overflow-hidden">
      {/* Background filaments */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gold-line opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="container relative">
        <header className="text-center max-w-2xl mx-auto">
          <p className="eyebrow justify-center">Chapter Four · The Room Speaks</p>
          <h2 className="h-display text-fluid-md mt-3">
            What our guests <em className="text-gold font-display italic not-italic">remember.</em>
          </h2>
        </header>

        {/* Slider */}
        <div className="mt-16 relative max-w-3xl mx-auto group">
          <Quote
            aria-hidden
            className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 text-gold/15"
          />

          <div className="relative h-[340px] sm:h-[300px] md:h-[280px] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.article
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col items-center text-center px-6"
              >
                {/* Star rating with stagger */}
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          i < current.rating
                            ? "fill-gold text-gold"
                            : "text-gold/20",
                        )}
                      />
                    </motion.span>
                  ))}
                </div>

                <blockquote className="mt-6 font-display text-2xl md:text-3xl text-bone leading-snug italic max-w-2xl">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/5 font-display text-base text-gold">
                    {current.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-display text-base text-bone">{current.name}</p>
                    <p className="text-[0.6rem] uppercase tracking-widest2 text-bone/45 mt-0.5">
                      {current.role}
                    </p>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={() => go(active - 1)}
              data-cursor="hover"
              aria-label="Previous testimonial"
              className="grid h-10 w-10 place-items-center border border-gold/25 text-bone/70 hover:border-gold hover:text-gold transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => go(i)}
                  data-cursor="hover"
                  aria-label={`Show testimonial ${i + 1}`}
                  className={cn(
                    "h-1 transition-all duration-500",
                    i === active ? "w-10 bg-gold" : "w-5 bg-gold/20 hover:bg-gold/40",
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => go(active + 1)}
              data-cursor="hover"
              aria-label="Next testimonial"
              className="grid h-10 w-10 place-items-center border border-gold/25 text-bone/70 hover:border-gold hover:text-gold transition-all"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Press strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/15 border border-gold/15">
          {[
            ["Condé Nast", "Top 10 · 2026"],
            ["Time Out", "★★★★★"],
            ["Esquire", "Restaurant of the Year"],
            ["Vogue", "Best New Opening"],
          ].map(([brand, label]) => (
            <div
              key={brand}
              className="bg-ink p-6 flex flex-col items-center justify-center text-center"
            >
              <p className="font-display text-xl text-gold">{brand}</p>
              <p className="mt-1 text-[0.6rem] uppercase tracking-widest2 text-bone/50">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
