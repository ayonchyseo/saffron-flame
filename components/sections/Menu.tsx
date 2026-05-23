'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';

import { CanvasShell } from '@/components/three/CanvasShell';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CATEGORIES, MENU } from '@/lib/data';
import type { MenuItem } from '@/types';
import { cn } from '@/lib/utils';

const MenuItem3D = dynamic(
  () => import('@/components/three/MenuItem3D').then((m) => m.MenuItem3D),
  { ssr: false },
);

type FilterId = (typeof CATEGORIES)[number]['id'] | 'all';

export function Menu() {
  const [filter, setFilter] = useState<FilterId>('all');
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const items = useMemo(
    () => (filter === 'all' ? MENU : MENU.filter((m) => m.category === filter)),
    [filter],
  );

  return (
    <section id="menu" className="relative py-32 md:py-48">
      <div className="container">
        <header className="max-w-3xl">
          <p className="eyebrow">Chapter Two · The Menu</p>
          <h2 className="h-display text-fluid-lg mt-3">
            Eight courses,<br />
            <em className="text-gold font-display italic">one fire.</em>
          </h2>
          <p className="mt-6 text-bone/70 leading-relaxed max-w-prose">
            Each plate is a study in restraint — three to five ingredients,
            cooked over wood and ember, finished with the patience of a
            kitchen that refuses shortcuts.
          </p>
        </header>

        {/* Category filter */}
        <div role="tablist" aria-label="Menu categories" className="mt-12 flex flex-wrap gap-2.5">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All Courses
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: (i % 6) * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <MenuCard item={item} onOpen={() => setSelected(item)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && <MenuDetail item={selected} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ── Filter chip ───────────────────────────────────────────────── */
function FilterChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      data-cursor="hover"
      className={cn(
        'h-9 px-4 text-[0.7rem] uppercase tracking-widest2 border transition-all duration-500',
        active
          ? 'bg-gold text-ink border-gold shadow-gold-glow'
          : 'border-gold/25 text-bone/70 hover:border-gold/60 hover:text-gold',
      )}
    >
      {children}
    </button>
  );
}

/* ── Menu card — hover-lifted, with its own R3F canvas ──────────── */
function MenuCard({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      role="button" tabIndex={0}
      data-cursor="hover"
      aria-label={`${item.name}, view detail`}
      className={cn(
        'group relative h-[420px] overflow-hidden cursor-pointer',
        'bg-gradient-to-b from-char/60 to-ink',
        'border border-gold/15 transition-all duration-700 will-transform',
        'hover:border-gold/45 hover:shadow-cinema hover:-translate-y-1',
      )}
    >
      {/* 3D thumbnail — top half */}
      <div className="relative h-56 bg-[radial-gradient(ellipse_at_center,hsl(var(--char))_0%,hsl(var(--ink))_70%)]">
        <CanvasShell camera={{ position: [0, 0.6, 2.6], fov: 38 }}>
          <MenuItem3D category={item.category} hovered={hovered} />
        </CanvasShell>

        {/* Decorative gold corner */}
        <div className="pointer-events-none absolute top-3 left-3 h-6 w-6 border-l border-t border-gold/50" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-r border-b border-gold/50" />

        {/* Category tag */}
        <span className="absolute top-3 right-3 text-[0.6rem] tracking-widest2 uppercase text-gold/80">
          {item.category}
        </span>
      </div>

      {/* Text — bottom half */}
      <div className="relative p-5 md:p-6">
        <h3 className="font-display text-2xl leading-tight">{item.name}</h3>
        <p className="mt-1 text-xs text-gold/80">{item.tagline}</p>

        <div className="mt-5 flex items-end justify-between">
          <p className="text-[0.65rem] text-bone/45 tracking-widest2 uppercase">
            {item.calories} kcal
          </p>
          <p className="font-display text-2xl text-gold tabular-nums">
            <span className="text-xs text-gold/70 mr-1.5 align-middle">AED</span>
            {item.priceAed}
          </p>
        </div>

        {/* Hover hint */}
        <span className="mt-4 block text-[0.6rem] uppercase tracking-widest2 text-bone/30 group-hover:text-gold transition-colors">
          Tap for chef’s notes →
        </span>
      </div>

      {/* Hover glow band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-gold to-transparent
                   opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      />
    </article>
  );
}

/* ── Detail modal body ─────────────────────────────────────────── */
function MenuDetail({ item }: { item: MenuItem }) {
  return (
    <div>
      <p className="eyebrow">{item.category} · Signature</p>
      <DialogTitle className="mt-2">{item.name}</DialogTitle>
      <p className="mt-1 text-gold text-sm">{item.tagline}</p>

      <DialogDescription className="mt-5">
        {item.description}
      </DialogDescription>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-2">Ingredients</p>
          <ul className="space-y-1.5 text-sm text-bone/80">
            {item.ingredients.map((ing) => (
              <li key={ing} className="flex items-start gap-2">
                <span className="text-gold mt-1.5">·</span>{ing}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div>
            <p className="eyebrow mb-1">Pairing</p>
            <p className="text-sm text-bone/85">{item.pairing}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="eyebrow mb-1">Calories</p>
              <p className="font-display text-2xl text-gold">{item.calories}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Price</p>
              <p className="font-display text-2xl text-gold">
                <span className="text-xs mr-1">AED</span>{item.priceAed}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-gold/15">
        <p className="eyebrow mb-2">Chef’s Note</p>
        <p className="text-bone/80 italic leading-relaxed">“{item.chefNote}”</p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild size="md" variant="outline">
          <a href="#reserve">Reserve for this dish</a>
        </Button>
      </div>
    </div>
  );
}
