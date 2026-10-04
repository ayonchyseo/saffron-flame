import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { clamp } from '../lib/noise.js';
import { pchip, smooth, smoother, easeInOutCubic, easeOutCubic, easeOutBack, easeOutQuint, easeInCubic, easeInOutSine } from '../lib/ease.js';
import { PAGE_TOP_Y, BOOK } from './MenuCard.js';

export const KS = .15, ES = .36;
const BEAT = 60 / CONFIG.BPM;           // 0.5 s @120 BPM — every hit below lands on a beat
export const T = { S1: 0, S2: 2.0, S3: 3.5, S4: 6.0, S5: 8.0, S6: 9.5, FIN: 12.0, END: CONFIG.DURATION };

/** ───────────────────────────  PLAN  (human readable, also exported to plan.json) ─────────────────────────── */
export const PLAN = [
  { t: [0.0, 2.0],  scene: 'S1  Menu reveal',      beats: '1–4',   what: 'Black → warm light slit sweeps leather edge · macro push-in · menu yaws in 3D · foil “TODAY’S SPECIAL” ignites at 1.0 s · logo at 1.5 s' },
  { t: [2.0, 3.5],  scene: 'S2  Menu opens',        beats: '5–7',   what: 'Camera lifts to 3/4 top view · cover hinges open with leather flex · printed photo revealed, peels up (3.0–3.5) and dissolves into the 3D dish' },
  { t: [3.5, 6.0],  scene: 'S3  Hero food',         beats: '8–12',  what: 'Dish fully formed (plate lands 3.5) · steam · orbit → low-angle macro → rack-focus to cheese/sauce' },
  { t: [6.0, 8.0],  scene: 'S4  Ingredients',       beats: '13–16', what: 'Ingredients lift off the plate, spin, labelled · return to exact home pose at 7.5–8.0' },
  { t: [8.0, 9.5],  scene: 'S5  Menu information',  beats: '17–19', what: 'Camera pulls back & up · name → description → price' },
  { t: [9.5, 12.0], scene: 'S6  Multiple dishes',   beats: '20–24', what: 'Lava cake rises from page (9.5) · fries slide through (10.5) · shake spins into place (11.0)' },
  { t: [12.0, 14.0],scene: 'FINAL',                 beats: '25–28', what: 'Dishes collapse into the printed photo · menu closes (12.25–12.95) · camera cranes up · tagline · ORDER NOW' },
];
export const CUES = [
  { t: 0.0,  cue: 'cinematic bass hit / sub rise start' }, { t: 1.0, cue: 'foil ignite — shimmer riser peak' }, { t: 1.5, cue: 'logo reveal — soft impact' },
  { t: 2.0,  cue: 'menu-opening sound (leather creak + page rustle)' }, { t: 2.6, cue: 'whoosh (cover mid-swing)' }, { t: 3.0, cue: 'photo peel — rising swell' },
  { t: 3.5,  cue: 'plate placement + bass hit' }, { t: 3.6, cue: 'sizzle loop start' }, { t: 6.0, cue: 'ingredient lift — whoosh + impact' }, { t: 6.5, cue: 'sparkle tick ×5 (labels)' },
  { t: 7.5,  cue: 'ingredients return — reverse whoosh' }, { t: 8.0, cue: 'impact (settle)' }, { t: 8.5, cue: 'price hit' },
  { t: 9.5,  cue: 'cake rise — soft thump' }, { t: 10.5, cue: 'fries slide — whoosh' }, { t: 11.0, cue: 'shake rotate-in — whoosh + tick' }, { t: 12.0, cue: 'collapse — suction whoosh' },
  { t: 12.5, cue: 'menu close — leather thud' }, { t: 13.0, cue: 'FINAL bass drop' }, { t: 13.5, cue: 'CTA ping' },
];

