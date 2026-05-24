"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────
   Demo Gallery — six cinematic food illustrations built entirely
   from CSS gradients + inline SVG. No external images required.
   ───────────────────────────────────────────────────────────────── */

interface DishCard {
  id: string;
  title: string;
  sub: string;
  tag: string;
  priceAed: number;
  span: string;
  Illustration: React.FC<{ hovered: boolean }>;
}

const DISHES: DishCard[] = [
  {
    id: "wagyu",
    title: "A5 Wagyu, Charred",
    sub: "250 g · binchotan · tamari glaze",
    tag: "Steak",
    priceAed: 690,
    span: "md:col-span-2 md:row-span-2",
    Illustration: WagyuIllustration,
  },
  {
    id: "toro",
    title: "Toro Nigiri Flight",
    sub: "Three cuts · 9 pieces",
    tag: "Sushi",
    priceAed: 320,
    span: "",
    Illustration: TorIllustration,
  },
  {
    id: "tonkotsu",
    title: "Tonkotsu Noir",
    sub: "36-hour broth · black garlic",
    tag: "Ramen",
    priceAed: 145,
    span: "",
    Illustration: RamenIllustration,
  },
  {
    id: "sphere",
    title: "Burnt Honey Sphere",
    sub: "72% cocoa · saffron · gold leaf",
    tag: "Dessert",
    priceAed: 95,
    span: "",
    Illustration: SphereIllustration,
  },
  {
    id: "cocktail",
    title: "Smoke Old Fashioned",
    sub: "Bourbon · saffron bitters · cherry smoke",
    tag: "Cocktail",
    priceAed: 95,
    span: "",
    Illustration: CocktailIllustration,
  },
  {
    id: "interior",
    title: "The Open Kitchen",
    sub: "Floor 14 · Marina view · live fire",
    tag: "Experience",
    priceAed: 0,
    span: "",
    Illustration: InteriorIllustration,
  },
];

