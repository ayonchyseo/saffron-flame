import * as THREE from 'three';
import { fbm, noise3, clamp, smoothstep, rng, mix } from '../lib/noise.js';
import { microBump, tomatoCap, ceramicSpeckle } from '../lib/textures.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
let _bump;
export const shared = () => (_bump ||= { micro: microBump(512, 34, 3), coarse: microBump(512, 9, 8), speckle: ceramicSpeckle(512) });
const shadow = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

function colorize(geo, fn) {
  const p = geo.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
  for (let i = 0; i < p.count; i++) { fn(p.getX(i), p.getY(i), p.getZ(i), col, i); c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo;
}
/** displace along normals by fn(x,y,z) */
function displace(geo, fn) {
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal, v = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); nn.fromBufferAttribute(n, i); const d = fn(v.x, v.y, v.z); p.setXYZ(i, v.x + nn.x * d, v.y + nn.y * d, v.z + nn.z * d); }
  geo.computeVertexNormals(); return geo;
}
// weld seam so lathe displacement doesn't tear
function lathe(points, seg = 128) { const g = new THREE.LatheGeometry(points.map(p => new THREE.Vector2(p[0], p[1])), seg); return g; }

/* ───────────────────────────── BUNS ───────────────────────────── */
export function bunBottom() {
  const pts = [[0, 0], [.30, 0], [.44, .008], [.50, .035], [.525, .09], [.515, .15], [.50, .185], [.46, .19], [0, .19]];
  const spline = new THREE.SplineCurve(pts.map(p => new THREE.Vector2(...p))).getPoints(48);
  const g = lathe(spline.map(p => [Math.max(0, p.x), p.y]), 160);
  displace(g, (x, y, z) => fbm(x * 6, y * 6, z * 6, 3) * .012);
  colorize(g, (x, y, z, c) => {
    const r = Math.hypot(x, z), side = smoothstep(.40, .52, r) * smoothstep(.0, .12, y) * (1 - smoothstep(.15, .19, y));
    const n = fbm(x * 9, y * 9, z * 9, 3) * .5 + .5;
    c.setRGB(.60 + n * .10, .33 + n * .08, .09 + n * .04).lerp(new THREE.Color(.46, .21, .05), side * .55);
    if (y > .187 && r < .47) c.setRGB(.82, .64, .38); // cut (crumb) face
  });
  const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .55, clearcoat: .25, clearcoatRoughness: .45, bumpMap: shared().micro, bumpScale: 1.4, sheen: .6, sheenRoughness: .6, sheenColor: new THREE.Color('#d9a45a') });
  return shadow(new THREE.Mesh(g, m));
}
export function bunTop() {
  const prof = [];
  for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI / 2; prof.push([Math.sin(a) * .535 * (1 - .10 * Math.pow(Math.sin(a), 6)), .33 * Math.pow(Math.cos(a), .72) * (1 - .06 * Math.sin(a))]); }
  const pts = [[0, 0], [.46, 0], [.50, .01], ...prof.reverse().filter(p => p[1] > .015).map(p => p)];
  // ensure monotone path: base ring → dome apex
  const dome = prof.slice().sort((a, b) => b[0] - a[0]);
  const base = [[0, 0], [.44, 0], [.51, .012], [.54, .06]];
  const arr = [...base, ...dome.filter(p => p[1] > .06), [0, .33]];
  const g = lathe(arr, 176);
  displace(g, (x, y, z) => fbm(x * 5, y * 5, z * 5, 3, 2, .5) * .018 + noise3(x * 22, y * 22, z * 22) * .0035);
  colorize(g, (x, y, z, c) => {
    const r = Math.hypot(x, z), h = clamp(y / .33), n = fbm(x * 7, y * 7, z * 7, 4) * .5 + .5;
    // egg-washed brioche: glossy deep amber crown, golden shoulders, pale base
    const crown = smoothstep(.2, .85, h);
    c.setRGB(.62 - .14 * crown + n * .08, .33 - .15 * crown + n * .06, .09 - .05 * crown + n * .02);
    c.lerp(new THREE.Color(.33, .13, .03), smoothstep(.35, 1, fbm(x * 3.5 + 4, y * 3, z * 3.5, 3) * .5 + .5) * crown * .8);
    if (y < .015) c.setRGB(.72, .52, .30);
  });
  const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .46, clearcoat: .5, clearcoatRoughness: .38, bumpMap: shared().micro, bumpScale: 1.6, sheen: .35, sheenColor: new THREE.Color('#e9b46a') });
  const top = new THREE.Group(); top.add(new THREE.Mesh(g, m));
  // sesame seeds — instanced, aligned to the dome normal
  const r = rng(77), N = 170, sg = new THREE.SphereGeometry(1, 10, 8);
  const sm = new THREE.MeshPhysicalMaterial({ color: '#efdcb2', roughness: .42, clearcoat: .4, sheen: .3 });
  const inst = new THREE.InstancedMesh(sg, sm, N), d = new THREE.Object3D(), qa = new THREE.Quaternion(), up = V(0, 1, 0);
  const col = new THREE.Color();
  const domeAt = a => ({ x: Math.sin(a) * .535 * (1 - .10 * Math.pow(Math.sin(a), 6)), y: .33 * Math.pow(Math.cos(a), .72) * (1 - .06 * Math.sin(a)) });
  let placed = 0, tries = 0;
  while (placed < N && tries++ < 4000) {
    const a = Math.acos(1 - r() * .97) * .55 + .0; if (a > 1.25) continue; // keep to crown/shoulders
    const th = r() * Math.PI * 2, p = domeAt(a), p2 = domeAt(a + .01);
    const tx = p2.x - p.x, ty = p2.y - p.y, len = Math.hypot(tx, ty) || 1;
    const nrm = V(-ty / len * Math.cos(th), tx / len, -ty / len * Math.sin(th)).normalize();
    // pull the normal upward-outward correctly
    if (nrm.y < 0) nrm.negate();
    const pos = V(p.x * Math.cos(th), p.y, p.x * Math.sin(th));
    // displaced base offsets: sample bump of the dome surface
    pos.addScaledVector(nrm, .004 + fbm(pos.x * 5, pos.y * 5, pos.z * 5, 3) * .018);
    d.position.copy(pos); qa.setFromUnitVectors(up, nrm); d.quaternion.copy(qa).multiply(new THREE.Quaternion().setFromAxisAngle(up, r() * 6.28));
    const s = .8 + r() * .5; d.scale.set(.026 * s, .0085 * s, .0135 * s); d.updateMatrix(); inst.setMatrixAt(placed, d.matrix);
    col.setRGB(.88 - r() * .12, .76 - r() * .12, .52 - r() * .14); inst.setColorAt(placed, col); placed++;
  }
  inst.count = placed; top.add(inst);
  return shadow(top);
}

