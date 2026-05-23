"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Car, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Location() {
  return (
    <section id="location" className="relative section overflow-hidden">
      <div className="container relative grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left — info */}
        <div className="lg:col-span-5">
          <p className="eyebrow">Chapter Six · Find Us</p>
          <h2 className="h-display text-fluid-md mt-3">
            Marina Walk, <em className="text-gold font-display italic not-italic">Tower 7.</em>
          </h2>
          <p className="mt-7 text-bone/70 leading-relaxed max-w-prose">
            Fourteen floors above the boardwalk, with the Marina on three sides and
            an open kitchen at the centre of the room. Valet drops at the lobby — we
            handle the rest.
          </p>

          <div className="mt-12 grid gap-6">
            <InfoRow icon={<MapPin />} label="Address">
              Marina Walk, Tower 7, Floor 14
              <br />
              Dubai Marina · United Arab Emirates
            </InfoRow>

            <InfoRow icon={<Phone />} label="Phone">
              <a
                href="tel:+97140000000"
                data-cursor="hover"
                className="hover:text-gold transition-colors"
              >
                +971 4 000 0000
              </a>
            </InfoRow>

            <InfoRow icon={<Mail />} label="Reservations">
              <a
                href="mailto:reserve@saffronflame.ae"
                data-cursor="hover"
                className="hover:text-gold transition-colors"
              >
                reserve@saffronflame.ae
              </a>
            </InfoRow>

            <InfoRow icon={<Clock />} label="Service">
              <div className="space-y-1">
                <p>
                  <span className="text-gold/80 mr-2 tabular-nums">Sun–Thu</span>
                  18:00 – 00:30
                </p>
                <p>
                  <span className="text-gold/80 mr-2 tabular-nums">Fri–Sat</span>
                  17:00 – 01:30
                </p>
                <p className="text-bone/50 text-xs mt-2">
                  Last seating 30 minutes before close. Rooftop bar continues until close.
                </p>
              </div>
            </InfoRow>

            <InfoRow icon={<Car />} label="Parking">
              Complimentary valet at the lobby entrance, daily from 17:30.
            </InfoRow>

            <InfoRow icon={<Shirt />} label="Dress Code">
              Smart elegant. Tailored jackets after 19:00 are welcome — athletic wear
              and sandals are not.
            </InfoRow>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="md" variant="gold">
              <a
                href="https://maps.google.com/?q=Dubai+Marina"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Maps
              </a>
            </Button>
            <Button asChild size="md" variant="outline">
              <a href="#reserve">Reserve a Table</a>
            </Button>
          </div>
        </div>

        {/* Right — stylised night map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 relative aspect-[5/6] lg:aspect-square overflow-hidden border border-gold/15 bg-gradient-to-b from-[#0a1422] via-[#070b14] to-[#0a0908]"
        >
          <NightMap />

          {/* Floor 14 indicator */}
          <div className="pointer-events-none absolute top-6 left-6 right-6 flex items-start justify-between">
            <div>
              <p className="eyebrow">Floor 14</p>
              <p className="font-display text-2xl text-bone mt-1">The Marina, lit.</p>
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] uppercase tracking-widest2 text-gold/70">
                25.0805° N
              </p>
              <p className="text-[0.6rem] uppercase tracking-widest2 text-gold/70 mt-1">
                55.1403° E
              </p>
            </div>
          </div>

          {/* Filigree corners */}
          <div className="pointer-events-none absolute top-3 left-3 h-8 w-8 border-t border-l border-gold/40" />
          <div className="pointer-events-none absolute top-3 right-3 h-8 w-8 border-t border-r border-gold/40" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-8 w-8 border-b border-l border-gold/40" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-8 w-8 border-b border-r border-gold/40" />
        </motion.div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[28px_120px_1fr] gap-x-4 items-start">
      <span className="text-gold/70 mt-0.5 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span className="text-[0.6rem] uppercase tracking-widest2 text-gold/70 pt-1">
        {label}
      </span>
      <div className="text-bone/80 leading-relaxed text-sm">{children}</div>
    </div>
  );
}