export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="relative py-28 md:py-40 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(200,155,60,0.03)] to-transparent" />

      <div className="container">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="eyebrow">Chapter Two · The Plate</p>
          <h2 className="h-display text-fluid-lg mt-3">
            Six dishes,<br />
            <em className="text-gold font-display italic">one story.</em>
          </h2>
          <p className="mt-6 text-bone/70 leading-relaxed max-w-prose">
            Every plate begins the same way — a raw ingredient, a live fire, and the
            discipline to know when to stop. No foam, no tricks, no spectacle beyond
            the thing itself.
          </p>
        </motion.header>

        {/* Gallery grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px]">
          {DISHES.map((dish, i) => (
            <GalleryCard key={dish.id} dish={dish} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single gallery card ─────────────────────────────────────────── */
function GalleryCard({
  dish,
  index,
  inView,
}: {
  dish: DishCard;
  index: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.08,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor="hover"
      className={cn(
        "group relative overflow-hidden border border-gold/15 cursor-default",
        "transition-all duration-700 will-transform",
        "hover:border-gold/50 hover:shadow-cinema",
        dish.span,
      )}
    >
      {/* Illustration layer */}
      <div className="absolute inset-0">
        <dish.Illustration hovered={hovered} />
      </div>

      {/* Hover glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(200,155,60,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Corner ornaments */}
      <div className="pointer-events-none absolute top-3 left-3 h-5 w-5 border-l border-t border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-r border-b border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Tag */}
      <div className="absolute top-4 left-4">
        <span className="chip-ember text-[0.55rem]">{dish.tag}</span>
      </div>

      {/* Text overlay — bottom */}
      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent">
        <p className="font-display text-xl md:text-2xl text-bone leading-tight group-hover:text-gold transition-colors duration-500">
          {dish.title}
        </p>
        <p className="mt-1 text-[0.6rem] uppercase tracking-widest2 text-bone/50">
          {dish.sub}
        </p>
        {dish.priceAed > 0 && (
          <p className="mt-2 font-display text-gold tabular-nums">
            <span className="text-[0.6rem] mr-1 opacity-70">AED</span>
            {dish.priceAed}
          </p>
        )}
      </div>

      {/* Hover scale transform */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "center" }}
      />
    </motion.article>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SVG/CSS food illustrations — each is a standalone React component
   ───────────────────────────────────────────────────────────────── */

function WagyuIllustration({ hovered }: { hovered: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700"
      style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 38% 62%, #4a1c0c 0%, #2a0f05 35%, #0d0805 70%, #0a0908 100%)",
        }}
      />
      {/* Ambient ember glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 40% 80%, rgba(255,91,31,0.18) 0%, transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 600 440"
        fill="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="wagyuPlateGrad" cx="50%" cy="55%" r="44%">
            <stop offset="0" stopColor="#2a2420" />
            <stop offset="1" stopColor="#0d0908" />
          </radialGradient>
          <radialGradient id="wagyuGlowGrad" cx="50%" cy="65%" r="50%">
            <stop offset="0" stopColor="#ff7a3d" stopOpacity="0.25" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="wagyuSteakGrad" x1="180" y1="200" x2="420" y2="340">
            <stop offset="0" stopColor="#2a0f08" />
            <stop offset="0.3" stopColor="#4a1a10" />
            <stop offset="0.6" stopColor="#3a1208" />
            <stop offset="1" stopColor="#1a0805" />
          </linearGradient>
          <linearGradient id="wagyuGlaze" x1="180" y1="220" x2="420" y2="220">
            <stop offset="0" stopColor="transparent" />
            <stop offset="0.3" stopColor="#c89b3c" stopOpacity="0.6" />
            <stop offset="0.7" stopColor="#a07a26" stopOpacity="0.4" />
            <stop offset="1" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="wagyuRimGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="transparent" />
            <stop offset="0.35" stopColor="#c89b3c" stopOpacity="0.8" />
            <stop offset="0.65" stopColor="#e8c879" stopOpacity="0.9" />
            <stop offset="1" stopColor="transparent" />
          </linearGradient>
          <filter id="wagyuBlur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Plate glow */}
        <ellipse cx="300" cy="320" rx="240" ry="100" fill="url(#wagyuGlowGrad)" filter="url(#wagyuBlur)" />

        {/* Slate base */}
        <ellipse cx="300" cy="320" rx="218" ry="72" fill="url(#wagyuPlateGrad)" />
        {/* Gold rim */}
        <ellipse cx="300" cy="320" rx="218" ry="72" fill="none" stroke="url(#wagyuRimGrad)" strokeWidth="1.8" />
        <ellipse cx="300" cy="318" rx="210" ry="68" fill="none" stroke="#c89b3c" strokeWidth="0.5" opacity="0.3" />

        {/* Steak body */}
        <ellipse cx="300" cy="272" rx="155" ry="62" fill="url(#wagyuSteakGrad)" />
        {/* Top face */}
        <ellipse cx="300" cy="262" rx="155" ry="50" fill="#3a1410" />
        <ellipse cx="300" cy="258" rx="148" ry="44" fill="#2e1008" />

        {/* Sear marks */}
        {[
          "M210 240 Q260 255 310 248 Q360 241 400 255",
          "M215 252 Q265 267 315 260 Q365 253 398 265",
          "M220 264 Q268 278 318 271 Q368 264 395 275",
        ].map((d, i) => (
          <path key={i} d={d} stroke="#1a0805" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
        ))}

        {/* Sear crust highlight */}
        <ellipse cx="300" cy="248" rx="120" ry="28" fill="#5c1f10" opacity="0.6" />
        <ellipse cx="270" cy="242" rx="70" ry="16" fill="#7a2a14" opacity="0.4" />

        {/* Tamari glaze drizzle */}
        <path
          d="M170 258 C210 248, 255 264, 300 256 S380 248, 420 258"
          stroke="url(#wagyuGlaze)"
          strokeWidth="3"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M200 268 C240 260, 280 272, 320 265 S385 256, 410 268"
          stroke="#c89b3c"
          strokeWidth="1.5"
          fill="none"
          opacity="0.45"
        />

        {/* Gold-leaf flake */}
        <path d="M318 232 L332 228 L340 236 L326 242 Z" fill="#f3e0a8" opacity="0.85" />
        <path d="M322 234 L334 230 L338 236 L326 240 Z" fill="#fff2cc" opacity="0.55" />

        {/* Microgreens */}
        {[
          { cx: 348, cy: 240, r: 6, color: "#3d5f2e" },
          { cx: 360, cy: 234, r: 4, color: "#4a7238" },
          { cx: 352, cy: 232, r: 3, color: "#5a8a44" },
          { cx: 340, cy: 244, r: 3.5, color: "#3d5f2e" },
        ].map((m, i) => (
          <circle key={i} cx={m.cx} cy={m.cy} r={m.r} fill={m.color} />
        ))}

        {/* Steam wisps */}
        {[280, 305, 330].map((x, i) => (
          <g key={i}>
            <path
              d={`M${x} 200 C${x - 8} 185, ${x + 8} 172, ${x} 155`}
              stroke="#ffd57a"
              strokeWidth="1.5"
              fill="none"
              opacity="0"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0;0.3;0"
                dur={`${2.5 + i * 0.7}s`}
                repeatCount="indefinite"
                begin={`${i * 0.6}s`}
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to={`${(i - 1) * 4} -30`}
                dur={`${2.5 + i * 0.7}s`}
                repeatCount="indefinite"
                begin={`${i * 0.6}s`}
              />
            </path>
          </g>
        ))}

        {/* Smoked Maldon crystals */}
        {[
          [260, 248], [295, 242], [325, 250], [342, 238],
        ].map(([cx, cy], i) => (
          <rect key={i} x={cx} y={cy} width="3" height="3" fill="#f5efe4" opacity="0.5" transform={`rotate(${i * 20} ${cx} ${cy})`} />
        ))}
      </svg>
    </div>
  );
}

