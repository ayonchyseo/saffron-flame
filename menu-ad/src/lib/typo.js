// Canvas typography helpers (fonts are loaded in main.js before any drawing happens).
export const FONT = { display: '"Playfair Display", serif', serif: '"Cormorant Garamond", serif', sans: 'Inter, sans-serif', taka: '"Hind Siliguri", "Playfair Display", serif' };
export function tracked(ctx, text, x, y, spacing = 0, align = 'center') {
  const chars = [...text]; const widths = chars.map(c => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + spacing; });
  return total;
}
export function measureTracked(ctx, text, spacing = 0) { return [...text].reduce((a, c) => a + ctx.measureText(c).width, 0) + spacing * (text.length - 1); }
/** Flame-in-crocus monogram: three saffron stigma-flames. Pure vector, no assets. */
export function drawMonogram(ctx, cx, cy, s, fill) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.fillStyle = fill; ctx.strokeStyle = fill;
  const flame = (x, y, w, h, rot) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(w, -h * .25, w * .9, -h * .7, 0, -h); ctx.bezierCurveTo(-w * .2, -h * .62, -w * 1.05, -h * .3, 0, 0); ctx.fill(); ctx.restore(); };
  flame(0, 26, 20, 74, 0); flame(-6, 28, 15, 58, -.62); flame(6, 28, 15, 58, .62);
  ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 8, 46, Math.PI * .08, Math.PI * .92); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34, 44); ctx.quadraticCurveTo(0, 62, 34, 44); ctx.stroke();
  ctx.restore();
}
export function wrapLines(ctx, text, maxW) {
  const out = []; text.split('\n').forEach(par => { let line = ''; par.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); }); return out;
}
