"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu as MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "#story", label: "Our Story" },
  { href: "#menu", label: "Menu" },
  { href: "#experience", label: "Experience" },
  { href: "#location", label: "Visit" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-ink/80 backdrop-blur-md border-b border-gold/15"
            : "bg-transparent",
        )}
      >
        <div className="container flex h-20 items-center justify-between">
          <a
            href="#"
            data-cursor="hover"
            aria-label="Saffron Flame — home"
            className="flex items-center gap-3"
          >
            <Monogram />
            <span className="hidden sm:inline-block font-display text-xl tracking-wider text-bone">
              Saffron Flame
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-cursor="hover"
                className="group relative text-[0.7rem] uppercase tracking-widest2 text-bone/75 hover:text-gold transition-colors"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button asChild size="sm" variant="gold">
              <a href="#reserve">Reserve</a>
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setOpen(true)}
            data-cursor="hover"
            aria-label="Open menu"
            className="md:hidden text-bone hover:text-gold transition-colors"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-lg md:hidden"
          >
            <div className="container flex h-20 items-center justify-between">
              <div className="flex items-center gap-3">
                <Monogram />
                <span className="font-display text-xl text-bone">Saffron Flame</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-bone hover:text-gold transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="container mt-16 flex flex-col gap-8">
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className="font-display text-4xl text-bone hover:text-gold transition-colors"
                >
                  <span className="text-gold/40 text-xs tracking-widest2 mr-3 align-middle">
                    0{i + 1}
                  </span>
                  {item.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6"
              >
                <Button asChild size="lg" variant="gold">
                  <a href="#reserve" onClick={() => setOpen(false)}>
                    Reserve a Table
                  </a>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Monogram() {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 64 84"
      fill="none"
      aria-hidden
      className="text-gold"
    >
      <path
        d="M32 4 C 40 18, 56 28, 56 50 C 56 70, 44 82, 32 82 C 20 82, 8 70, 8 50 C 8 32, 24 22, 32 4 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M32 22 C 36 32, 44 38, 44 50 C 44 60, 38 68, 32 68 C 26 68, 20 60, 20 50 C 20 42, 28 36, 32 22 Z"
        fill="url(#navFlameGrad)"
      />
      <defs>
        <linearGradient id="navFlameGrad" x1="32" y1="22" x2="32" y2="68">
          <stop offset="0" stopColor="#fff2cc" />
          <stop offset="0.5" stopColor="#ff7a3d" />
          <stop offset="1" stopColor="#b8330e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