/* ───────────────────────────── PATTY ───────────────────────────── */
export function patty(radius = .56, thick = .14, seed = 5) {
  const seg = 160, rad = 36, g = new THREE.CylinderGeometry(radius, radius, thick, seg, rad, false);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const r = Math.hypot(x, z), a = Math.atan2(z, x);
    // lacy smash edge: radial jaggedness grows with r
    const lace = (fbm(Math.cos(a) * 3 + seed, Math.sin(a) * 3, y * 2, 3) * .5 + .5);
    const jag = 1 + (lace - .45) * .10 * smoothstep(.7, 1, r / radius) + noise3(Math.cos(a) * 14, Math.sin(a) * 14, seed) * .025 * smoothstep(.8, 1, r / radius);
    x *= jag; z *= jag;
    const top = y > 0, rr = r / radius;
    // bumpy, craggy surface
    let yy = y; if (Math.abs(y) > thick * .45) yy += Math.sign(y) * (fbm(x * 9, 0, z * 9, 4) * .018 + noise3(x * 30, 1, z * 30) * .005) - (top ? smoothstep(.85, 1, rr) * .03 : 0);
    // rounded rim
    if (rr > .94) yy -= Math.sign(y) * (rr - .94) * thick * .9 * (top ? 1 : .6);
    p.setXYZ(i, x, yy, z);
  }
  g.computeVertexNormals();
  colorize(g, (x, y, z, c) => {
    const r = Math.hypot(x, z) / radius, n = fbm(x * 11, y * 5, z * 11, 4) * .5 + .5, n2 = noise3(x * 40, y * 40, z * 40) * .5 + .5;
    c.setRGB(.17 + n * .07, .075 + n * .035, .04 + n * .02);
    const crisp = smoothstep(.78, 1.0, r); // dark crispy lacy edge
    c.lerp(new THREE.Color(.05, .022, .012), crisp * .75);
    if (Math.abs(y) < thick * .30) c.lerp(new THREE.Color(.22, .1, .06), .55 * (1 - crisp)); // side: seared band (juicier)
    c.lerp(new THREE.Color(.46, .22, .1), smoothstep(.72, .95, n2) * .45 * (1 - crisp)); // rendered-fat sheen spots
  });
  const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .5, clearcoat: .55, clearcoatRoughness: .32, bumpMap: shared().micro, bumpScale: 2.2, sheen: .2 });
  const mesh = new THREE.Mesh(g, m);
  const grp = new THREE.Group(); grp.add(mesh);
  return shadow(grp);
}

