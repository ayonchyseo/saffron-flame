import * as THREE from 'three';
import * as P from './FoodParts.js';
import { Ingredient } from './Ingredient.js';
import { clamp, smoothstep } from '../lib/noise.js';
import { easeOutBack, easeInOutCubic, easeOutCubic } from '../lib/ease.js';

const PLATE_Y = .048;
/**
 * FoodHero — the signature dish on its plate. Everything on the plate is a separate physical object so it can
 * be lifted (Ingredient), rotated and returned to its exact home pose.
 * Poses are pure functions of (build, explode, time) so any frame can be rendered in isolation.
 */
export class FoodHero {
  constructor() {
    this.root = new THREE.Group(); this.root.name = 'FoodHero';
    this.plate = P.plate(); this.root.add(this.plate);
    this.stack = new THREE.Group(); this.stack.position.set(-.12, PLATE_Y, .04); this.root.add(this.stack);

    // ── burger stack (local y from bun base) ──
    this.parts = {};
    const add = (id, obj, y, extra = {}) => { obj.position.y = y; this.stack.add(obj); this.parts[id] = obj; obj.userData.homeY = y; return obj; };
    add('bunBottom', P.bunBottom(), 0);
    const lett = add('lettuce', P.lettuce(.66, 2), .205); lett.rotation.y = .5;
    const pat1 = add('pat1', P.patty(.56, .115, 5), .30); pat1.rotation.y = .3;
    const ch1 = add('cheese1', P.cheese(.98, .53, 2), .36 + .0); ch1.rotation.y = Math.PI / 4 + .12;
    const pat2 = add('pat2', P.patty(.55, .115, 9), .475); pat2.rotation.y = 1.9;
    const ch2 = add('cheese2', P.cheese(.94, .53, 6), .54); ch2.rotation.y = Math.PI / 4 - .25;
    const tom = add('tomato', P.tomatoSlice(.45), .595); tom.rotation.y = .6;
    const tom2 = P.tomatoSlice(.40); tom2.position.set(.02, .045, -.03); tom2.rotation.y = 2.4; tom.add(tom2);
    const onion = new THREE.Group(); [.30, .21, .12].forEach((r, i) => { const o = P.onionRing(r, .028); o.position.y = i * .002; onion.add(o); });
    onion.position.set(-.02, .085, .02); tom.add(onion);
    for (let i = 0; i < 3; i++) { const pk = P.pickle(.11); const a = i * 2.1 + .4; pk.position.set(Math.cos(a) * .22, .085 + .015 + (i % 2) * .005, Math.sin(a) * .22); pk.rotation.set((Math.random() * 0), a, .08); tom.add(pk); }
    add('bunTop', P.bunTop(), .735); this.parts.bunTop.rotation.y = .9;
    // sauce: drizzle + drips on top of the cheese, and a drip down the patty edge
    this.drizzle = P.sauceDrizzle(.42, 6); this.drizzle.position.y = .045; tom.add(this.drizzle);
    this.drips = new THREE.Group(); this.stack.add(this.drips);
    [[0.52, .36, .4, .22, .03], [-.44, .27, 2.6, .16, .026], [.15, .21, 4.3, .12, .022]].forEach(([r, y, a, L, w]) => {
      const d = P.sauceDrip(L, w); d.position.set(Math.cos(a) * r, y + .26, Math.sin(a) * r); this.drips.add(d);
    });

    // ── plate companions ──
    const fr = new THREE.Group(); fr.position.set(.62, PLATE_Y + .002, -.55); fr.rotation.y = .4;
    const fCup = this._friesCup(); fr.add(fCup); this.root.add(fr); this.fries = fr;
    const ram = P.ramekin(); ram.position.set(.78, PLATE_Y, .62); ram.rotation.y = .7; this.root.add(ram); this.ramekin = ram;
    const pinch = P.pinchBowl(); pinch.position.set(-.95, PLATE_Y, .45); this.root.add(pinch); this.pinch = pinch;
    const herb = P.herbSprig(4); herb.position.set(-.88, PLATE_Y + .005, -.55); herb.rotation.y = 2.3; this.root.add(herb); this.herb = herb;
    // scattered crumbs / flakes on the plate for imperfection
    this.root.add(this._scatter());

    // ── Ingredients (lift targets, world-up lifts) ──
    this.ing = {
      top:    new Ingredient('top', this.parts.bunTop, { lift: [0, 2.2, 0] }),
      veg:    new Ingredient('veg', this.parts.lettuce, { lift: [-.35, 1.5, .25], tilt: .3 }),
      tomato: new Ingredient('tomato', this.parts.tomato, { lift: [.3, 1.2, .5], tilt: -.25 }),
      protein:new Ingredient('protein-a', this.parts.pat1, { lift: [0, .55, 0], tilt: .12 }),
      protein2:new Ingredient('protein-b', this.parts.pat2, { lift: [0, .95, 0], tilt: -.1 }),
      cheese1:new Ingredient('cheese1', this.parts.cheese1, { lift: [0, .75, 0] }),
      cheese2:new Ingredient('cheese2', this.parts.cheese2, { lift: [0, 1.1, 0] }),
      sauce:  new Ingredient('sauce', ram, { lift: [.35, 1.35, 1.1], tilt: .2 }),
      herbs:  new Ingredient('herbs', herb, { lift: [-.35, 1.15, -.65], tilt: .3 }),
      spice:  new Ingredient('spice', pinch, { lift: [-.45, 1.0, .85], tilt: -.25 }),
    };
    // staggered release (seconds are normalised 0..1 of explode window)
    this.ing.top.delay = .0; this.ing.veg.delay = .12; this.ing.tomato.delay = .2; this.ing.cheese2.delay = .28; this.ing.protein2.delay = .26;
    this.ing.cheese1.delay = .34; this.ing.protein.delay = .38; this.ing.sauce.delay = .1; this.ing.herbs.delay = .3; this.ing.spice.delay = .2;
    this.steamAnchors = [[-.1, .95, .0], [.62, .55, -.55], [-.2, 1.0, .1]];
    this.root.traverse(o => { if (o.isMesh || o.isInstancedMesh) { o.castShadow = true; o.receiveShadow = true; } });
  }
  _friesCup() {
    const g = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.27, .2, .36, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: '#c9a45a', metalness: .9, roughness: .3, side: THREE.DoubleSide }));
    cup.position.y = .18; g.add(cup);
    const f = P.friesCluster(70, 9, .17, .78); f.position.y = .12; g.add(f);
    const s = P.saltFlecks(260, .22, .75, 3); s.position.y = .2; g.add(s);
    return g;
  }
  _scatter() {
    const g = new THREE.Group(), r = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(55);
    const geo = new THREE.SphereGeometry(1, 6, 5), mat = new THREE.MeshStandardMaterial({ color: '#7a2a10', roughness: .7 });
    const inst = new THREE.InstancedMesh(geo, mat, 90), d = new THREE.Object3D();
    for (let i = 0; i < 90; i++) { const a = r() * 6.28, rd = .35 + r() * .85; d.position.set(Math.cos(a) * rd, PLATE_Y + .004, Math.sin(a) * rd); d.scale.set(.006 + r() * .008, .003, .006 + r() * .008); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }
    g.add(inst); return g;
  }

  /** build: 0..1 layer-by-layer extrusion · explode: 0..1 floated · time: seconds for continuous spin */
  update({ build = 1, explode = 0, time = 0 } = {}) {
    // ---------- build (extrusion from page) ----------
    const order = ['bunBottom', 'lettuce', 'pat1', 'cheese1', 'pat2', 'cheese2', 'tomato', 'bunTop'];
    this.plate.visible = build > .02;
    const pk = easeOutCubic(clamp(build * 1.9)); this.plate.scale.set(.6 + .4 * pk, 1, .6 + .4 * pk); this.plate.position.y = (1 - pk) * -.04;
    order.forEach((id, i) => {
      const o = this.parts[id], k = clamp((build - .15 - i * .075) / .4), e = easeOutBack(k, 1.3);
      o.visible = k > 0.001;
      o.userData.build = e; o.scale.y = Math.max(.001, e); o.scale.x = o.scale.z = .85 + .15 * e;
      if (k < 1) o.position.y = o.userData.homeY * e; else o.position.y = o.userData.homeY;
    });
    const rest = clamp((build - .62) / .3);
    [this.fries, this.ramekin, this.pinch, this.herb].forEach((o, i) => { const k = easeOutBack(clamp((build - .5 - i * .06) / .35), 1.2); o.visible = k > .001; o.scale.setScalar(Math.max(.001, k)); });
    this.drizzle.scale.setScalar(clamp((build - .78) / .2)); this.drips.visible = build > .9; this.drips.scale.setScalar(clamp((build - .85) / .15));
    // ---------- explode ----------
    const e = clamp(explode);
    if (build >= .999) for (const key in this.ing) {
      const I = this.ing[key], d = I.delay || 0;
      const k = e <= 0 ? 0 : easeInOutCubic(clamp((e * 1.35 - d)));
      I.apply(k, time * (1 + d));
    }
    // drips and drizzle follow tomato/top for visual continuity: fade them when floated
    this.drips.visible = this.drips.visible && e < .02;
  }
}
