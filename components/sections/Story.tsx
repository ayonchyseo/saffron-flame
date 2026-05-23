"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/animations";
import { EmberParticles } from "@/components/three/EmberParticles";

const TIMELINE = [
  { year: "2009", place: "Tokyo", text: "Chef Aoyama earns his first star at Aoyama-tei, Shibuya." },
  { year: "2014", place: "Kyoto", text: "Opens a six-seat kappo counter in a converted tea house." },
  { year: "2019", place: "London", text: "Wins Restaurant of the Year for a 12-seat omakase residency." },
  { year: "2022", place: "Singapore", text: "Begins a year-long study of Southeast Asian fire traditions." },
  { year: "2024", place: "Dubai", text: "Opens Saffron Flame in Dubai Marina with collaborator Reza Hadi." },
];

export function Story() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !visualRef.current) return;
    const ctx = gsap.context(() => {
      // Parallax — visual lifts faster than the text column on scroll
      gsap.to(visualRef.current, {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Split-line title reveal
      gsap.from(".story-title-line", {
        yPercent: 100,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".story-title-line",
          start: "top 75%",
        },
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="story" ref={wrapRef} className="relative section overflow-hidden">
      <div className="container relative grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Text column */}
        <div className="lg:col-span-7 max-w-prose">
          <p className="eyebrow">Chapter One · The House</p>
          <h2 className="h-display text-fluid-md mt-3 overflow-hidden">
            <span className="block story-title-line">Patience, smoke</span>
            <span className="block story-title-line">
              and the{" "}
              <em className="text-gold font-display italic not-italic">slow</em> hand.
            </span>
          </h2>

          <p className="mt-8 text-bone/75 leading-relaxed">
            Saffron Flame began as a notebook — a list of obsessions kept by{" "}
            <span className="text-gold">Chef Kenji Aoyama</span> across fifteen years of
            cooking in Tokyo, Kyoto, and London. A bowl of ramen finished on the grill.
            A sushi flight built like a record album. A piece of wagyu that asked for
            nothing more than time and a good fire.
          </p>
          <p className="mt-5 text-bone/75 leading-relaxed">
            In late 2024 he opened the room in Dubai Marina with collaborator Reza Hadi,
            on the principle that <span className="text-gold/90 italic">a restaurant should respect three things: the ingredient, the fire, and the guest&apos;s evening</span>.
            Everything else is decoration.
          </p>

          <div className="mt-12 glass filigree-corners p-7 max-w-lg">
            <div className="flex items-center gap-5">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/5">
                <span className="font-display text-xl text-gold">KA</span>
              </div>
              <div>
                <p className="font-display text-xl text-bone leading-tight">
                  Kenji Aoyama
                </p>
                <p className="text-[0.65rem] uppercase tracking-widest2 text-gold/70 mt-1">
                  Chef · Co-founder
                </p>
              </div>
            </div>
            <p className="mt-5 text-bone/70 italic leading-relaxed text-sm">
              &ldquo;I do not want a guest to remember the room. I want them to remember
              the way the steak smelled when it landed on the table — and how quiet
              everyone got, just for a second.&rdquo;
            </p>
          </div>
        </div>

        {/* Visual column */}
        <div ref={visualRef} className="lg:col-span-5 lg:sticky lg:top-32 relative">
          <FireFigure />

          {/* Timeline */}
          <div className="mt-10 relative pl-6">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-gold/0 via-gold/40 to-gold/0" />
            {TIMELINE.map((row, i) => (
              <motion.div
                key={row.year}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.08, duration: 0.7 }}
                className="relative pb-6 last:pb-0"
              >
                <span className="absolute -left-[26px] top-2 h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_rgba(200,155,60,0.7)]" />
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-xl text-gold tabular-nums">
                    {row.year}
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-widest2 text-bone/45">
                    {row.place}
                  </span>
                </div>
                <p className="mt-1 text-sm text-bone/70 leading-relaxed">{row.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <EmberParticles count={18} seed={29} />
    </section>
  );
}

function FireFigure() {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden border border-gold/15 bg-gradient-to-b from-char to-ink">
      <svg
        viewBox="0 0 400 540"
        fill="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="storyGlow" cx="50%" cy="68%" r="40%">
            <stop offset="0" stopColor="#ff7a3d" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#b8330e" stopOpacity="0.2" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="storyFlame" x1="200" y1="280" x2="200" y2="440">
            <stop offset="0" stopColor="#fff2cc" />
            <stop offset="0.4" stopColor="#ff7a3d" />
            <stop offset="1" stopColor="#5c1f1a" />
          </linearGradient>
        </defs>

        {/* Glow */}
        <rect width="400" height="540" fill="url(#storyGlow)" />

        {/* Chef silhouette */}
        <path
          d="M200 180 C 175 180, 158 200, 158 230 L 158 265 L 145 280 L 145 360 C 145 365, 148 368, 152 368 L 248 368 C 252 368, 255 365, 255 360 L 255 280 L 242 265 L 242 230 C 242 200, 225 180, 200 180 Z"
          fill="#0d0a08"
          stroke="#c89b3c"
          strokeWidth="0.8"
          opacity="0.92"
        />
        {/* Hat */}
        <path
          d="M165 180 C 165 150, 235 150, 235 180 C 245 180, 245 195, 235 195 L 165 195 C 155 195, 155 180, 165 180 Z"
          fill="#1a1817"
          stroke="#c89b3c"
          strokeWidth="0.8"
        />

        {/* Grill flame */}
        <path
          d="M200 280 C 215 310, 245 330, 245 370 C 245 410, 220 440, 200 440 C 180 440, 155 410, 155 370 C 155 340, 185 320, 200 280 Z"
          fill="url(#storyFlame)"
          opacity="0.85"
        >
          <animate
            attributeName="opacity"
            values="0.85;0.65;0.85"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Ash motes */}
        {[100, 140, 270, 310, 340].map((x, i) => (
          <circle key={i} cx={x} cy={400 - (i % 3) * 30} r="1.4" fill="#c89b3c" opacity="0.6">
            <animate
              attributeName="cy"
              from={400 - (i % 3) * 30}
              to={150}
              dur={`${6 + i}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0"
              dur={`${6 + i}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Corner cross-rule */}
        <line x1="20" y1="20" x2="60" y2="20" stroke="#c89b3c" strokeWidth="0.6" opacity="0.5" />
        <line x1="20" y1="20" x2="20" y2="60" stroke="#c89b3c" strokeWidth="0.6" opacity="0.5" />
        <line x1="380" y1="520" x2="340" y2="520" stroke="#c89b3c" strokeWidth="0.6" opacity="0.5" />
        <line x1="380" y1="520" x2="380" y2="480" stroke="#c89b3c" strokeWidth="0.6" opacity="0.5" />
      </svg>

      {/* Caption */}
      <div className="absolute bottom-5 left-5 right-5">
        <p className="eyebrow">Open kitchen · Floor 14</p>
        <p className="mt-1 font-display text-xl text-bone">The grill, lit at 5pm.</p>
      </div>
    </div>
  );
}
