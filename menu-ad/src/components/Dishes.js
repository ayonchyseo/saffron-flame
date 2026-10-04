import * as THREE from 'three';
import * as P from './FoodParts.js';
import { fbm, noise3, rng, smoothstep, clamp } from '../lib/noise.js';
import { canvasTex } from '../lib/textures.js';

function lathePts(arr, seg = 96) { return new THREE.LatheGeometry(new THREE.SplineCurve(arr.map(p => new THREE.Vector2(...p))).getPoints(arr.length * 8).map(p => new THREE.Vector2(Math.max(p.x, 0), p.y)), seg); }
const sh = o => { o.traverse(m => { if (m.isMesh || m.isInstancedMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

/** Molten chocolate lava cake on a small plate with raspberries, dust and a melted pool */
export function lavaCake() {
  const g = new THREE.Group();
  const plate = P.plate(.95); g.add(plate);
  const cake = new THREE.Group(); cake.position.y = .048;
  const prof = [[0, 0], [.33, 0], [.355, .02], [.36, .2], [.345, .25], [.3, .27], [0, .275]];
  const cg = lathePts(prof, 96);
  const p = cg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = fbm(x * 10, y * 10, z * 10, 3) * .02; p.setXYZ(i, x * (1 + k), y, z * (1 + k)); }
  cg.computeVertexNormals();
  const col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = fbm(x * 14, y * 14, z * 14, 3) * .5 + .5; c.setRGB(.11 + n * .05, .045 + n * .02, .02 + n * .01); if (y > .26) c.setRGB(.15, .06, .028); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  cg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const cm = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .62, bumpMap: P.shared().micro, bumpScale: 2.5, sheen: .5, sheenColor: new THREE.Color('#6b3418'), clearcoat: .15 });
  cake.add(new THREE.Mesh(cg, cm));
  // molten pool: glossy chocolate flowing out of the crater and over one side
  const poolG = new THREE.CircleGeometry(.55, 96); poolG.rotateX(-Math.PI / 2);
  const pp = poolG.attributes.position; for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), z = pp.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z); const lobe = 1 + .35 * Math.max(0, Math.cos(a - .9)) ** 2; const f = lobe * (1 + noise3(Math.cos(a) * 2, Math.sin(a) * 2, 3) * .12); pp.setXYZ(i, x * f * .62, .004 + (1 - r / .55) * .014, z * f * .62); }
  poolG.computeVertexNormals();
  const choc = new THREE.MeshPhysicalMaterial({ color: '#2a0f06', roughness: .1, clearcoat: 1, clearcoatRoughness: .04, sheen: .3, sheenColor: new THREE.Color('#7a3a1a'), ior: 1.5 });
  const pool = new THREE.Mesh(poolG, choc); pool.position.y = 0; cake.add(pool);
  // crater of lava on the top + runny stream down the front
  const lava = new THREE.Mesh(new THREE.SphereGeometry(.16, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), choc); lava.scale.set(1, .35, 1); lava.position.set(.03, .268, 0); cake.add(lava);
  const stream = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.1, .272, .02), new THREE.Vector3(.25, .27, .08), new THREE.Vector3(.35, .15, .14), new THREE.Vector3(.4, .04, .2), new THREE.Vector3(.5, .01, .26)]), 60, .028, 12), choc); cake.add(stream);
  // icing-sugar dust (instanced specks) + raspberries + mint
  const r = rng(41), dust = new THREE.InstancedMesh(new THREE.SphereGeometry(.004, 4, 3), new THREE.MeshStandardMaterial({ color: '#fff6e6', roughness: .9 }), 380), d = new THREE.Object3D();
  for (let i = 0; i < 380; i++) { const a = r() * 6.28, rd = Math.sqrt(r()) * .3; d.position.set(Math.cos(a) * rd, .272 - rd * .1 + r() * .008, Math.sin(a) * rd); d.scale.setScalar(.6 + r() * 1.4); d.updateMatrix(); dust.setMatrixAt(i, d.matrix); }
  cake.add(dust);
  for (let i = 0; i < 3; i++) { const rb = raspberry(); const a = i * 2.1 + .8; rb.position.set(Math.cos(a) * (.18 + i * .05) + .1, .31 - i * .01, Math.sin(a) * .15); rb.scale.setScalar(.85 - i * .08); cake.add(rb); }
  const mint = P.herbSprig(7); mint.scale.setScalar(.7); mint.position.set(-.1, .30, -.06); mint.rotation.set(.3, 1.2, .2); cake.add(mint);
  g.add(cake); return sh(g);
}
function raspberry() {
  const grp = new THREE.Group(), r = rng(8), m = new THREE.MeshPhysicalMaterial({ color: '#b0123a', roughness: .3, clearcoat: .8, emissive: '#3a0010', emissiveIntensity: .35, sheen: .5, sheenColor: new THREE.Color('#ff7a98') });
  const geo = new THREE.SphereGeometry(.026, 10, 8);
  for (let i = 0; i < 52; i++) { const t = Math.acos(1 - r() * 1.05), a = r() * 6.28; const s = new THREE.Mesh(geo, m); s.position.set(Math.sin(t) * Math.cos(a) * .07, Math.cos(t) * .09 - .0, Math.sin(t) * Math.sin(a) * .07); grp.add(s); }
  return grp;
}

