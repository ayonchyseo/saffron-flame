import * as THREE from 'three';
import { fbm, noise3, ridged, clamp, smoothstep, rng } from './noise.js';

export function canvasTex(c, { srgb = true, repeat = null, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = aniso; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.needsUpdate = true; return t;
}
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/** tileable scalar noise field -> grayscale canvas */
function tiled(fn, size) {
  return (u, v) => {
    const a = fn(u, v), b = fn(u - 1, v), c = fn(u, v - 1), d = fn(u - 1, v - 1);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };
}
export function microBump(size = 512, freq = 28, seed = 3) {
  const c = mk(size, size), x = c.getContext('2d'), img = x.createImageData(size, size);
  const f = tiled((u, v) => fbm(u * freq + seed, v * freq, seed * .7, 4, 2.1, .55) * .5 + .5, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const g = clamp(f(i / size, j / size) * 255, 0, 255), k = (j * size + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = g; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0); return canvasTex(c, { srgb: false, repeat: [1, 1] });
}

/** Leather: pebbled grain height + subtle colour variance */
export function leatherBump(size = 1024) {
  const c = mk(size, size), x = c.getContext('2d'), img = x.createImageData(size, size);
  const cell = (u, v) => { // voronoi-ish pebble via ridged noise
    return 1 - ridged(u * 70, v * 70, 4.2, 2) ;
  };
  const f = tiled(cell, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const g = clamp(f(i / size, j / size) * 255, 0, 255), k = (j * size + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = g; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0); return c; // returns canvas so MenuCard can stamp deboss on top
}

export function woodTextures(size = 1024) {
  const col = mk(size, size), rgh = mk(size, size), bmp = mk(size, size);
  const cx = col.getContext('2d'), rx = rgh.getContext('2d'), bx = bmp.getContext('2d');
  const ci = cx.createImageData(size, size), ri = rx.createImageData(size, size), bi = bx.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = i / size, v = j / size, k = (j * size + i) * 4;
    // long grain along u, warped rings
    const warp = fbm(u * 2.2, v * 9, 1.3, 3) * 1.4;
    const ring = Math.sin((v * 22 + warp * 6) * Math.PI) * .5 + .5;
    const fine = fbm(u * 6, v * 140, 7.7, 3) * .5 + .5;
    const pores = clamp(fbm(u * 90, v * 380, 3.1, 2) * .5 + .5, 0, 1);
    const t = clamp(ring * .35 + fine * .5 + pores * .15, 0, 1);
    // dark walnut
    const r = 34 + t * 46, g = 20 + t * 26, b = 12 + t * 15;
    ci.data[k] = r; ci.data[k + 1] = g; ci.data[k + 2] = b; ci.data[k + 3] = 255;
    const rr = 90 + (1 - pores) * 80 + fine * 30; ri.data[k] = ri.data[k + 1] = ri.data[k + 2] = clamp(rr, 0, 255); ri.data[k + 3] = 255;
    const bb = clamp((fine * .6 + pores * .4) * 255, 0, 255); bi.data[k] = bi.data[k + 1] = bi.data[k + 2] = bb; bi.data[k + 3] = 255;
  }
  cx.putImageData(ci, 0, 0); rx.putImageData(ri, 0, 0); bx.putImageData(bi, 0, 0);
  return { map: canvasTex(col, { repeat: [3, 3] }), roughnessMap: canvasTex(rgh, { srgb: false, repeat: [3, 3] }), bumpMap: canvasTex(bmp, { srgb: false, repeat: [3, 3] }) };
}

export function paperTexture(size = 1024, tint = [243, 233, 214]) {
  const c = mk(size, size), x = c.getContext('2d'), img = x.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = i / size, v = j / size, k = (j * size + i) * 4;
    const n = fbm(u * 55, v * 55, 2.2, 3) * .5 + .5, fib = fbm(u * 8, v * 220, 9.1, 2) * .5 + .5;
    const s = .93 + n * .05 + fib * .03;
    img.data[k] = tint[0] * s; img.data[k + 1] = tint[1] * s; img.data[k + 2] = tint[2] * s; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0); return c;
}

/** Tomato slice cap: skin ring, pericarp, gel chambers with seeds */
export function tomatoCap(size = 512) {
  const c = mk(size, size), x = c.getContext('2d'), R = size / 2, r = rng(11);
  x.fillStyle = '#8a1208'; x.fillRect(0, 0, size, size);
  let g = x.createRadialGradient(R, R, R * .1, R, R, R);
  g.addColorStop(0, '#e24a2e'); g.addColorStop(.55, '#d0301b'); g.addColorStop(.9, '#b01d0e'); g.addColorStop(1, '#7a0f06');
  x.fillStyle = g; x.beginPath(); x.arc(R, R, R * .98, 0, 7); x.fill();
  // central core
  x.fillStyle = '#f0b8a0'; x.beginPath(); x.arc(R, R, R * .1, 0, 7); x.fill();
  const N = 5;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + .3, a0 = a - .42, a1 = a + .42;
    x.save(); x.beginPath(); x.moveTo(R + Math.cos(a0) * R * .16, R + Math.sin(a0) * R * .16);
    x.arc(R, R, R * .74, a0, a1); x.lineTo(R + Math.cos(a1) * R * .16, R + Math.sin(a1) * R * .16); x.closePath();
    const gg = x.createRadialGradient(R + Math.cos(a) * R * .45, R + Math.sin(a) * R * .45, 4, R + Math.cos(a) * R * .45, R + Math.sin(a) * R * .45, R * .35);
    gg.addColorStop(0, '#f2b45a'); gg.addColorStop(1, '#e88a2c'); x.fillStyle = gg; x.fill(); x.clip();
    for (let s = 0; s < 14; s++) {
      const sa = a + (r() - .5) * .7, sd = R * (.28 + r() * .38);
      x.save(); x.translate(R + Math.cos(sa) * sd, R + Math.sin(sa) * sd); x.rotate(r() * 6);
      x.fillStyle = '#efe3a8'; x.beginPath(); x.ellipse(0, 0, 8, 5, 0, 0, 7); x.fill(); x.restore();
    }
    x.restore();
  }
  // glossy highlights speckle
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(255,120,90,${r() * .12})`; x.beginPath(); x.arc(r() * size, r() * size, r() * 3, 0, 7); x.fill(); }
  return canvasTex(c);
}

export function softSprite(size = 256, seed = 5) {
  const c = mk(size, size), x = c.getContext('2d'), img = x.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = i / size * 2 - 1, v = j / size * 2 - 1, d = Math.sqrt(u * u + v * v);
    const n = fbm(u * 2.2 + seed, v * 2.2, seed, 4) * .5 + .5;
    const a = clamp(1 - d, 0, 1); const m = Math.pow(a, 1.6) * smoothstep(.15, .75, n * .8 + a * .5);
    const k = (j * size + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = clamp(m * 255, 0, 255);
  }
  x.putImageData(img, 0, 0); return canvasTex(c);
}
export function glowSprite(size = 128) {
  const c = mk(size, size), x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size); return canvasTex(c);
}
export function ceramicSpeckle(size = 512) {
  const c = mk(size, size), x = c.getContext('2d'), r = rng(23); x.fillStyle = '#1b1a19'; x.fillRect(0, 0, size, size);
  const img = x.getImageData(0, 0, size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) { const n = fbm(i / size * 30, j / size * 30, 4.4, 3) * 8; const k = (j * size + i) * 4; img.data[k] += n; img.data[k + 1] += n; img.data[k + 2] += n; }
  x.putImageData(img, 0, 0);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${r() < .5 ? '90,80,70' : '8,8,8'},${.25 + r() * .4})`; x.beginPath(); x.arc(r() * size, r() * size, .5 + r() * 1.3, 0, 7); x.fill(); }
  return canvasTex(c, { repeat: [3, 3] });
}