function TorIllustration({ hovered }: { hovered: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700"
      style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 55%, #1a2232 0%, #0d1420 40%, #0a0908 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 85%, rgba(200,155,60,0.1) 0%, transparent 70%)",
        }}
      />
      <svg viewBox="0 0 400 300" fill="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="toro1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b2222" />
            <stop offset="1" stopColor="#5a1010" />
          </linearGradient>
          <linearGradient id="toro2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b03030" />
            <stop offset="1" stopColor="#7a1818" />
          </linearGradient>
          <linearGradient id="toro3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c85050" />
            <stop offset="1" stopColor="#a02828" />
          </linearGradient>
          <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1d12" />
            <stop offset="1" stopColor="#1a1008" />
          </linearGradient>
          <radialGradient id="toroGlow" cx="50%" cy="90%" r="40%">
            <stop offset="0" stopColor="#c89b3c" stopOpacity="0.15" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Wood board */}
        <rect x="40" y="200" width="320" height="50" rx="4" fill="url(#boardGrad)" />
        {/* Wood grain */}
        {[210, 218, 228, 238].map((y, i) => (
          <path key={i} d={`M45 ${y} Q200 ${y + (i % 2 === 0 ? 3 : -2)} 355 ${y}`} stroke="#1a1008" strokeWidth="0.6" opacity="0.5" />
        ))}
        <rect x="40" y="200" width="320" height="50" rx="4" fill="url(#toroGlow)" />

        {/* Three nigiri — rice mounds */}
        {[
          { x: 100, fish: "url(#toro1)", fishColor: "#8b2222" },
          { x: 200, fish: "url(#toro2)", fishColor: "#b03030" },
          { x: 300, fish: "url(#toro3)", fishColor: "#d06060" },
        ].map(({ x, fish, fishColor }, i) => (
          <g key={i}>
            {/* Rice */}
            <ellipse cx={x} cy="198" rx="38" ry="18" fill="#f5efe4" />
            <ellipse cx={x} cy="192" rx="36" ry="14" fill="#ede8de" />
            <ellipse cx={x} cy="188" rx="30" ry="10" fill="#f0ebe1" />
            {/* Fish slice */}
            <ellipse cx={x} cy="180" rx="40" ry="12" fill={fish} />
            <ellipse cx={x} cy="176" rx="38" ry="8" fill={fishColor} opacity="0.7" />
            {/* Fat marbling */}
            {[x - 12, x + 8, x - 4].map((mx, mi) => (
              <path key={mi} d={`M${mx} 176 Q${mx + 6} 172 ${mx + 14} 176`} stroke="#f5c8a0" strokeWidth="1.2" opacity="0.5" />
            ))}
            {/* Nori band */}
            <path d={`M${x - 28} 190 Q${x} 194 ${x + 28} 190`} stroke="#0d0a08" strokeWidth="5" fill="none" />
            {/* Wasabi dot */}
            <circle cx={x + 20} cy="204" r="4" fill="#4a7238" opacity="0.8" />
            {/* Soy puddle */}
            <ellipse cx={x} cy="214" rx="30" ry="5" fill="#1a0a04" opacity="0.5" />
          </g>
        ))}

        {/* Soy reduction pool */}
        <ellipse cx="200" cy="220" rx="120" ry="8" fill="#0d0705" opacity="0.6" />

        {/* Chopsticks */}
        <line x1="330" y1="150" x2="370" y2="230" stroke="#c89b3c" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="340" y1="148" x2="380" y2="228" stroke="#a07a26" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

        {/* Gold accent dots */}
        {[100, 200, 300].map((x) => (
          <circle key={x} cx={x} cy="228" r="2" fill="#c89b3c" opacity="0.6" />
        ))}
      </svg>
    </div>
  );
}