/** ───────────────────────────  CAMERA TRACKS ─────────────────────────── */
//        t     value
export const CAMERA = {
  // spherical position about target (az/el in degrees, r in world units)
  az:  [[0, -34], [1.0, -16], [2.0, -4], [3.0, 0], [3.5, -22], [4.6, 18], [5.4, 52], [6.0, 62], [7.0, 40], [8.0, 14], [9.0, 0], [11.0, -4], [12.0, 0], [14, 0]],
  el:  [[0, 17], [1.0, 24], [2.0, 40], [2.5, 54], [2.9, 60], [3.5, 46], [4.4, 26], [5.2, 11], [6.0, 18], [7.0, 30], [8.0, 40], [9.0, 42], [11, 44], [12, 48], [12.9, 76], [14, 80]],
  r:   [[0, 1.55], [1.0, 1.9], [2.0, 3.8], [2.5, 6.0], [2.9, 7.2], [3.5, 8.0], [4.4, 6.2], [5.2, 4.6], [6.0, 7.0], [7.0, 11.8], [8.0, 11.4], [9.0, 11.0], [11, 10.2], [12, 10.4], [12.9, 14.4], [14, 14.6]],
  tx:  [[0, -1.0], [1.0, .15], [2.0, -.1], [3.0, -.5], [3.5, -.12], [6.0, -.12], [8.0, -.12], [9.0, 0], [12, 0], [14, 0]],
  ty:  [[0, .16], [2.0, .15], [3.0, .1], [3.5, .5], [5.2, .56], [6.0, .8], [7.0, 1.15], [8.0, 1.5], [9.0, 1.45], [10.5, .6], [12, .4], [12.9, .2], [14, .16]],
  tz:  [[0, -.4], [1.0, -.7], [2.0, .2], [3.0, -.25], [3.5, -.26], [8.0, -.26], [9.0, -.1], [10.5, .8], [12, .7], [12.9, 1.15], [14, 1.2]],
  fov: [[0, 24], [1.0, 24], [2.0, 30], [3.5, 30], [4.4, 26], [5.2, 22], [6.0, 26], [7.0, 30], [9.0, 31], [14, 31]],
  // focus point (rack focus)
  fx:  [[0, -.9], [1.0, .1], [2.0, -.1], [3.0, 0], [4.9, -.12], [5.4, .32], [5.9, -.12], [14, 0]],
  fy:  [[0, .16], [2.0, .15], [3.0, .12], [3.6, .55], [4.9, .62], [5.4, .5], [5.9, .6], [7.0, 1.2], [9.0, .5], [14, .15]],
  fz:  [[0, -.4], [1.0, -.7], [2.0, .1], [3.0, -.3], [4.9, -.26], [5.4, -.0], [5.9, -.26], [9.5, -.2], [10.5, .6], [14, 1.7]],
  ap:  [[0, 30], [1.0, 26], [2.0, 14], [3.0, 8], [3.5, 12], [5.2, 26], [6.0, 14], [8.0, 8], [9.5, 5], [14, 4]],
};

/** ───────────────────────────  LIGHT TRACKS ─────────────────────────── */
const L = {
  key:   pchip([[0, 0], [.3, 450], [1.0, 1100], [2.0, 1500], [3.0, 1100], [3.5, 840], [6, 840], [8, 780], [9.5, 760], [14, 700]]),
  rim:   pchip([[0, 0], [1.5, 0], [2.5, 110], [3.5, 300], [6, 300], [8, 200], [12, 160], [14, 160]]),
  kick:  pchip([[0, 0], [2.5, 0], [3.5, 28], [6, 28], [9, 14], [14, 10]]),
  fill:  pchip([[0, 0], [2.0, .1], [3.5, .5], [9, .55], [14, .6]]),
  env:   pchip([[0, .0], [.5, .015], [2.0, .3], [2.5, .6], [3.0, .6], [3.5, .75], [14, .7]]),
  shaft: pchip([[0, 0], [.4, .18], [1.0, .55], [2.0, .4], [3.5, .22], [6, .22], [9, .1], [14, .1]]),
  bokeh: pchip([[0, 0], [1.0, .15], [2.0, .5], [3.5, 1], [14, 1]]),
  angle: pchip([[0, .08], [1.0, .13], [2.0, .3], [3.5, .38], [14, .42]]),
  pen:   pchip([[0, .9], [2, .85], [3.5, .95], [14, .95]]),
  kpx: pchip([[0, -3.4], [2.0, -3.1], [3.5, -3.2], [14, -3.2]]), kpy: pchip([[0, 3.4], [2, 5.5], [3.5, 7.6], [14, 7.6]]), kpz: pchip([[0, 1.6], [2, 3.4], [3.5, 4.4], [14, 4.4]]),
  ktx: pchip([[0, -1.3], [.9, -.6], [1.7, 0], [3.5, 0], [14, 0]]), kty: pchip([[0, .15], [14, .2]]), ktz: pchip([[0, .1], [1.0, -.7], [2, -.2], [3.5, -.2], [14, -.2]]),
  exposure: pchip([[0, 1.1], [1.0, 1.0], [2.0, 1.0], [3.5, 1.0], [14, 1.0]]),
};