/* ───────────────────────────── CHEESE ───────────────────────────── */
export function cheese(size = .96, patR = .53, seed = 2) {
  const N = 64, g = new THREE.PlaneGeometry(size, size, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z);
    const over = Math.max(0, d - patR * .88);
    const droop = Math.pow(over / .35, 1.5) * .17 + fbm(x * 7 + seed, 0, z * 7, 3) * .02 * smoothstep(.2, .6, d);
    const edge = (Math.max(Math.abs(x), Math.abs(z)) / (size / 2));
    const wave = Math.sin(Math.atan2(z, x) * 5 + seed) * .012 * edge * edge + fbm(x * 12, 1, z * 12, 2) * .01;
    p.setY(i, -droop + wave + fbm(x * 15, 2, z * 15, 2) * .004);
  }
  g.computeVertexNormals();
  const m = new THREE.MeshPhysicalMaterial({ color: '#e08a14', roughness: .34, clearcoat: .7, clearcoatRoughness: .25, sheen: .4, sheenColor: new THREE.Color('#ffc65a'), sheenRoughness: .5, side: THREE.DoubleSide, emissive: new THREE.Color('#3a1800'), emissiveIntensity: .12, bumpMap: shared().micro, bumpScale: .5 });
  const top = new THREE.Mesh(g, m);
  // thickness: duplicate shell slightly below
  const under = new THREE.Mesh(g, m); under.position.y = -.014;
  const grp = new THREE.Group(); grp.add(top, under); return shadow(grp);
}

/* ───────────────────────────── LETTUCE ───────────────────────────── */
export function lettuce(R = .66, seed = 1) {
  const radial = 44, ang = 160, pos = [], idx = [], uv = [];
  for (let i = 0; i <= radial; i++) for (let j = 0; j <= ang; j++) {
    const rr = i / radial, a = j / ang * Math.PI * 2;
    const frill = fbm(Math.cos(a) * 2.2 + seed, Math.sin(a) * 2.2, rr * 1.2, 3) * .5 + .5;
    const edgeR = R * (1 + .06 * Math.sin(a * 11 + seed) * smoothstep(.6, 1, rr) + (frill - .5) * .22 * smoothstep(.5, 1, rr));
    const r = rr * edgeR;
    const wave = Math.sin(a * 13 + rr * 4 + seed) * .045 * smoothstep(.35, 1, rr) + Math.sin(a * 27 + rr * 9) * .015 * smoothstep(.6, 1, rr);
    const y = wave + (rr * rr) * .06 + fbm(Math.cos(a) * 3, Math.sin(a) * 3, rr * 3, 3) * .04 * rr;
    pos.push(Math.cos(a) * r, y, Math.sin(a) * r); uv.push(j / ang, rr);
  }
  for (let i = 0; i < radial; i++) for (let j = 0; j < ang; j++) { const a = i * (ang + 1) + j, b = a + ang + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  colorize(g, (x, y, z, c) => {
    const r = Math.hypot(x, z) / R, a = Math.atan2(z, x), vein = Math.pow(Math.abs(Math.sin(a * 9 + noise3(x * 3, 0, z * 3) * 1.4)), 22) * (1 - r) * .5;
    c.setRGB(.34, .62, .13).lerp(new THREE.Color(.66, .80, .26), smoothstep(.95, .1, r) * .8).lerp(new THREE.Color(.84, .9, .5), vein);
    c.multiplyScalar(.85 + (fbm(x * 8, 0, z * 8, 3) * .5 + .5) * .3);
  });
  const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .42, clearcoat: .35, clearcoatRoughness: .5, side: THREE.DoubleSide, emissive: new THREE.Color('#2f6a0a'), emissiveIntensity: .22, sheen: .5, sheenColor: new THREE.Color('#bfe86a'), bumpMap: shared().coarse, bumpScale: 1.0 });
  return shadow(new THREE.Mesh(g, m));
}

