import * as THREE from 'three';
import { softSprite, glowSprite } from '../lib/textures.js';
import { rng, fbm } from '../lib/noise.js';

/**
 * Steam + floating crumbs/dust. Everything is a closed-form function of time, so any frame renders identically
 * (no stateful simulation). Steam = camera-facing soft sprites rising with curl-noise drift.
 */
export class Particles {
  constructor(scene, camera) {
    this.camera = camera; this.group = new THREE.Group(); scene.add(this.group);
    const tex = [softSprite(256, 5), softSprite(256, 17), softSprite(256, 29)];
    this.steam = []; const r = rng(99);
    for (let i = 0; i < 54; i++) {
      const m = new THREE.SpriteMaterial({ map: tex[i % 3], color: '#ffe9d0', transparent: true, depthWrite: false, opacity: 0, blending: THREE.NormalBlending, fog: false });
      const s = new THREE.Sprite(m); s.userData = { off: r(), rate: .22 + r() * .14, a: r() * 6.28, rr: Math.sqrt(r()) * .12, rot: r() * 6.28, anchor: i % 3, size: .22 + r() * .18 }; s.renderOrder = 6; this.group.add(s); this.steam.push(s);
    }
    this.anchors = [[-.1, .95, .0], [.62, .55, -.55], [-.2, 1.0, .1]]; this.origin = new THREE.Vector3(); this.scale = 1;
    // dust / crumbs (rendered as glowing points → become cinematic bokeh with DOF)
    const N = 110, pos = new Float32Array(N * 3), seed = new Float32Array(N * 4); const rd = rng(5);
    for (let i = 0; i < N; i++) { seed.set([rd(), rd(), rd(), rd()], i * 4); }
    this.dustGeo = new THREE.BufferGeometry(); this.dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); this.dustSeed = seed; this.N = N;
    this.dustMat = new THREE.PointsMaterial({ map: glowSprite(64), size: .06, sizeAttenuation: true, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffd7a0', fog: false });
    this.dust = new THREE.Points(this.dustGeo, this.dustMat); this.dust.frustumCulled = false; this.group.add(this.dust);
  }
  /** s: { steam 0..1 intensity, dust 0..1, center:Vector3, origin: Vector3, spread, scale } */
  update(t, s) {
    this.group.visible = true; const o = s.origin || this.origin, sc = s.scale ?? 1;
    this.steam.forEach(sp => {
      const u = sp.userData, ph = ((t * u.rate + u.off) % 1 + 1) % 1, an = this.anchors[u.anchor];
      const lift = ph * (1.1 + u.anchor * .1) * sc;
      const nx = fbm(u.a * 3, ph * 1.6, t * .12, 2) * .3, nz = fbm(u.a * 3 + 9, ph * 1.6, t * .12, 2) * .3;
      sp.position.set(o.x + (an[0] + u.rr * Math.cos(u.a) + nx * ph) * sc, o.y + (an[1]) * sc + lift, o.z + (an[2] + u.rr * Math.sin(u.a) + nz * ph) * sc);
      const fade = Math.sin(Math.PI * ph) ** 1.5, anchorGain = u.anchor === 0 ? 1 : .7;
      sp.material.opacity = fade * .075 * s.steam * anchorGain; sp.visible = sp.material.opacity > .002; sp.material.rotation = u.rot + ph * 1.4;
      const sz = (u.size + ph * .55) * sc; sp.scale.set(sz, sz, 1);
    });
    this.dustMat.opacity = .85 * s.dust; this.dustMat.size = .05;
    const p = this.dustGeo.attributes.position, c = s.center || o, R = s.dustRadius ?? 4;
    for (let i = 0; i < this.N; i++) {
      const a = this.dustSeed[i * 4], b = this.dustSeed[i * 4 + 1], d = this.dustSeed[i * 4 + 2], e = this.dustSeed[i * 4 + 3];
      const ph = ((t * (.03 + e * .04) + a) % 1);
      p.setXYZ(i, c.x + (b - .5) * 2 * R + Math.sin(t * .4 + d * 9) * .25, c.y + .1 + ph * 3.6, c.z + (d - .5) * 2 * R + Math.cos(t * .33 + b * 9) * .25);
    }
    p.needsUpdate = true; this.dust.visible = s.dust > .01;
  }
}