// ───────────────────────────── helpers ─────────────────────────────
export const subframes = t => (t > 2.3 && t < 3.2) ? 3 : (t > 6.0 && t < 6.7) ? 3 : (t > 10.4 && t < 11.1) ? 4 : (t > 11.0 && t < 11.7) ? 3 : (t > 12.0 && t < 12.7) ? 3 : 1;
const openAt = t => t < 7 ? easeInOutCubic(clamp((t - 2.0) / 1.2)) : 1 - easeInOutCubic(clamp((t - 12.25) / .7));
const explodeAt = t => t < 6.9 ? easeOutCubic(clamp((t - 6.0) / .9)) : (t < 7.4 ? 1 : 1 - easeInOutCubic(clamp((t - 7.4) / .6)));
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export class SceneTimeline {
  constructor(A) { this.A = A; this.v = new THREE.Vector3(); }
  /** pose of the hero dish (group transform + build/explode) */
  hero(t) {
    const base = [0, PAGE_TOP_Y + .004, -.3]; let pos = base, s = 1, vis = t >= 3.0 && t < 12.65, build = clamp((t - 3.0) / .85);
    // S5: levitate off the page
    const lev = smooth(8.0, 8.9, t) ; pos = [0, base[1] + .34 * lev, -.3];
    // S6: make room — drift to the top of the arrangement
    const mv = easeInOutCubic(clamp((t - 9.5) / .9)); pos = lerp3(pos, [0, .62 + Math.sin(t * 1.4) * .03, -1.55], mv); s = 1 - .26 * mv;
    // FINAL: collapse into the page
    const co = easeInCubic(clamp((t - 12.0) / .6)); pos = lerp3(pos, [0, PAGE_TOP_Y + .02, -.3], co); s *= 1 - .85 * co;
    return { pos, s, vis, build, rotY: .35 + t * .12, explode: explodeAt(t) };
  }
  extras(t) {
    const o = {}; const page = PAGE_TOP_Y + .01;
    const collapse = easeInCubic(clamp((t - 12.0) / .6)), fin = (p, tgt, s) => [lerp3(p, [0, page, -.3], collapse), s * (1 - .9 * collapse)];
    // cake — rises from the printed page
    { const k = clamp((t - 9.5) / .95), e = easeOutBack(k, 1.1), from = [-.62, page + .02, .75], to = [-.62, .5 + Math.sin(t * 1.5) * .035, .75];
      let [pos, s] = fin(lerp3(from, to, e), 0, .02 + .6 * smooth(0, .8, k)); o.cake = { vis: t > 9.5 && t < 12.65, pos, s: s, rot: [(1 - e) * .4, .6 + (1 - easeOutCubic(k)) * 2.2 + t * .1, (1 - e) * -.3] }; }
    // fries — slide through the frame, decelerating into place
    { const k = clamp((t - 10.5) / .85), e = easeOutQuint(k), from = [7.5, .9, .6], to = [.78, .5 + Math.sin(t * 1.3 + 1) * .035, .6];
      let [pos, s] = fin(lerp3(from, to, e), 0, 1.0); o.fries = { vis: t > 10.45 && t < 12.65, pos, s, rot: [.0, .3 - (1 - e) * .8, (1 - e) * .35] }; }
    // shake — rotates into position (two full turns decelerating) while scaling up
    { const k = clamp((t - 11.0) / .95), e = easeOutCubic(k), from = [.1, 2.7, 2.2], to = [.05, .55 + Math.sin(t * 1.2 + 2) * .035, 2.3];
      let [pos, s] = fin(lerp3(from, to, easeOutQuint(k)), 0, .3 + .65 * easeOutBack(k, .9)); o.shake = { vis: t > 11.0 && t < 12.65, pos, s, rot: [0, (1 - e) * Math.PI * 4 + .3, 0] }; }
    return o;
  }

  apply(t, withOverlay = false) {
    const A = this.A, { camera, rig, lighting, book, hero, heroGroup, extraObjs, particles, post } = A;
    // ───── book ─────
    const op = openAt(t), dt = 1 / 120, omega = (openAt(t + dt) - openAt(t - dt)) / (2 * dt) * Math.PI;
    book.root.rotation.y = pchip([[0, -.34], [1.2, -.06], [2.0, .04], [3.5, 0], [12, 0], [14, -.05]])(t);
    book.setOpen(op, omega);
    book.uTitle.value = -.5 + 2.1 * smooth(.85, 1.5, t); book.uLogo.value = -.5 + 2.1 * smooth(1.5, 2.1, t);
    const phLift = t < 8 ? smooth(3.0, 3.55, t) : 1 - smooth(12.1, 12.6, t), phFade = t < 8 ? 1 - smooth(3.3, 3.8, t) : smooth(12.1, 12.55, t);
    const shim = t < 8 ? Math.max(0, Math.sin(Math.PI * clamp((t - 2.9) / .8))) : 0;
    book.setPhotoState({ show: (t > 2.2 && t < 13.0) ? 1 : 0, lift: phLift, fade: (t < 3.0 ? smooth(2.3, 2.8, t) : phFade), shimmer: shim });
    // ───── hero ─────
    const h = this.hero(t); heroGroup.visible = h.vis; heroGroup.position.set(...h.pos); heroGroup.scale.setScalar(h.s); heroGroup.rotation.y = h.rotY;
    if (h.vis) hero.update({ build: h.build, explode: h.explode, time: t });
    // extras
    const ex = this.extras(t); for (const k in extraObjs) { const e = ex[k], o = extraObjs[k]; o.visible = e.vis; if (e.vis) { o.position.set(...e.pos); o.scale.setScalar(e.s); o.rotation.set(...e.rot); } }
    // ───── camera ─────
    const cam = rig.update(t);
    // ───── light ─────
    // light rig turns with the camera (like a studio turntable): key sits 55° off-axis & behind for rim-sculpted food, rim opposite
    const w = smooth(2.9, 3.7, t), ka = (cam.az + 55) * Math.PI / 180, ra = (cam.az + 165) * Math.PI / 180, hp = heroGroup.position;
    const kpA = [L.kpx(t), L.kpy(t), L.kpz(t)], kpB = [Math.sin(ka) * 7.2, 6.4, Math.cos(ka) * 7.2], rpB = [Math.sin(ra) * 7.5, 3.4, Math.cos(ra) * 7.5];
    const kp = lerp3(kpA, kpB, w), tgA = [L.ktx(t), L.kty(t), L.ktz(t)], tg = lerp3(tgA, [hp.x, .35, hp.z], w);
    lighting.apply({ key: L.key(t) * KS, rim: L.rim(t) * KS, kick: L.kick(t) * KS, fill: L.fill(t) * .5, env: L.env(t) * ES, shaft: L.shaft(t), bokeh: L.bokeh(t), keyAngle: L.angle(t), keyPenumbra: L.pen(t),
      keyPos: kp, keyTarget: tg, rimPos: lerp3([3.4, 4.6, -6], rpB, w) }, t);
    // ───── particles ─────
    const steam = smooth(3.6, 4.4, t) * (1 - smooth(11.6, 12.2, t)) * (t > 6 && t < 8 ? .8 : 1) * (t > 9.5 ? .8 : 1);
    particles.update(t, { steam, dust: t < 3 ? .9 * smooth(.2, .8, t) : .5, origin: heroGroup.position, scale: h.s, center: t < 3 ? new THREE.Vector3(-.3, .3, -.3) : new THREE.Vector3(0, .3, 0), dustRadius: t < 3 ? 1.8 : 4 });
    // ───── post uniforms ─────
    post.F.exposure.value = L.exposure(t); post.F.fade.value = smooth(0, .3, t); post.F.bloom.value = .55;
    post.F.flash.value = .05 * Math.max(0, 1 - Math.abs(t - 1.0) / .12) + .04 * Math.max(0, 1 - Math.abs(t - 3.55) / .1);
    return cam;
  }

  /** overlay typography — t is the *centre* time of the frame */
  overlay(t) {
    const { typo, cta, camera, hero } = this.A; typo.begin(); typo.master = 1;
    const W = typo.w, H = typo.h, P = v => { const q = v.clone().project(camera); return [(q.x * .5 + .5) * W, (1 - (q.y * .5 + .5)) * H]; };
    // S4 labels
    if (t > 6.0 && t < 8.0) {
      const items = [['veg', hero.parts.lettuce], ['protein', hero.parts.pat1], ['sauce', hero.ramekin], ['herbs', hero.herb], ['spice', hero.pinch]];
      items.forEach(([id, obj], i) => { const lab = CONFIG.INGREDIENTS.find(x => x.id === id)?.label || id; const v = new THREE.Vector3(); obj.getWorldPosition(v); const [sx, sy] = P(v);
        const p = smooth(6.55 + i * .1, 6.95 + i * .1, t) * (1 - smooth(7.35, 7.6, t)); typo.master = 1; typo.ingredientLabel(lab, sx, sy, p, sx > W / 2 ? -1 : 1, i); });
    }
    // S5 info
    if (t > 8.0 && t < 9.9) { typo.scrim(smooth(8.0, 8.5, t) * (1 - smooth(9.3, 9.65, t))); typo.master = 1 - smooth(9.3, 9.65, t); typo.dishInfo(8.0, t); typo.master = 1; }
    // S6 tags
    if (t > 10.0 && t < 12.2) {
      const ex = this.A.extraObjs, defs = CONFIG.EXTRA_DISHES, st = { cake: 10.35, fries: 11.25, shake: 11.9 }, anch = { cake: [0, .45, 0], fries: [0, 1.4, 0], shake: [0, 1.75, 0] };
      defs.forEach(d => { const o = ex[d.id]; if (!o || !o.visible) return; const v = new THREE.Vector3(...anch[d.id]).multiplyScalar(o.scale.x).add(o.position); const [sx, sy] = P(v);
        typo.master = 1 - smooth(11.75, 12.1, t); typo.dishTag(d.name, d.price, sx, sy - 74, smooth(st[d.id], st[d.id] + .5, t)); typo.master = 1; });
    }
    cta.draw(12.7, t);
    return typo.end();
  }
}
