import * as THREE from 'three';
// An Ingredient wraps a mesh/group that physically lives on the dish and can be lifted out,
// spun in 3D and returned to its exact home pose. All poses are pure functions of `k` (0..1).
export class Ingredient {
  constructor(id, object, { lift = [0, 1, 0], spin = [0, 1, 0], spinTurns = 1, tilt = 0 } = {}) {
    this.id = id; this.object = object;
    this.home = { p: object.position.clone(), q: object.quaternion.clone(), s: object.scale.clone() };
    this.lift = new THREE.Vector3(...lift); this.spin = new THREE.Vector3(...spin).normalize();
    this.spinTurns = spinTurns; this.tilt = tilt;
    this._q = new THREE.Quaternion(); this._q2 = new THREE.Quaternion();
  }
  /** k: 0 = home, 1 = fully floated. phase: seconds-into-float for continuous rotation */
  apply(k, phase = 0) {
    const o = this.object;
    o.position.copy(this.home.p).addScaledVector(this.lift, k);
    this._q.setFromAxisAngle(this.spin, k * this.spinTurns * Math.PI * 2 * 0.0 + phase * 0.9 * k);
    this._q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.tilt * k);
    o.quaternion.copy(this.home.q).premultiply(this._q2).premultiply(this._q);
    // spin about the object's own world-up for a "turntable" feel
    o.scale.copy(this.home.s).multiplyScalar(1 + .06 * k);
  }
}