function RamenIllustration({ hovered }: { hovered: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700"
      style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 55%, #2a1006 0%, #160a04 40%, #0a0908 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 50% 55%, rgba(255,122,61,0.1) 0%, transparent 70%)",
        }}
      />
      <svg viewBox="0 0 400 300" fill="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="ramenBowlOut" cx="50%" cy="55%" r="45%">
            <stop offset="0" stopColor="#1a1008" />
            <stop offset="0.7" stopColor="#0d0805" />
            <stop offset="1" stopColor="#080504" />
          </radialGradient>
          <radialGradient id="ramenBroth" cx="50%" cy="40%" r="45%">
            <stop offset="0" stopColor="#5c2208" />
            <stop offset="0.5" stopColor="#3a1508" />
            <stop offset="1" stopColor="#1a0a04" />
          </radialGradient>
          <radialGradient id="ramenGlow" cx="50%" cy="55%" r="50%">
            <stop offset="0" stopColor="#ff7a3d" stopOpacity="0.12" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Bowl shadow */}
        <ellipse cx="200" cy="265" rx="130" ry="22" fill="#050302" opacity="0.7" />

        {/* Bowl exterior */}
        <path d="M65 160 Q65 270, 200 278 Q335 270, 335 160 Z" fill="url(#ramenBowlOut)" />
        {/* Bowl top rim */}
        <ellipse cx="200" cy="160" rx="135" ry="38" fill="#1a1008" />
        <ellipse cx="200" cy="158" rx="130" ry="34" fill="#221508" />

        {/* Broth surface */}
        <ellipse cx="200" cy="158" rx="118" ry="28" fill="url(#ramenBroth)" />
        <ellipse cx="200" cy="155" rx="100" ry="22" fill="#4a1a08" opacity="0.6" />

        {/* Broth shimmer/fat pools */}
        {[
          { cx: 175, cy: 152, rx: 22, ry: 8 },
          { cx: 225, cy: 160, rx: 18, ry: 6 },
          { cx: 195, cy: 165, rx: 14, ry: 5 },
        ].map((e, i) => (
          <ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="#c89b3c" opacity={0.12 - i * 0.02} />
        ))}

        {/* Noodle swirl */}
        <path
          d="M155 162 C170 148, 195 172, 210 156 S230 145, 248 158"
          stroke="#e8c879"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M160 168 C175 155, 198 178, 215 162 S233 151, 250 165"
          stroke="#e8c879"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M158 175 C170 162, 192 184, 208 170 S228 160, 245 172"
          stroke="#d4b060"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Chashu slice */}
        <ellipse cx="265" cy="152" rx="28" ry="12" fill="#5c1f10" />
        <ellipse cx="265" cy="150" rx="26" ry="10" fill="#7a2a14" />
        {/* Fat ring */}
        <ellipse cx="265" cy="150" rx="26" ry="10" fill="none" stroke="#f5efe4" strokeWidth="3" opacity="0.25" />
        {/* Char lines */}
        <line x1="250" y1="148" x2="280" y2="152" stroke="#1a0805" strokeWidth="2" opacity="0.6" />
        <line x1="252" y1="152" x2="278" y2="156" stroke="#1a0805" strokeWidth="1.5" opacity="0.4" />

        {/* Soft egg half */}
        <ellipse cx="148" cy="152" rx="20" ry="14" fill="#f5efe4" />
        <ellipse cx="148" cy="150" rx="12" ry="8" fill="#ff9a3d" opacity="0.8" />
        <ellipse cx="148" cy="149" rx="7" ry="5" fill="#ff7a1f" opacity="0.9" />

        {/* Green onion rings */}
        {[190, 210, 225, 200].map((x, i) => (
          <ellipse key={i} cx={x} cy={145 - i * 3} rx={3} ry={2} fill="#5a8a44" opacity="0.8" />
        ))}

        {/* Mayu black oil drizzle */}
        <path
          d="M180 148 C195 142, 208 148, 222 144"
          stroke="#0d0a08"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Steam */}
        {[170, 200, 230].map((x, i) => (
          <g key={i}>
            <path
              d={`M${x} 120 C${x - 6} 105, ${x + 6} 92, ${x} 78`}
              stroke="#ffd57a"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0"
            >
              <animate attributeName="opacity" values="0;0.25;0" dur={`${2.2 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
              <animateTransform attributeName="transform" type="translate" from="0 0" to={`${(i - 1) * 5} -25`} dur={`${2.2 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
            </path>
          </g>
        ))}

        {/* Bowl glow */}
        <ellipse cx="200" cy="210" rx="130" ry="65" fill="url(#ramenGlow)" />

        {/* Bowl rim highlight */}
        <ellipse cx="200" cy="160" rx="135" ry="38" fill="none" stroke="#c89b3c" strokeWidth="0.8" opacity="0.3" />
      </svg>
    </div>
  );
}

