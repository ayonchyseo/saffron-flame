"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type SoundCtx = {
  enabled: boolean;
  toggle: () => void;
};

const Ctx = createContext<SoundCtx>({ enabled: false, toggle: () => {} });

/**
 * SoundProvider
 *
 * Generates an ambient restaurant soundscape entirely from WebAudio nodes —
 * no external mp3 needed, ships nothing extra, and respects the browser's
 * autoplay rules by waiting for an explicit user gesture (the toggle).
 *
 * Layers:
 *  1. Filtered pink-ish noise → low murmur / room tone
 *  2. Low-frequency oscillator → fire crackle modulation
 *  3. Sparse "glass clink" envelope on a high sine
 */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    ctxRef.current = ctx;

    // ---- 1. Pink-ish noise via short noise buffer + lowpass
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 520;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.16;

    // ---- 2. Fire crackle LFO modulation
    const crackleOsc = ctx.createOscillator();
    crackleOsc.frequency.value = 0.3;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.05;
    crackleOsc.connect(crackleGain).connect(noiseGain.gain);

    // ---- 3. Master with subtle compressor
    const master = ctx.createDynamicsCompressor();
    master.threshold.value = -22;
    master.ratio.value = 4;

    const out = ctx.createGain();
    out.gain.value = 0.35;

    noise.connect(lowpass).connect(noiseGain).connect(master).connect(out).connect(ctx.destination);

    noise.start();
    crackleOsc.start();

    // ---- 4. Sparse glass clink chimes (random scheduling)
    let clinkTimer: number | null = null;
    const scheduleClink = () => {
      const when = ctx.currentTime + 0.05;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = 1500 + Math.random() * 1200;
      osc.type = "sine";
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.04, when + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.4);
      osc.connect(g).connect(out);
      osc.start(when);
      osc.stop(when + 0.45);
      clinkTimer = window.setTimeout(scheduleClink, 4500 + Math.random() * 7000);
    };
    clinkTimer = window.setTimeout(scheduleClink, 2000);

    cleanupRef.current = () => {
      try { noise.stop(); crackleOsc.stop(); } catch {}
      if (clinkTimer) window.clearTimeout(clinkTimer);
      ctx.close();
    };
  }, []);

  const toggle = useCallback(() => {
    if (!enabled) {
      start();
      setEnabled(true);
    } else {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setEnabled(false);
    }
  }, [enabled, start]);

  useEffect(() => () => cleanupRef.current?.(), []);

  return <Ctx.Provider value={{ enabled, toggle }}>{children}</Ctx.Provider>;
}

export const useSound = () => useContext(Ctx);
