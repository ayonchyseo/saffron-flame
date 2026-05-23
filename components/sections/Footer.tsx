"use client";

import { useState } from "react";
import { Instagram, Facebook, Twitter, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

const NAV = [
  ["Story", "#story"],
  ["Menu", "#menu"],
  ["Experience", "#experience"],
  ["Reserve", "#reserve"],
  ["Visit", "#location"],
];

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) {
      toast({
        variant: "sang",
        title: "Check your email",
        description: "That address didn't look right. Try again?",
      });
      return;
    }
    setBusy(true);
    // Simulate subscription handshake
    await new Promise((r) => setTimeout(r, 700));
    toast({
      variant: "gold",
      title: "Welcome to the list",
      description: "We'll write you when something is worth knowing.",
    });
    setEmail("");
    setBusy(false);
  };

  return (
    <footer className="relative overflow-hidden border-t border-gold/15 mt-20 pt-24 pb-10 bg-gradient-to-b from-ink to-[#050405]">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gold-line opacity-60" />

      <div className="container relative grid lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Brand + newsletter */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <svg width="32" height="40" viewBox="0 0 64 84" aria-hidden className="text-gold">
              <path
                d="M32 4 C 40 18, 56 28, 56 50 C 56 70, 44 82, 32 82 C 20 82, 8 70, 8 50 C 8 32, 24 22, 32 4 Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M32 22 C 36 32, 44 38, 44 50 C 44 60, 38 68, 32 68 C 26 68, 20 60, 20 50 C 20 42, 28 36, 32 22 Z"
                fill="url(#footerFlame)"
              />
              <defs>
                <linearGradient id="footerFlame" x1="32" y1="22" x2="32" y2="68">
                  <stop offset="0" stopColor="#fff2cc" />
                  <stop offset="0.5" stopColor="#ff7a3d" />
                  <stop offset="1" stopColor="#b8330e" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-display text-2xl tracking-wider text-bone">
              Saffron Flame
            </span>
          </div>

          <p className="mt-6 text-bone/65 leading-relaxed max-w-sm text-sm">
            A wood-fire steakhouse and Asian fusion table, fourteen floors above the
            Marina. Built around patience, smoke, and the slow hand of Chef Kenji
            Aoyama.
          </p>

          <form onSubmit={onSubscribe} className="mt-10 max-w-sm">
            <label
              htmlFor="newsletter"
              className="block text-[0.6rem] uppercase tracking-widest2 text-gold/70 mb-3"
            >
              The Quiet List · Once a season
            </label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  id="newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className="!py-2"
                />
              </div>
              <Button type="submit" size="sm" variant="gold" disabled={busy}>
                {busy ? "…" : <Send className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="mt-3 text-[0.6rem] text-bone/40 leading-relaxed">
              Quarterly notes from the pass. No marketing. Unsubscribe in one click.
            </p>
          </form>
        </div>

        {/* Visit */}
        <div className="lg:col-span-3">
          <p className="text-[0.6rem] uppercase tracking-widest2 text-gold/70 mb-5">
            Visit
          </p>
          <address className="not-italic text-sm text-bone/75 leading-relaxed space-y-3">
            <p>
              Marina Walk, Tower 7, Floor 14
              <br />
              Dubai Marina · UAE
            </p>
            <p>
              <a
                href="tel:+97140000000"
                data-cursor="hover"
                className="hover:text-gold transition-colors"
              >
                +971 4 000 0000
              </a>
            </p>
            <p>
              <a
                href="mailto:reserve@saffronflame.ae"
                data-cursor="hover"
                className="hover:text-gold transition-colors"
              >
                reserve@saffronflame.ae
              </a>
            </p>
            <p className="text-bone/50 pt-3 text-xs">
              Service · Sun–Thu 18:00 – 00:30
              <br />
              Fri–Sat 17:00 – 01:30
            </p>
            <p className="text-bone/50 text-xs">
              Complimentary valet from 17:30
            </p>
          </address>
        </div>

        {/* Site nav */}
        <div className="lg:col-span-2">
          <p className="text-[0.6rem] uppercase tracking-widest2 text-gold/70 mb-5">
            The Site
          </p>
          <ul className="space-y-3">
            {NAV.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  data-cursor="hover"
                  className="text-sm text-bone/75 hover:text-gold transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Instagram preview + social */}
        <div className="lg:col-span-3">
          <p className="text-[0.6rem] uppercase tracking-widest2 text-gold/70 mb-5">
            @saffronflame
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              "from-sang to-wine",
              "from-gold-600 to-gold",
              "from-ember-deep to-ember",
              "from-char to-ink",
              "from-gold to-gold-200",
              "from-ember to-gold-200",
            ].map((g, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                aria-label={`Instagram tile ${i + 1}`}
                className={`aspect-square bg-gradient-to-br ${g} relative overflow-hidden group`}
              >
                <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors" />
                <span className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
              </a>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            {[
              [Instagram, "Instagram"],
              [Facebook, "Facebook"],
              [Twitter, "Twitter"],
            ].map(([Icon, label]: any, i) => (
              <a
                key={label}
                href={`https://${String(label).toLowerCase()}.com`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                data-cursor="hover"
                className="grid h-10 w-10 place-items-center border border-gold/20 text-bone/65 hover:border-gold hover:text-gold transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Fine print */}
      <div className="container relative mt-20 pt-8 border-t border-gold/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[0.6rem] uppercase tracking-widest2 text-bone/40">
          © 2026 Saffron Flame · Dubai Marina · United Arab Emirates
        </p>
        <p className="text-[0.6rem] uppercase tracking-widest2 text-bone/40">
          Designed with restraint
        </p>
      </div>
    </footer>
  );
}
