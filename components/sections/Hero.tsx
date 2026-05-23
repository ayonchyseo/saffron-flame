"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasShell } from "@/components/three/CanvasShell";
import { EmberParticles } from "@/components/three/EmberParticles";
import { useSound } from "@/components/providers/SoundProvider";

const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false },
);

const TITLE_WORDS = ["Where", "Fire", "Meets"];

export function Hero() {
  const { enabled, toggle } = useSound();

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center pt-20 md:pt-24">
      {/* Background atmosphere — ember radial + grain + vignette */}
      <div className="pointer-events-none absolute inset-0 bg-ember-radial opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-gold-mesh opacity-40" />
      <div className="pointer-events-none absolute inset-0 vignette" />
      <EmberParticles count={28} seed={11} />

      <div className="container relative z-10 grid lg:grid-cols-12 gap-10 items-center">
        {/* Left — typography */}
        <div className="lg:col-span-7 max-w-[60ch]">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.8 }}
            className="eyebrow"
          >
            Dubai Marina · Reservations open
          </motion.p>

          <h1 className="h-display text-fluid-xl mt-6 leading-[0.95]">
            {TITLE_WORDS.map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 2.2 + i * 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-4 last:mr-0"
              >
                {w}
              </motion.span>
            ))}
            <br />
            <motion.em
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 2.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-gold-grad not-italic font-display italic"
            >
              Flavor.
            </motion.em>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 0.8 }}
            className="mt-8 max-w-prose text-bone/70 text-base md:text-lg leading-relaxed"
          >
            A wood-fire steakhouse and refined Asian fusion, set above the Marina by{" "}
            <span className="text-gold">Chef Kenji Aoyama</span>. Eight courses, one fire,
            no shortcuts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.6, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button asChild size="lg" variant="gold">
              <a href="#reserve">Reserve a Table</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#menu">View the Menu</a>
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.0, duration: 0.8 }}
            className="mt-14 grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              ["08", "Course tasting"],
              ["36hr", "Tonkotsu broth"],
              ["A5", "Miyazaki wagyu"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-3xl text-gold leading-none">{v}</div>
                <div className="mt-2 text-[0.6rem] uppercase tracking-widest2 text-bone/45">
                  {l}
                </div>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right — 3D scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative h-[420px] sm:h-[480px] lg:h-[640px]"
        >
          <div className="absolute inset-0">
            <CanvasShell
              camera={{ position: [0, 0.4, 3.4], fov: 38 }}
              shadows
            >
              <HeroScene />
            </CanvasShell>
          </div>

          {/* Corner ornaments */}
          <div className="pointer-events-none absolute top-0 left-0 h-10 w-10 border-l border-t border-gold/40" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-r border-b border-gold/40" />
        </motion.div>
      </div>

      {/* Sound toggle — bottom right */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.0, duration: 0.6 }}
        onClick={toggle}
        data-cursor="hover"
        aria-label={enabled ? "Mute ambient sound" : "Play ambient sound"}
        className="group fixed bottom-6 right-6 z-30 grid h-12 w-12 place-items-center glass rounded-full hover:bg-gold/10 transition-colors"
      >
        {enabled ? (
          <Volume2 className="h-4 w-4 text-gold" />
        ) : (
          <>
            <VolumeX className="h-4 w-4 text-bone/70 group-hover:text-gold transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ember">
              <span className="absolute inset-0 rounded-full bg-ember animate-ping" />
            </span>
          </>
        )}
      </motion.button>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-bone/40"
      >
        <span className="text-[0.55rem] uppercase tracking-widest3">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-scroll-hint" />
      </motion.div>
    </section>
  );
}
