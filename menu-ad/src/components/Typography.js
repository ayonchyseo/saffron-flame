import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { FONT, tracked, measureTracked, drawMonogram, wrapLines } from '../lib/typo.js';
import { easeOutCubic, easeInOutCubic, smooth } from '../lib/ease.js';

/** Screen-space typography layer (1080×1920 canvas → texture composited after tone-mapping, so it stays crisp). */
export class Typography {
  constructor(w, h) {
    this.w = w; this.h = h; this.canvas = document.createElement('canvas'); this.canvas.width = w; this.canvas.height = h; this.ctx = this.canvas.getContext('2d'); this.master = 1;
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.NoColorSpace; this.tex.minFilter = this.tex.magFilter = THREE.LinearFilter; this.tex.generateMipmaps = false; this.tex.premultiplyAlpha = true;
  }
  begin() { this.ctx.setTransform(1, 0, 0, 1, 0, 0); this.ctx.clearRect(0, 0, this.w, this.h); this.ctx.globalAlpha = 1; this.ctx.filter = 'none'; }
  /** soft top/bottom darkening so type stays readable on bright paper */
  scrim(a) { if (a <= 0) return; const c = this.ctx, H = this.h; c.save(); let g = c.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, `rgba(8,4,2,${.82 * a})`); g.addColorStop(1, 'rgba(8,4,2,0)'); c.fillStyle = g; c.fillRect(0, 0, this.w, 700);
    g = c.createLinearGradient(0, H - 760, 0, H); g.addColorStop(0, 'rgba(8,4,2,0)'); g.addColorStop(.55, `rgba(8,4,2,${.8 * a})`); g.addColorStop(1, `rgba(8,4,2,${.9 * a})`); c.fillStyle = g; c.fillRect(0, H - 760, this.w, 760); c.restore(); }
  end() { this.tex.needsUpdate = true; return this.tex; }
  gold(x0, x1, y0 = 0, y1 = 0) { const g = this.ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#b98a3c'); g.addColorStop(.35, '#f6dd9d'); g.addColorStop(.55, '#d9aa5b'); g.addColorStop(1, '#f0cf86'); return g; }

  /** animated text line. p 0..1 progress; style: {font, fill, spacing, align, shadow} */
  line(text, x, y, p, { font, fill = '#f6ecd8', spacing = 0, align = 'center', shadow = true, rise = 22, blur = 10 } = {}) {
    if (p <= 0.001) return; const c = this.ctx, e = easeOutCubic(Math.min(1, p));
    c.save(); c.globalAlpha = this.master * Math.min(1, p * 1.6); c.font = font; c.textBaseline = 'alphabetic';
    if (blur && p < 1) c.filter = `blur(${((1 - e) * blur).toFixed(2)}px)`;
    if (shadow) { c.shadowColor = 'rgba(0,0,0,.65)'; c.shadowBlur = 24; c.shadowOffsetY = 4; }
    c.fillStyle = fill; const yy = y + (1 - e) * rise;
    if (spacing) tracked(c, text, x, yy, spacing, align); else { c.textAlign = align; c.fillText(text, x, yy); }
    c.restore();
  }
  rule(x, y, w, p, color = 'rgba(217,170,91,.9)') { if (p <= 0) return; const c = this.ctx, e = easeInOutCubic(Math.min(1, p)); c.save(); c.globalAlpha = this.master * Math.min(1, p * 2); c.fillStyle = color; c.fillRect(x - w * e / 2, y, w * e, 2); c.beginPath(); c.arc(x, y + 1, 5 * e, 0, 7); c.fill(); c.restore(); }

  /** SCENE 5 — name → description → price (strong hierarchy) */
  dishInfo(t0, t) {
    const c = this.ctx, W = this.w, cx = W / 2, p = (d, len = .55) => smooth(t0 + d, t0 + d + len, t);
    this.line('TODAY’S SPECIAL', cx, 262, p(0, .5), { font: `500 30px ${FONT.sans}`, fill: '#d9aa5b', spacing: 12 });
    const nameLines = wrapLines((c.font = `700 92px ${FONT.display}`, c), CONFIG.DISH_NAME, W - 150);
    nameLines.forEach((ln, i) => this.line(ln, cx, 372 + i * 104, p(.12 + i * .1, .6), { font: `700 92px ${FONT.display}`, fill: '#fbf1dc' }));
    const ry = 372 + (nameLines.length - 1) * 104 + 54;
    this.rule(cx, ry, 300, p(.4, .5));
    c.font = `italic 400 44px ${FONT.serif}`; const dl = wrapLines(c, CONFIG.DESCRIPTION.replace(/\n/g, ' '), W - 220);
    dl.forEach((ln, i) => this.line(ln, cx, ry + 74 + i * 54, p(.5 + i * .08, .6), { font: `italic 500 44px ${FONT.serif}`, fill: 'rgba(250,236,210,.92)' }));
    // price — large, gold, with a soft glow
    const pp = p(.6, .6); if (pp > 0) {
      c.save(); c.font = `700 150px ${FONT.display}`; c.textAlign = 'center'; const e = easeOutCubic(pp); c.globalAlpha = this.master * Math.min(1, pp * 1.6);
      if (pp < 1) c.filter = `blur(${((1 - e) * 12).toFixed(1)}px)`;
      c.shadowColor = 'rgba(230,170,70,.55)'; c.shadowBlur = 44; c.fillStyle = this.gold(cx - 260, cx + 260);
      const y = 1388 + (1 - e) * 26, s = 1 + (1 - e) * .06; c.translate(cx, y); c.scale(s, s); c.fillText(CONFIG.PRICE, 0, 0); c.restore();
    }
  }
  /** SCENE 4 — ingredient call-outs attached to projected 3D anchors */
  ingredientLabel(label, sx, sy, p, side = 1, idx = 0) {
    if (p <= .001) return; const c = this.ctx, e = easeOutCubic(Math.min(1, p));
    const len = 70 + (idx % 2) * 26, ex = sx + side * len, ey = sy - 16 - (idx % 3) * 6;
    c.save(); c.globalAlpha = this.master * Math.min(1, p * 1.5);
    c.strokeStyle = 'rgba(240,205,130,.85)'; c.lineWidth = 2; c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 10;
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + (ex - sx) * e, sy + (ey - sy) * e); c.lineTo(sx + (ex - sx) * e + side * 36 * e, sy + (ey - sy) * e); c.stroke();
    c.fillStyle = '#f6dd9d'; c.beginPath(); c.arc(sx, sy, 7, 0, 7); c.fill(); c.strokeStyle = 'rgba(246,221,157,.55)'; c.beginPath(); c.arc(sx, sy, 7 + 10 * (1 - e) + 6, 0, 7); c.stroke();
    c.restore();
    this.line(label.toUpperCase(), ex + side * 48, ey + 9, Math.max(0, p - .25) / .75, { font: `600 31px ${FONT.sans}`, fill: '#fbf1dc', spacing: 5, align: side > 0 ? 'left' : 'right', rise: 8, blur: 6 });
  }
  /** SCENE 6 — tiny name+price tag floating by each dish */
  dishTag(name, price, sx, sy, p, align = 'center') {
    if (p <= .001) return; const c = this.ctx; c.save(); c.font = `600 30px ${FONT.sans}`; c.restore();
    this.line(name.toUpperCase(), sx, sy, p, { font: `600 32px ${FONT.sans}`, fill: '#fbf1dc', spacing: 5, align, rise: 12, blur: 6 });
    this.line(price, sx, sy + 66, Math.max(0, p - .15) / .85, { font: `700 60px ${FONT.display}`, fill: this.gold(sx - 120, sx + 120), align, rise: 10, blur: 6 });
  }
}