/** Truffle fries in a gilded metal cone with parmesan shavings and herbs */
export function trufflFries() {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(lathePts([[0, 0], [.17, 0], [.22, .02], [.38, .55], [.4, .6], [.385, .6], [.3, .3], [.18, .03], [0, .02]], 80), new THREE.MeshPhysicalMaterial({ color: '#d1ab63', metalness: 1, roughness: .28, side: THREE.DoubleSide })); g.add(cone);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.34, .36, .03, 60), new THREE.MeshPhysicalMaterial({ color: '#1f1c1a', roughness: .3, clearcoat: .8 })); base.position.y = -.0; g.add(base);
  const f = P.friesCluster(120, 21, .3, .85); f.position.y = .22; g.add(f);
  const salt = P.saltFlecks(400, .3, 1.0, 5); salt.position.y = .35; g.add(salt);
  // parmesan shavings: thin curled planes
  const r = rng(3), sm = new THREE.MeshPhysicalMaterial({ color: '#f1dca0', roughness: .5, side: THREE.DoubleSide, sheen: .5, sheenColor: new THREE.Color('#fff2c0') });
  for (let i = 0; i < 14; i++) { const pg = new THREE.PlaneGeometry(.12, .07, 8, 4); const q = pg.attributes.position; for (let k = 0; k < q.count; k++) { const x = q.getX(k); q.setZ(k, x * x * 5 * (r() > .5 ? 1 : -1)); } pg.computeVertexNormals(); const m = new THREE.Mesh(pg, sm); const a = r() * 6.28, rd = Math.sqrt(r()) * .26; m.position.set(Math.cos(a) * rd, .72 + r() * .2, Math.sin(a) * rd); m.rotation.set(r() * 3, r() * 6, r() * 3); g.add(m); }
  const herb = P.herbSprig(11); herb.scale.setScalar(.8); herb.position.set(.05, .86, .02); herb.rotation.set(.4, 2.2, .1); g.add(herb);
  return sh(g);
}

/** Salted caramel milkshake: glass, shake body with caramel drizzle, whipped cream, cherry, straw */
export function shake() {
  const g = new THREE.Group();
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .03, metalness: 0, transparent: true, opacity: .16, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 2.5, side: THREE.DoubleSide, depthWrite: false, ior: 1.5 });
  const glass = new THREE.Mesh(lathePts([[0, 0], [.2, 0], [.24, .02], [.27, .5], [.285, 1.0], [.275, 1.0], [.26, .5], [.22, .06], [0, .06]], 80), glassMat); glass.renderOrder = 4; g.add(glass);
  const body = new THREE.Mesh(lathePts([[0, .07], [.215, .07], [.255, .5], [.268, .92], [0, .93]], 80), new THREE.MeshPhysicalMaterial({ color: '#d9a362', roughness: .35, clearcoat: .6, sheen: .6, sheenColor: new THREE.Color('#ffe2b0') })); g.add(body);
  // caramel streaks running down inside the glass
  const r = rng(6), cm = new THREE.MeshPhysicalMaterial({ color: '#a8561a', roughness: .1, clearcoat: 1, emissive: '#3a1400', emissiveIntensity: .3 });
  for (let i = 0; i < 9; i++) { const a = r() * 6.28, L = .25 + r() * .5; const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(Math.cos(a) * .266, .92, Math.sin(a) * .266), new THREE.Vector3(Math.cos(a + .03) * .26, .92 - L * .5, Math.sin(a + .03) * .26), new THREE.Vector3(Math.cos(a - .02) * .255, .92 - L, Math.sin(a - .02) * .255)]), 24, .012 + r() * .008, 8), cm); g.add(t); }
  // whipped cream — helical lathe
  const cream = new THREE.Group(); const cmat = new THREE.MeshPhysicalMaterial({ color: '#fff4e2', roughness: .5, sheen: 1, sheenColor: new THREE.Color('#fff'), clearcoat: .2 });
  for (let i = 0; i < 4; i++) { const tr = new THREE.Mesh(new THREE.TorusGeometry(.2 - i * .04, .075 - i * .008, 18, 48), cmat); tr.rotation.x = Math.PI / 2; tr.position.y = .94 + i * .075; cream.add(tr); }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.05, .13, 20), cmat); tip.position.y = 1.27; cream.add(tip); g.add(cream);
  const drz = new THREE.Mesh(new THREE.TorusGeometry(.14, .012, 10, 60), cm); drz.rotation.x = Math.PI / 2; drz.position.set(0, 1.11, 0); drz.scale.set(1.1, 1, 1); g.add(drz);
  // cherry + stem
  const cherry = new THREE.Mesh(new THREE.SphereGeometry(.06, 24, 18), new THREE.MeshPhysicalMaterial({ color: '#7a0a1c', roughness: .15, clearcoat: 1, emissive: '#2a0008', emissiveIntensity: .4 })); cherry.position.set(.03, 1.34, 0); g.add(cherry);
  // paper straw (striped)
  const sc = document.createElement('canvas'); sc.width = 64; sc.height = 512; const x = sc.getContext('2d'); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#f4efe6' : '#b8272d'; x.fillRect(0, i * 32, 64, 32); }
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.2, 14), new THREE.MeshStandardMaterial({ map: canvasTex(sc), roughness: .6 })); straw.position.set(.09, 1.05, -.03); straw.rotation.z = -.2; g.add(straw);
  const coaster = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .03, 64), new THREE.MeshPhysicalMaterial({ color: '#1d1a18', roughness: .35, clearcoat: .7 })); coaster.position.y = -.015; g.add(coaster);
  g.position.y = .03; const out = new THREE.Group(); out.add(g); return sh(out);
}
