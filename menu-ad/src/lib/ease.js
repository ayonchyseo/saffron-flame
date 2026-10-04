export const clamp01 = x => Math.min(1, Math.max(0, x));
export const easeInOutCubic = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
export const easeInCubic = t => t * t * t;
export const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
export const easeInOutQuint = t => t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
export const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack = (t, s = 1.70158) => { const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
export const easeOutExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const smoother = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
/** damped spring settle 0→1 with overshoot */
export const spring = (t, w = 9, z = .55) => t <= 0 ? 0 : t >= 3 ? 1 : 1 - Math.exp(-z * w * t) * (Math.cos(w * Math.sqrt(1 - z * z) * t) + z / Math.sqrt(1 - z * z) * Math.sin(w * Math.sqrt(1 - z * z) * t));
/** Monotone cubic (PCHIP) interpolation over [[t,v],...] — no overshoot, C1 continuous */
export function pchip(keys) {
  const n = keys.length, h = [], d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { h[i] = keys[i + 1][0] - keys[i][0]; d[i] = (keys[i + 1][1] - keys[i][1]) / h[i]; }
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (h[i - 1] + h[i])) / ((2 * h[i] + h[i - 1]) / d[i - 1] + (h[i] + 2 * h[i - 1]) / d[i]);
  m[0] = 0; m[n - 1] = 0; // zero-velocity ends (ease in / out)
  return t => {
    if (t <= keys[0][0]) return keys[0][1]; if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const s = (t - keys[i][0]) / h[i], s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * keys[i][1] + (s3 - 2 * s2 + s) * h[i] * m[i] + (-2 * s3 + 3 * s2) * keys[i + 1][1] + (s3 - s2) * h[i] * m[i + 1];
  };
}