/* ───────────────────────── TOMATO / ONION / PICKLE ───────────────────────── */
export function tomatoSlice(R = .46, t = .05) {
  const g = new THREE.CylinderGeometry(R, R, t, 96, 1);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x); const k = 1 + .015 * noise3(Math.cos(a) * 3, Math.sin(a) * 3, 1); p.setX(i, x * k); p.setZ(i, z * k); }
  g.computeVertexNormals();
  const cap = tomatoCap(512);
  const side = new THREE.MeshPhysicalMaterial({ color: '#b3200f', roughness: .22, clearcoat: 1, clearcoatRoughness: .1 });
  const face = new THREE.MeshPhysicalMaterial({ map: cap, roughness: .2, clearcoat: 1, clearcoatRoughness: .08, emissive: new THREE.Color('#a01808'), emissiveIntensity: .15, bumpMap: shared().coarse, bumpScale: .4 });
  const mesh = new THREE.Mesh(g, [side, face, face]); return shadow(mesh);
}
export function onionRing(R = .3, w = .035) {
  const g = new THREE.TorusGeometry(R, w, 14, 80); g.rotateX(Math.PI / 2); g.scale(1, .45, 1);
  displace(g, (x, y, z) => fbm(x * 8, y * 8, z * 8, 2) * .006);
  const m = new THREE.MeshPhysicalMaterial({ color: '#e7cfe0', roughness: .25, clearcoat: .9, transmission: 0, emissive: new THREE.Color('#8a5a80'), emissiveIntensity: .12, sheen: .6, sheenColor: new THREE.Color('#ffffff') });
  return shadow(new THREE.Mesh(g, m));
}
export function pickle(R = .13) {
  const g = new THREE.CylinderGeometry(R, R, .03, 40, 1); displace(g, (x, y, z) => fbm(x * 18, y * 18, z * 18, 3) * .008);
  const m = new THREE.MeshPhysicalMaterial({ color: '#7e9a2d', roughness: .28, clearcoat: .8, bumpMap: shared().micro, bumpScale: 1.5, emissive: new THREE.Color('#2a3a05'), emissiveIntensity: .2 });
  return shadow(new THREE.Mesh(g, m));
}

/* ───────────────────────────── SAUCE ───────────────────────────── */
export const sauceMat = () => new THREE.MeshPhysicalMaterial({ color: '#d85a1f', roughness: .12, clearcoat: 1, clearcoatRoughness: .05, sheen: .6, sheenColor: new THREE.Color('#ffb066'), emissive: new THREE.Color('#5a1a00'), emissiveIntensity: .25, ior: 1.45 });
/** glossy sauce ribbon + drips. `path` is an array of Vector3 */
export function sauceDrizzle(R = .46, seed = 4) {
  const r = rng(seed), grp = new THREE.Group(), mat = sauceMat();
  const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2 * 1.6 + r() * .02; const rr = R * (.55 + .4 * Math.sin(i * .5)) * (1 - i / 80); pts.push(V(Math.cos(a) * rr, Math.sin(i * 1.1) * .004, Math.sin(a) * rr)); }
  const curve = new THREE.CatmullRomCurve3(pts); const tube = new THREE.TubeGeometry(curve, 220, .02, 12, false);
  displace(tube, (x, y, z) => fbm(x * 9, y * 9, z * 9, 2) * .006);
  grp.add(new THREE.Mesh(tube, mat));
  for (let i = 0; i < 7; i++) { const a = r() * 6.28, rr = R * (.8 + r() * .22); const d = new THREE.Mesh(new THREE.SphereGeometry(.018 + r() * .016, 14, 10), mat); d.scale.y = .55; d.position.set(Math.cos(a) * rr * .6, .006, Math.sin(a) * rr * .6); grp.add(d); }
  return shadow(grp);
}
export function sauceDrip(len = .2, w = .03) {
  const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([w * (t < .85 ? .72 + .28 * (1 - t) : Math.sqrt(Math.max(0, 1 - Math.pow((t - .85) / .15, 2))) * 1.15), -t * len]); }
  const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(Math.max(p[0], .001), p[1])), 18);
  return shadow(new THREE.Mesh(g, sauceMat()));
}