function SphereIllustration({ hovered }: { hovered: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700"
      style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 55%, #1e0f08 0%, #0f0804 45%, #0a0908 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(200,155,60,0.08) 0%, transparent 70%)",
        }}
      />
      <svg viewBox="0 0 400 300" fill="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="sphereGrad" cx="38%" cy="32%" r="60%">
            <stop offset="0" stopColor="#3a1808" />
            <stop offset="0.4" stopColor="#1e0c04" />
            <stop offset="0.75" stopColor="#120804" />
            <stop offset="1" stopColor="#0a0502" />
          </radialGradient>
          <radialGradient id="sphereSheen" cx="30%" cy="28%" r="45%">
            <stop offset="0" stopColor="#c89b3c" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#7a5c1b" stopOpacity="0.12" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="plateGrad2" cx="50%" cy="40%" r="50%">
            <stop offset="0" stopColor="#2a2420" />
            <stop offset="1" stopColor="#0d0908" />
          </radialGradient>
          <radialGradient id="caramelPool" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#c89b3c" stopOpacity="0.8" />
            <stop offset="0.6" stopColor="#7a5c1b" stopOpacity="0.5" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
          <filter id="sphereGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Plate shadow */}
        <ellipse cx="200" cy="252" rx="105" ry="22" fill="#050302" opacity="0.7" />

        {/* Plate */}
        <ellipse cx="200" cy="240" rx="105" ry="32" fill="url(#plateGrad2)" />
        <ellipse cx="200" cy="238" rx="100" ry="28" fill="#1a1615" />
        {/* Plate rim */}
        <ellipse cx="200" cy="238" rx="100" ry="28" fill="none" stroke="#c89b3c" strokeWidth="1" opacity="0.4" />

        {/* Caramel pool */}
        <ellipse cx="200" cy="225" rx="65" ry="18" fill="url(#caramelPool)" />

        {/* Sphere glow (under) */}
        <circle cx="200" cy="195" r="75" fill="#c89b3c" opacity="0.06" filter="url(#sphereGlow)" />

        {/* Chocolate sphere */}
        <circle cx="200" cy="185" r="70" fill="url(#sphereGrad)" />
        {/* Sphere sheen */}
        <circle cx="200" cy="185" r="70" fill="url(#sphereSheen)" />
        {/* Specular highlight */}
        <ellipse cx="175" cy="158" rx="22" ry="14" fill="#c89b3c" opacity="0.18" />
        <ellipse cx="172" cy="155" rx="12" ry="8" fill="#f3e0a8" opacity="0.25" />

        {/* Gold band equator */}
        <ellipse cx="200" cy="185" rx="70" ry="12" fill="none" stroke="#c89b3c" strokeWidth="1.5" opacity="0.6" />
        <ellipse cx="200" cy="185" rx="68" ry="10" fill="none" stroke="#e8c879" strokeWidth="0.5" opacity="0.3" />

        {/* Gold leaf flakes */}
        <path d="M222 152 L238 148 L244 158 L228 164 Z" fill="#f3e0a8" opacity="0.8" />
        <path d="M226 154 L238 151 L242 158 L230 161 Z" fill="#fff2cc" opacity="0.5" />
        <path d="M198 142 L208 138 L213 146 L203 150 Z" fill="#e8c879" opacity="0.7" />

        {/* Saffron dust */}
        {[188, 205, 218, 230, 175].map((x, i) => (
          <circle key={i} cx={x} cy={218 + (i % 3) * 4} r={1.5} fill="#ff9a00" opacity="0.6" />
        ))}

        {/* Sea salt crystals on top */}
        {[192, 208, 218].map((x, i) => (
          <rect key={i} x={x} y={112 + i * 5} width="3" height="3" fill="#f5efe4" opacity="0.5" transform={`rotate(${i * 30} ${x} ${115 + i * 5})`} />
        ))}

        {/* Crack line (decorative, as if just served) */}
        <path d="M200 115 L195 130 L205 148 L198 162" stroke="#c89b3c" strokeWidth="0.8" opacity="0.4" fill="none" />
      </svg>
    </div>
  );
}