/* ── Stylised SVG night map ─────────────────────────────── */
function NightMap() {
  // 50 deterministic star/window glints
  const stars = Array.from({ length: 60 }).map((_, i) => {
    // deterministic pseudo-random from i
    const seed = (i * 9301 + 49297) % 233280;
    const x = (seed % 600) + 10;
    const y = ((seed * 7) % 600) + 10;
    const r = ((seed % 8) / 8) * 1.2 + 0.5;
    return { i, x, y, r };
  });

  return (
    <svg
      viewBox="0 0 620 620"
      fill="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="locGlow" cx="50%" cy="50%" r="40%">
          <stop offset="0" stopColor="#c89b3c" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#c89b3c" stopOpacity="0.08" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="locWater" x1="0" y1="0" x2="0" y2="620">
          <stop offset="0" stopColor="#0a1422" />
          <stop offset="1" stopColor="#050810" />
        </linearGradient>
      </defs>

      <rect width="620" height="620" fill="url(#locWater)" />

      {/* Water — Marina channel (a flowing curve) */}
      <path
        d="M-20 360 C 80 320, 200 380, 280 340 S 460 360, 540 320 L 640 320 L 640 460 L 540 460 C 460 460, 380 420, 280 460 S 80 460, -20 460 Z"
        fill="#0a1828"
        opacity="0.7"
      />
      {/* Water shimmer lines */}
      {[400, 410, 420].map((y, i) => (
        <path
          key={y}
          d={`M-20 ${y} C 80 ${y - 6}, 200 ${y + 4}, 280 ${y - 2} S 460 ${y + 6}, 540 ${y - 4} L 640 ${y}`}
          stroke="#c89b3c"
          strokeWidth="0.4"
          fill="none"
          opacity={0.25 - i * 0.06}
        />
      ))}

      {/* Tower blocks */}
      {[
        { x: 60, y: 80, w: 40, h: 220 },
        { x: 120, y: 50, w: 50, h: 280 },
        { x: 200, y: 100, w: 36, h: 200 },
        { x: 260, y: 60, w: 44, h: 240 },
        { x: 360, y: 90, w: 38, h: 200 },
        { x: 420, y: 40, w: 50, h: 290 },
        { x: 500, y: 70, w: 40, h: 220 },
        { x: 560, y: 100, w: 36, h: 190 },
        { x: 90, y: 490, w: 44, h: 110 },
        { x: 180, y: 480, w: 38, h: 120 },
        { x: 260, y: 470, w: 50, h: 130 },
        { x: 360, y: 480, w: 42, h: 120 },
        { x: 450, y: 490, w: 38, h: 110 },
        { x: 530, y: 480, w: 44, h: 120 },
      ].map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill="#0d141c"
            stroke="#1a2638"
            strokeWidth="0.6"
          />
          {/* Window grid */}
          {Array.from({ length: Math.floor(b.h / 14) }).map((_, ry) =>
            Array.from({ length: Math.floor(b.w / 8) }).map((_, rx) => {
              const wx = b.x + 2 + rx * 8;
              const wy = b.y + 6 + ry * 14;
              const seed = (i * 31 + rx * 7 + ry * 3) % 13;
              const lit = seed > 8;
              return (
                <rect
                  key={`${rx}-${ry}`}
                  x={wx}
                  y={wy}
                  width={4}
                  height={7}
                  fill={lit ? "#c89b3c" : "#1a2638"}
                  opacity={lit ? 0.5 : 0.5}
                />
              );
            }),
          )}
        </g>
      ))}

      {/* Star/window glints */}
      {stars.map((s) => (
        <circle
          key={s.i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#c89b3c"
          opacity="0.4"
        />
      ))}

      {/* Glow on our tower */}
      <circle cx="310" cy="220" r="180" fill="url(#locGlow)" />

      {/* Saffron Flame pin */}
      <g>
        {/* Pulsing ring */}
        <circle cx="310" cy="220" r="22" stroke="#c89b3c" strokeWidth="1.2" fill="none">
          <animate
            attributeName="r"
            from="22"
            to="48"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.8"
            to="0"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="310" cy="220" r="14" fill="#c89b3c" opacity="0.25" />
        <circle cx="310" cy="220" r="6" fill="#ff7a3d" />
        <circle cx="310" cy="220" r="2.5" fill="#fff2cc" />

        {/* Label */}
        <line x1="310" y1="220" x2="310" y2="270" stroke="#c89b3c" strokeWidth="0.6" />
        <text
          x="310"
          y="290"
          textAnchor="middle"
          fill="#c89b3c"
          fontFamily="'Cormorant Garamond', serif"
          fontSize="18"
          fontStyle="italic"
        >
          Saffron Flame
        </text>
        <text
          x="310"
          y="306"
          textAnchor="middle"
          fill="#c89b3c"
          fontFamily="monospace"
          fontSize="8"
          letterSpacing="3"
          opacity="0.7"
        >
          TOWER 7
        </text>
      </g>

      {/* Compass */}
      <g transform="translate(560, 560)" opacity="0.6">
        <circle cx="0" cy="0" r="22" stroke="#c89b3c" strokeWidth="0.8" fill="none" />
        <line x1="0" y1="-20" x2="0" y2="20" stroke="#c89b3c" strokeWidth="0.5" />
        <line x1="-20" y1="0" x2="20" y2="0" stroke="#c89b3c" strokeWidth="0.5" />
        <text
          x="0"
          y="-12"
          textAnchor="middle"
          fill="#c89b3c"
          fontFamily="monospace"
          fontSize="9"
        >
          N
        </text>
      </g>
    </svg>
  );
}