/* ───────────────────────────── FRIES ───────────────────────────── */
export function friesCluster(n = 70, seed = 9, spread = .16, height = .62) {
  const r = rng(seed), geo = new THREE.BoxGeometry(1, 1, 1, 2, 2, 8);
  displace(geo, (x, y, z) => fbm(x * 9, y * 9, z * 5, 2) * .02);
  const m = new THREE.MeshPhysicalMaterial({ roughness: .55, clearcoat: .35, clearcoatRoughness: .5, bumpMap: shared().micro, bumpScale: 2, sheen: .4, sheenColor: new THREE.Color('#ffd27a') });
  const inst = new THREE.InstancedMesh(geo, m, n), d = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const L = (.55 + r() * .35) * height / .62, a = r() * 6.28, rd = Math.sqrt(r()) * spread, lean = .12 + r() * .42;
    d.position.set(Math.cos(a) * rd, L * .42, Math.sin(a) * rd);
    d.rotation.set((r() - .5) * lean * 2, r() * 6.28, (r() - .5) * lean * 2); d.rotateX(0); d.scale.set(.052 + r() * .018, L, .05 + r() * .018);
    // keep tilt mostly radial for a tumbling heap
    d.updateMatrix(); inst.setMatrixAt(i, d.matrix);
    const t = r(); col.setRGB(.86 - t * .18, .58 - t * .17, .17 - t * .08); inst.setColorAt(i, col);
  }
  inst.castShadow = inst.receiveShadow = true; return inst;
}
export function saltFlecks(n = 300, R = .22, h = .3, seed = 12) {
  const r = rng(seed), g = new THREE.SphereGeometry(.005, 5, 4), m = new THREE.MeshStandardMaterial({ color: '#fff7ea', roughness: .3, emissive: '#554433', emissiveIntensity: .2 });
  const inst = new THREE.InstancedMesh(g, m, n), d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { const a = r() * 6.28, rd = Math.sqrt(r()) * R; d.position.set(Math.cos(a) * rd, r() * h, Math.sin(a) * rd); d.scale.setScalar(.6 + r() * 1.4); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }
  return inst;
}