function CocktailIllustration({ hovered }: { hovered: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700"
      style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 50%, #1c1206 0%, #100c04 45%, #0a0908 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 35% 40% at 50% 45%, rgba(200,155,60,0.1) 0%, transparent 70%)",
        }}
      />
      <svg viewBox="0 0 400 300" fill="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="cocktailLiquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c87820" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#8a5010" stopOpacity="0.85" />
            <stop offset="1" stopColor="#5a3008" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c89b3c" stopOpacity="0.08" />
            <stop offset="0.3" stopColor="#f3e0a8" stopOpacity="0.04" />
            <stop offset="0.7" stopColor="#f3e0a8" stopOpacity="0.06" />
            <stop offset="1" stopColor="#c89b3c" stopOpacity="0.08" />
          </linearGradient>
          <filter id="smokeBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Glass shadow */}
        <ellipse cx="200" cy="268" rx="55" ry="12" fill="#050302" opacity="0.7" />

        {/* Glass foot */}
        <ellipse cx="200" cy="258" rx="55" ry="10" fill="#1a1614" />
        <ellipse cx="200" cy="254" rx="52" ry="8" fill="#221e1a" />

        {/* Stem */}
        <rect x="197" y="200" width="6" height="56" fill="#1a1614" rx="3" />
        <rect x="198" y="200" width="3" height="56" fill="#c89b3c" opacity="0.15" rx="1.5" />

        {/* Rocks glass body */}
        <path d="M148 148 L152 220 Q200 235 248 220 L252 148 Z" fill="#121008" />
        {/* Glass walls */}
        <path d="M148 148 L152 220 Q200 235 248 220 L252 148" fill="url(#glassGrad)" />
        {/* Glass edge highlight */}
        <line x1="148" y1="148" x2="152" y2="220" stroke="#c89b3c" strokeWidth="0.8" opacity="0.3" />
        <line x1="252" y1="148" x2="248" y2="220" stroke="#c89b3c" strokeWidth="0.8" opacity="0.3" />

        {/* Liquid */}
        <path d="M152 180 L153 220 Q200 233 247 220 L248 180 Z" fill="url(#cocktailLiquid)" />

        {/* Liquid surface shimmer */}
        <path d="M155 180 Q200 188 245 180" stroke="#f3e0a8" strokeWidth="1.5" fill="none" opacity="0.3" />
        <path d="M158 183 Q200 190 242 183" stroke="#c89b3c" strokeWidth="0.8" fill="none" opacity="0.2" />

        {/* Ice cube */}
        <rect x="172" y="186" width="32" height="28" rx="3" fill="#c8d8e8" opacity="0.25" />
        <rect x="172" y="186" width="32" height="28" rx="3" fill="none" stroke="#e8f0f8" strokeWidth="0.8" opacity="0.4" />
        {/* Ice facets */}
        <line x1="172" y1="196" x2="204" y2="188" stroke="#e8f0f8" strokeWidth="0.5" opacity="0.3" />
        <line x1="180" y1="214" x2="204" y2="194" stroke="#e8f0f8" strokeWidth="0.5" opacity="0.25" />

        {/* Second ice */}
        <rect x="210" y="192" width="26" height="22" rx="3" fill="#c8d8e8" opacity="0.2" />
        <rect x="210" y="192" width="26" height="22" rx="3" fill="none" stroke="#e8f0f8" strokeWidth="0.6" opacity="0.3" />

        {/* Glass rim */}
        <ellipse cx="200" cy="148" rx="52" ry="10" fill="none" stroke="#c89b3c" strokeWidth="1.2" opacity="0.5" />
        <ellipse cx="200" cy="147" rx="50" ry="8" fill="#161210" />

        {/* Orange peel garnish */}
        <path d="M225 138 C240 130, 255 136, 258 148" stroke="#e87820" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M226 139 C240 132, 253 137, 256 147" stroke="#c85a10" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* Cherrywood smoke cloche wisps */}
        {[185, 200, 215, 228].map((x, i) => (
          <path
            key={i}
            d={`M${x} ${138 - i * 4} C${x - 8} ${118 - i * 4}, ${x + 10} ${102 - i * 3}, ${x + 2} ${85 - i * 4}`}
            stroke="#ffd57a"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0"
            filter="url(#smokeBlur)"
          >
            <animate
              attributeName="opacity"
              values="0;0.15;0"
              dur={`${2.8 + i * 0.4}s`}
              repeatCount="indefinite"
              begin={`${i * 0.5}s`}
            />
          </path>
        ))}

        {/* Saffron bitters color float on surface */}
        <ellipse cx="186" cy="180" rx="14" ry="5" fill="#c89b3c" opacity="0.3" />
        <ellipse cx="220" cy="182" rx="10" ry="4" fill="#a07a26" opacity="0.2" />
      </svg>
    </div>
  );
}

