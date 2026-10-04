import * as THREE from 'three';
import { pchip } from '../lib/ease.js';

/**
 * Orbit-style cinematic camera. Every channel is a monotone-cubic (PCHIP) track over time, so motion is C1 smooth,
 * never overshoots, and eases in/out at the first/last key. Spherical coordinates make orbits perfectly circular.
 * Tracks (keys = [seconds, value]): az, el (deg) · r (units) · tx,ty,tz (look-at) · fov (deg vertical)
 *   fx,fy,fz (focus point) · ap (aperture, px of bokeh radius) · roll (deg)
 */
export class CameraRig {
  constructor(camera, tracks) {
    this.camera = camera; this.fn = {}; for (const k in tracks) this.fn[k] = pchip(tracks[k]);
  }
  update(t) {
    const f = this.fn, c = this.camera, az = THREE.MathUtils.degToRad(f.az(t)), el = THREE.MathUtils.degToRad(f.el(t)), r = f.r(t);
    const tx = f.tx(t), ty = f.ty(t), tz = f.tz(t);
    // very small deterministic "operator breathing" — slow float, not shake (≈ 0.4 cm at hero distance)
    const fl = .0035 * r, bx = Math.sin(t * .9) * fl, by = Math.sin(t * 1.3 + 1.2) * fl * .7, bz = Math.sin(t * .7 + 2) * fl;
    c.position.set(tx + Math.sin(az) * Math.cos(el) * r + bx, ty + Math.sin(el) * r + by, tz + Math.cos(az) * Math.cos(el) * r + bz);
    c.up.set(0, 1, 0); c.lookAt(tx, ty, tz); if (f.roll) c.rotateZ(THREE.MathUtils.degToRad(f.roll(t)));
    c.fov = f.fov(t); c.updateProjectionMatrix(); c.updateMatrixWorld();
    const fp = new THREE.Vector3(f.fx(t), f.fy(t), f.fz(t));
    const dz = fp.clone().applyMatrix4(c.matrixWorldInverse).z; // view-space distance of the focus plane
    return { focus: Math.max(.2, -dz), aperture: f.ap(t), az: THREE.MathUtils.radToDeg(az) };
  }
}