/* ───────────────────────── PLATE / BOWLS / HERBS ───────────────────────── */
export function plate(R = 1.38) {
  const prof = [[0, .0], [R * .58, .0], [R * .66, .018], [R * .72, .05], [R * .9, .085], [R * .985, .12], [R, .14], [R * .985, .152], [R * .94, .146], [R * .78, .082], [R * .64, .052], [R * .5, .048], [0, .048]];
  const sp = new THREE.SplineCurve(prof.map(p => new THREE.Vector2(...p))).getPoints(90).map(p => [Math.max(p.x, 0), p.y]);
  const g = lathe(sp, 192);
  const m = new THREE.MeshPhysicalMaterial({ color: '#cfc9c0', map: shared().speckle, roughness: .38, clearcoat: .65, clearcoatRoughness: .18, metalness: .02, bumpMap: shared().speckle, bumpScale: .4 });
  const plate = new THREE.Mesh(g, m);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R * .985, .0075, 10, 220), new THREE.MeshPhysicalMaterial({ color: '#d3a24c', metalness: 1, roughness: .22 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = .146;
  const grp = new THREE.Group(); grp.add(plate, rim); return shadow(grp);
}
export function ramekin(sauce = '#d85a1f', swirl = true) {
  const pts = [[0, 0], [.14, 0], [.2, .015], [.23, .1], [.235, .16], [.225, .165], [.205, .16], [.2, .09], [.18, .04], [0, .035]];
  const g = lathe(new THREE.SplineCurve(pts.map(p => new THREE.Vector2(...p))).getPoints(50).map(p => [Math.max(p.x, 0), p.y]), 96);
  const cm = new THREE.MeshPhysicalMaterial({ color: '#2a2724', roughness: .3, clearcoat: .8, side: THREE.DoubleSide });
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, cm));
  const sg = new THREE.CircleGeometry(.205, 60); sg.rotateX(-Math.PI / 2);
  const sm = sauceMat(); sm.color = new THREE.Color(sauce);
  const s = new THREE.Mesh(sg, sm); s.position.y = .13; displace(sg, (x, y, z) => Math.sin(Math.hypot(x, z) * 38) * .004 * (1 - Math.hypot(x, z) / .2)); grp.add(s);
  return shadow(grp);
}
export function pinchBowl() {
  const g = lathe(new THREE.SplineCurve([[0, 0], [.1, 0], [.17, .02], [.2, .07], [.2, .075], [.18, .07], [.14, .035], [0, .03]].map(p => new THREE.Vector2(...p))).getPoints(40).map(p => [Math.max(p.x, 0), p.y]), 80);
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: '#7a6a58', roughness: .55, clearcoat: .3, side: THREE.DoubleSide })));
  // smoked paprika mound + chilli flakes + peppercorns
  const mound = new THREE.SphereGeometry(.15, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2); displace(mound, (x, y, z) => fbm(x * 40, y * 40, z * 40, 3) * .012);
  const mm = new THREE.Mesh(mound, new THREE.MeshStandardMaterial({ color: '#a8321a', roughness: .85, bumpMap: shared().micro, bumpScale: 3 })); mm.scale.set(1, .5, 1); mm.position.y = .042; grp.add(mm);
  const r = rng(31), fl = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .3, 1), new THREE.MeshStandardMaterial({ color: '#c32a12', roughness: .6 }), 60), d = new THREE.Object3D();
  for (let i = 0; i < 60; i++) { const a = r() * 6.28, rd = Math.sqrt(r()) * .13; d.position.set(Math.cos(a) * rd, .08 - rd * .2 + r() * .01, Math.sin(a) * rd); d.rotation.set(r() * 3, r() * 6, r() * 3); d.scale.setScalar(.012 + r() * .01); d.updateMatrix(); fl.setMatrixAt(i, d.matrix); }
  grp.add(fl); return shadow(grp);
}
function leafShape() { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(.05, .03, .09, .09, .06, .15); s.bezierCurveTo(.04, .19, .01, .18, 0, .2); s.bezierCurveTo(-.01, .18, -.04, .19, -.06, .15); s.bezierCurveTo(-.09, .09, -.05, .03, 0, 0); return s; }
export function herbSprig(seed = 3) {
  const r = rng(seed), grp = new THREE.Group(), geo = new THREE.ShapeGeometry(leafShape(), 8);
  const mat = new THREE.MeshPhysicalMaterial({ color: '#2f7a1a', roughness: .5, side: THREE.DoubleSide, emissive: new THREE.Color('#123a06'), emissiveIntensity: .4, sheen: .4, sheenColor: new THREE.Color('#9be06a'), clearcoat: .3 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.004, .006, .32, 6), new THREE.MeshStandardMaterial({ color: '#4d8a2a', roughness: .6 })); stem.rotation.z = Math.PI / 2; stem.position.x = .16; grp.add(stem);
  for (let i = 0; i < 16; i++) {
    const L = new THREE.Mesh(geo, mat); const t = i / 16; L.position.set(.04 + t * .3, .005 + r() * .02, (r() - .5) * .02);
    const sc = .55 + r() * .6; L.scale.setScalar(sc); L.rotation.set(-Math.PI / 2 + (r() - .5) * .6, (r() - .5) * 1.4 + (i % 2 ? 1 : -1) * 1.1, r() * 6.28 * 0); L.rotation.order = 'YXZ';
    L.rotation.y = (i % 2 ? 1 : -1) * (.8 + r() * .5); L.rotation.x = -Math.PI / 2 + (r() - .5) * .5; grp.add(L);
  }
  return shadow(grp);
}
export function skewer() {
  const g = new THREE.CylinderGeometry(.007, .004, 1.1, 8); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#b98a54', roughness: .6 }));
  return shadow(m);
}