function InteriorIllustration({ hovered }: { hovered: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700"
      style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 45% 60%, #2a1204 0%, #160a04 40%, #0a0908 100%)",
        }}
      />
      {/* Warm fire glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 40% 70%, rgba(255,91,31,0.2) 0%, rgba(200,100,0,0.08) 50%, transparent 80%)",
        }}
      />
      <svg viewBox="0 0 400 300" fill="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="interiorFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a0f08" />
            <stop offset="1" stopColor="#0a0603" />
          </linearGradient>
          <linearGradient id="flameGrad2" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#b8330e" />
            <stop offset="0.4" stopColor="#ff5b1f" />
            <stop offset="0.75" stopColor="#ff9a3d" />
            <stop offset="1" stopColor="#fff2cc" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="fireGlow" cx="50%" cy="80%" r="55%">
            <stop offset="0" stopColor="#ff5b1f" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#c87820" stopOpacity="0.12" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
          <filter id="fireBlur">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Floor perspective */}
        <path d="M0 220 L120 160 L280 160 L400 220 L400 300 L0 300 Z" fill="url(#interiorFloor)" />
        {/* Floor lines */}
        {[200, 225, 250, 275].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#c89b3c" strokeWidth="0.3" opacity="0.12" />
        ))}

        {/* Back wall */}
        <rect x="0" y="0" width="400" height="165" fill="#0d0805" />

        {/* Hanging pendant lights */}
        {[100, 200, 300].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="0" x2={x} y2={45 + (i % 2) * 15} stroke="#c89b3c" strokeWidth="0.8" opacity="0.4" />
            <ellipse cx={x} cy={50 + (i % 2) * 15} rx="12" ry="6" fill="#1a1408" />
            <ellipse cx={x} cy={50 + (i % 2) * 15} rx="10" ry="5" fill="#2a2010" />
            {/* Light halo */}
            <ellipse cx={x} cy={50 + (i % 2) * 15} rx="30" ry="20" fill="#c89b3c" opacity="0.08" filter="url(#fireBlur)" />
          </g>
        ))}

        {/* Grill station */}
        <rect x="80" y="148" width="180" height="55" fill="#1a1008" rx="2" />
        <rect x="80" y="148" width="180" height="4" fill="#2a2018" />
        {/* Grill grates */}
        {[95, 115, 135, 155, 175, 195, 215, 235].map((x) => (
          <line key={x} x1={x} y1="152" x2={x} y2="195" stroke="#3a2a18" strokeWidth="3" />
        ))}
        {[158, 165, 172, 180, 187].map((y) => (
          <line key={y} x1="80" y1={y} x2="260" y2={y} stroke="#3a2a18" strokeWidth="1.5" />
        ))}

        {/* Flames */}
        {[100, 128, 156, 184, 212, 240].map((x, i) => (
          <g key={i}>
            <path
              d={`M${x} 195 C${x - 4} 180, ${x + 4} 168, ${x} 155 C${x - 6} 165, ${x + 6} 175, ${x} 195`}
              fill="url(#flameGrad2)"
              opacity="0.85"
            >
              <animate attributeName="opacity" values="0.85;0.6;0.9;0.75;0.85" dur={`${0.8 + i * 0.1}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" from="0 0" to={`${i % 2 === 0 ? 1 : -1} -3`} dur={`${0.8 + i * 0.1}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}

        {/* Fire glow on grill */}
        <rect x="80" y="155" width="180" height="40" fill="url(#fireGlow)" />

        {/* Chef silhouette (right side) */}
        <path d="M295 110 C285 110, 278 120, 278 138 L278 195 L318 195 L318 138 C318 120, 311 110, 295 110 Z" fill="#0a0705" opacity="0.9" />
        {/* Chef hat */}
        <path d="M282 110 C282 90, 308 90, 308 110 C316 110, 316 122, 308 122 L282 122 C274 122, 274 110, 282 110 Z" fill="#0d0a07" opacity="0.9" />
        {/* Arm */}
        <path d="M278 152 L258 168 L262 172 L285 158" fill="#0a0705" opacity="0.9" />

        {/* Stools at pass */}
        {[310, 340, 370].map((x) => (
          <g key={x} opacity="0.5">
            <line x1={x} y1="185" x2={x} y2="210" stroke="#3a2a18" strokeWidth="3" />
            <ellipse cx={x} cy="185" rx="14" ry="5" fill="#2a1a0a" />
            <line x1={x - 8} y1="198" x2={x + 8} y2="198" stroke="#2a1a0a" strokeWidth="2" />
          </g>
        ))}

        {/* Gold ceiling stripe */}
        <rect x="0" y="0" width="400" height="3" fill="url(#wagyuRimGrad)" opacity="0.4" />

        {/* Ember particles */}
        {[120, 155, 188, 220].map((x, i) => (
          <circle key={i} cx={x} cy={140 - i * 10} r="1.5" fill="#ff9a3d" opacity="0">
            <animate attributeName="opacity" values="0;0.7;0" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
            <animateTransform attributeName="transform" type="translate" from="0 0" to={`${(i % 2 === 0 ? 3 : -4)} -40`} dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
          </circle>
        ))}

        {/* Marina window silhouette */}
        <rect x="0" y="40" width="60" height="120" fill="#0d1828" opacity="0.8" rx="1" />
        {/* Window lights outside */}
        {[10, 20, 30, 40, 50].map((x) =>
          [55, 70, 85, 100, 115, 130].map((y) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="4" height="6" fill="#c89b3c" opacity={((x + y) % 7 > 3) ? 0.3 : 0.05} />
          ))
        )}
      </svg>
    </div>
  );
}
