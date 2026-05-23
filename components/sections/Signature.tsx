'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/animations';
import { EmberParticles } from '@/components/three/EmberParticles';
import { SIGNATURE_PANELS } from '@/lib/data';
import { useIsMobile } from '@/hooks/useMediaQuery';

/**
 * SIGNATURE EXPERIENCE
 * GSAP horizontal-scroll: the section pins for its duration while panels glide
 * sideways. On mobile we fall back to a vertical stack so touch users don't
 * fight an unfamiliar gesture.
 */
export function Signature() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return; // No pinning on touch — vertical CSS layout takes over.
    if (!wrapperRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const panels = trackRef.current!.querySelectorAll('[data-panel]');
      const totalScroll = trackRef.current!.scrollWidth - window.innerWidth;

      gsap.to(trackRef.current, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Each panel fades its decorative ember layer as it leaves view.
      panels.forEach((panel) => {
        const embers = panel.querySelector('[data-embers]');
        if (!embers) return;
        gsap.fromTo(
          embers,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: ScrollTrigger.getById('signature-x') ?? undefined,
              start: 'left center',
              end: 'right center',
              scrub: true,
            },
          },
        );
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      id="experience"
      ref={wrapperRef}
      className="relative bg-ink"
    >
      <div className="container py-24 md:py-32">
        <p className="eyebrow">Chapter Three · The Experience</p>
        <h2 className="h-display text-fluid-lg mt-3 max-w-[16ch]">
          Four rooms, <em className="text-gold font-display italic">one night.</em>
        </h2>
      </div>

      {/* Horizontal track (desktop) / vertical stack (mobile) */}
      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className={
            isMobile
              ? 'flex flex-col gap-6 px-5 pb-24'
              : 'flex w-max h-[100svh] items-center will-transform'
          }
        >
          {SIGNATURE_PANELS.map((panel, i) => (
            <Panel key={panel.id} index={i} panel={panel} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single panel ─────────────────────────────────────────────── */
function Panel({
  panel, index, isMobile,
}: {
  panel: (typeof SIGNATURE_PANELS)[number];
  index: number;
  isMobile: boolean;
}) {
  // Distinct color washes per panel so the room feels its own.
  const accents = [
    'from-[#5c1f1a]/40 via-[#0d0a08] to-[#0d0a08]',         // fire
    'from-[#2a1d12]/60 via-[#0d0a08] to-[#0d0a08]',         // bar
    'from-[#3a2718]/60 via-[#0d0a08] to-[#0d0a08]',         // private
    'from-[#0d1a25]/50 via-[#0d0a08] to-[#0d0a08]',         // rooftop
  ];

  return (
    <article
      data-panel
      className={[
        'relative shrink-0 grid place-items-center',
        isMobile
          ? 'w-full h-[80svh] mx-auto border border-gold/15'
          : 'w-screen h-[100svh] px-12',
      ].join(' ')}
    >
      {/* Background wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accents[index] ?? accents[0]}`} />
      {/* Embers */}
      <div data-embers className="absolute inset-0">
        <EmberParticles count={isMobile ? 14 : 26} seed={index * 13 + 3} />
      </div>

      {/* Content */}
      <div className="relative max-w-2xl text-center md:text-left">
        <p className="eyebrow">{panel.eyebrow}</p>
        <h3 className="h-display text-5xl md:text-7xl mt-3">{panel.title}</h3>
        <p className="mt-6 text-bone/75 leading-relaxed text-base md:text-lg">{panel.body}</p>

        {panel.metric && (
          <div className="mt-10 flex md:justify-start justify-center items-baseline gap-3">
            <span className="font-display text-7xl md:text-9xl text-gold leading-none tabular-nums">
              {panel.metric.value}
            </span>
            <span className="eyebrow max-w-[8ch] text-left">{panel.metric.label}</span>
          </div>
        )}

        {/* Decorative number */}
        <span aria-hidden className="hidden md:block absolute -left-32 -top-16 font-display text-[14rem] leading-none text-gold/5 select-none">
          0{index + 1}
        </span>
      </div>
    </article>
  );
}
