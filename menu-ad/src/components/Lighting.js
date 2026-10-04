import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { woodTextures, glowSprite } from '../lib/textures.js';
import { rng } from '../lib/noise.js';

/** Studio-grade lighting rig: soft-box IBL + warm key + back rim + kicker + volumetric shaft + dark restaurant table & bokeh. */
export class Lighting {
  constructor(renderer, scene) {
    this.scene = scene;
    // ── image based lighting from procedural softboxes ──
    const env = new THREE.Scene(); env.background = new THREE.Color(0x030201);
    const box = (w, h, x, y, z, i, col, rx = 0, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.lookAt(0, 0, 0); env.add(m); };
    box(14, 9, 0, 12, 4, 6.0, '#fff1de');         // overhead softbox
    box(3, 12, -12, 4, 2, 4.2, '#ffe0b8');         // left strip
    box(3, 12, 12, 5, -3, 5.4, '#ffc78a');         // right/back warm strip
    box(8, 3, 0, 3, -13, 7.0, '#ffb978');          // back kicker
    box(10, 5, 0, 2, 14, 1.4, '#9fb7d8');          // cool low fill (front)
    const pm = new THREE.PMREMGenerator(renderer); this.envTex = pm.fromScene(env, .035).texture; scene.environment = this.envTex; scene.environmentIntensity = .0; pm.dispose();

    // ── table ──
    const w = woodTextures(1024);
    this.table = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshPhysicalMaterial({ ...w, color: '#ffffff', roughness: 1, bumpScale: 2.2, clearcoat: .35, clearcoatRoughness: .45 }));
    this.table.rotation.x = -Math.PI / 2; this.table.receiveShadow = true; scene.add(this.table);

    // ── lights ──
    this.key = new THREE.SpotLight('#ffcf94', 0, 0, .5, .85, 1.6); this.key.position.set(-3.2, 7.5, 4.2); this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048); this.key.shadow.bias = -.0006; this.key.shadow.normalBias = .05; this.key.shadow.radius = 5; this.key.shadow.camera.near = 2; this.key.shadow.camera.far = 24; this.key.target.position.set(0, 0, 0);
    scene.add(this.key, this.key.target);
    this.rim = new THREE.SpotLight('#ff9a4a', 0, 0, .6, .9, 1.4); this.rim.position.set(3.4, 4.6, -6); this.rim.castShadow = false; scene.add(this.rim, this.rim.target);
    this.kick = new THREE.PointLight('#ffd9a8', 0, 14, 1.8); this.kick.position.set(2.4, 1.6, 3.2); scene.add(this.kick);
    this.fill = new THREE.DirectionalLight('#b8c6e8', 0); this.fill.position.set(5, 3, 7); scene.add(this.fill);

    // ── light shaft (fake volumetric) ──
    this.shaftMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uI: { value: 0 }, uT: { value: 0 }, uCol: { value: new THREE.Color('#ffb870') } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying float vH; varying vec3 vP; varying float vD; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vD=-mv.z; vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); vH=position.y; vP=position; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform float uI,uT; uniform vec3 uCol; varying vec3 vN,vV,vP; varying float vH,vD;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
        void main(){ float fr=pow(abs(dot(normalize(vN),normalize(vV))),1.6); float along=smoothstep(0.,.25,vH)*(1.-smoothstep(.55,1.,vH)); float a=atan(vP.z,vP.x);
          float s=.55+.45*n(vec2(a*3.+uT*.12,vH*3.-uT*.2)); gl_FragColor=vec4(uCol*fr*along*s*uI*smoothstep(1.2,4.5,vD),1.); }`
    });
    this.shaft = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 48, 1, true), this.shaftMat); this.shaft.frustumCulled = false; this.shaft.renderOrder = 10; scene.add(this.shaft);

    // ── restaurant bokeh ring ──
    const r = rng(2025), g = new THREE.Group(), sg = new THREE.SphereGeometry(1, 14, 10);
    this.orbs = [];
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, d = 14 + r() * 22, y = .6 + Math.pow(r(), 1.6) * 9;
      const warm = r(), c = new THREE.Color().setHSL(.065 + r() * .035, .75 + r() * .2, .5 + r() * .15); if (warm < .08) c.setHSL(.0, .8, .45); if (warm > .93) c.setHSL(.12, .5, .8);
      const I = 2.5 + r() * 6;
      const m = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(I), fog: false, toneMapped: false }));
      m.position.set(Math.cos(a) * d, y, Math.sin(a) * d); m.scale.setScalar(.12 + r() * .22); m.userData = { I, ph: r() * 6.28, base: c.clone() }; g.add(m); this.orbs.push(m);
    }
    scene.add(g); this.bokeh = g;
    scene.fog = new THREE.FogExp2(0x070302, .012);
  }
  /** s: { key, rim, kick, fill, env, shaft, keyPos:[x,y,z], keyTarget:[x,y,z], bokeh } */
  apply(s, t = 0) {
    this.scene.environmentIntensity = s.env; this.key.intensity = s.key; this.rim.intensity = s.rim; this.kick.intensity = s.kick; this.fill.intensity = s.fill;
    if (s.keyPos) this.key.position.set(...s.keyPos); if (s.keyTarget) { this.key.target.position.set(...s.keyTarget); this.rim.target.position.set(s.keyTarget[0], s.keyTarget[1], s.keyTarget[2]); }
    if (s.rimPos) this.rim.position.set(...s.rimPos);
    if (s.keyAngle) this.key.angle = s.keyAngle; if (s.keyPenumbra !== undefined) this.key.penumbra = s.keyPenumbra;
    this.key.target.updateMatrixWorld(); this.rim.target.updateMatrixWorld();
    // orient the shaft from key → target
    const a = this.key.position, b = this.key.target.position, len = a.distanceTo(b), dir = new THREE.Vector3().subVectors(b, a).normalize();
    this.shaft.position.copy(a).addScaledVector(dir, len / 2); this.shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    const rad = Math.tan(this.key.angle) * len; this.shaft.scale.set(rad, len, rad);
    this.shaftMat.uniforms.uI.value = s.shaft; this.shaftMat.uniforms.uT.value = t;
    this.orbs.forEach(o => { const k = 1 + .18 * Math.sin(t * 1.3 + o.userData.ph); o.material.color.copy(o.userData.base).multiplyScalar(o.userData.I * k * s.bokeh); });
  }
}
