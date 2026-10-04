import { CONFIG } from '../config.js';
import { FONT, tracked, drawMonogram } from '../lib/typo.js';
import { smooth, easeOutCubic, easeOutBack, easeInOutCubic } from '../lib/ease.js';

/** Last frame: brand lockup → "Taste the difference." → ORDER NOW (pulsing pill). Kept clean and premium. */
export class FinalCTA {
  constructor(typo) { this.t = typo; }
  draw(t0, t) {
    const T = this.t, c = T.ctx, W = T.w, cx = W / 2, p = (d, len = .6) => smooth(t0 + d, t0 + d + len, t);
    T.line(CONFIG.RESTAURANT_NAME, cx, 1106, p(0, .7), { font: `700 74px ${FONT.display}`, fill: T.gold(cx - 330, cx + 330), spacing: 16 });
    T.line(CONFIG.RESTAURANT_TAGLINE, cx, 1214, p(.3, .55), { font: `italic 500 70px ${FONT.serif}`, fill: '#fbf1dc', rise: 26 });
    T.rule(cx, 1252, 220, p(.5, .5));
    // CTA pill
    const pc = p(.7, .45); if (pc > 0) {
      const e = easeOutBack(Math.min(1, pc), 1.5), w = 560, h = 128, y = 1380, pulse = (Math.sin((t - t0) * 5.2) * .5 + .5);
      c.save(); c.globalAlpha = Math.min(1, pc * 1.6); c.translate(cx, y); c.scale(e, e);
      // soft pulse ring
      c.strokeStyle = `rgba(240,205,130,${.35 * (1 - pulse)})`; c.lineWidth = 3; this._pill(c, -w / 2 - 14 - pulse * 26, -h / 2 - 14 - pulse * 26, w + 28 + pulse * 52, h + 28 + pulse * 52); c.stroke();
      c.shadowColor = 'rgba(240,170,60,.55)'; c.shadowBlur = 50; const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#c9923f'); g.addColorStop(.5, '#f7de9f'); g.addColorStop(1, '#d9a24c');
      c.fillStyle = g; this._pill(c, -w / 2, -h / 2, w, h); c.fill(); c.shadowBlur = 0;
      // sheen sweep
      c.save(); this._pill(c, -w / 2, -h / 2, w, h); c.clip(); const sx = -w + ((t - t0) * 420) % (w * 2.2); const sg = c.createLinearGradient(sx, 0, sx + 140, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(sx, -h / 2, 140, h); c.restore();
      c.fillStyle = '#1a0d08'; c.font = `700 52px ${FONT.sans}`; c.textBaseline = 'middle'; tracked(c, CONFIG.CTA, -34, 3, 9);
      // arrow
      c.strokeStyle = '#1a0d08'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; const ax = w / 2 - 78; c.beginPath(); c.moveTo(ax, 3); c.lineTo(ax + 44, 3); c.moveTo(ax + 28, -13); c.lineTo(ax + 44, 3); c.lineTo(ax + 28, 19); c.stroke();
      c.restore();
    }
    if (CONFIG.CTA_SUB) T.line(CONFIG.CTA_SUB.toUpperCase(), cx, 1508, p(1.05, .45), { font: `500 26px ${FONT.sans}`, fill: 'rgba(250,236,210,.8)', spacing: 7 });
  }
  _pill(c, x, y, w, h) { const r = h / 2; c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2); c.lineTo(x + r, y + h); c.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5); c.closePath(); }
}
