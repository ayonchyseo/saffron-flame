import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { leatherBump, paperTexture, canvasTex } from '../lib/textures.js';
import { FONT, tracked, drawMonogram } from '../lib/typo.js';
import { clamp } from '../lib/noise.js';
import { spring, easeInOutCubic, smooth } from '../lib/ease.js';

export const BOOK = { W: 3.0, H: 4.2, T: .04, PAGE: .075 };
const { W, H, T, PAGE } = BOOK;
const PIVOT_Y = (.04 + PAGE + T / 2 + .02) / 2;   // hinge height (see derivation in README)
const CLOSED_Y = .04 + PAGE + T / 2;
export const PAGE_TOP_Y = .04 + PAGE;

function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const GOLD = '#e0b565';

function foilTexture(draw, w = 2048, h = 2867) { const c = cv(w, h), x = c.getContext('2d'); x.clearRect(0, 0, w, h); draw(x, w, h); return c; }

/** Deform a Box/Plane-like geometry that lives on x∈[0,W] by a constant curvature κ (cover drag/flex). */
class Bendable {
  constructor(mesh) { this.mesh = mesh; this.orig = mesh.geometry.attributes.position.array.slice(); }
  bend(k) {
    const p = this.mesh.geometry.attributes.position, a = this.orig;
    for (let i = 0; i < p.count; i++) {
      const x = a[i * 3], y = a[i * 3 + 1], z = a[i * 3 + 2];
      if (Math.abs(k) < 1e-5) { p.setXYZ(i, x, y, z); continue; }
      const ph = k * x, cx = Math.sin(ph) / k, cy = (1 - Math.cos(ph)) / k;
      p.setXYZ(i, cx - Math.sin(ph) * y, cy + Math.cos(ph) * y, z);
    }
    p.needsUpdate = true; this.mesh.geometry.computeVertexNormals(); this.mesh.geometry.computeBoundingSphere();
  }
}
function revealMaterial(m, uniform) {
  m.onBeforeCompile = sh => {
    sh.uniforms.uReveal = uniform; sh.fragmentShader = 'uniform float uReveal;\n' + sh.fragmentShader.replace('#include <alphamap_fragment>',
      `#include <alphamap_fragment>\n float rv = 1.0 - smoothstep(uReveal - .32, uReveal, vMapUv.x * .9 + (1.0 - vMapUv.y) * .25);\n diffuseColor.a *= rv;`);
  }; m.customProgramCacheKey = () => 'reveal'; return m;
}

export class MenuCard {
  constructor(sharedTextures = {}) {
    this.root = new THREE.Group(); this.root.name = 'MenuCard';
    this.uTitle = { value: -.5 }; this.uLogo = { value: -.5 };
    const leatherCanvas = leatherBump(1024);
    this._buildTextures(leatherCanvas);

    const leather = new THREE.MeshPhysicalMaterial({ color: CONFIG.COLORS.leather, roughness: .5, clearcoat: .25, clearcoatRoughness: .45, bumpMap: this.coverBump, bumpScale: 1.5, sheen: .35, sheenRoughness: .55, sheenColor: new THREE.Color('#3a1612') });
    this.leather = leather;
    // back cover + page block + spine
    const back = new THREE.Mesh(new THREE.BoxGeometry(W, .04, H, 1, 1, 1), leather); back.position.y = .02; this.root.add(back);
    const pageSide = canvasTex(this._pageEdge()); pageSide.wrapS = pageSide.wrapT = THREE.RepeatWrapping;
    const pm = new THREE.MeshStandardMaterial({ color: '#efe3cc', roughness: .8, map: pageSide });
    const block = new THREE.Mesh(new THREE.BoxGeometry(W - .1, PAGE, H - .1), pm); block.position.set(.0, .04 + PAGE / 2, 0); this.root.add(block); this.block = block;
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(.0775, .0775, H, 40, 1, false, Math.PI, Math.PI), leather); spine.rotation.x = Math.PI / 2; spine.rotation.y = 0; spine.position.set(-W / 2, PIVOT_Y, 0);
    // half-cylinder facing -x: rotate so the arc faces outward
    spine.rotation.set(Math.PI / 2, 0, 0); this.root.add(spine); this.spine = spine;
    // right page (paper w/ printed photo area)
    this.pageTex = canvasTex(this._pageCanvas(), { aniso: 16 });
    const page = new THREE.Mesh(new THREE.PlaneGeometry(W - .1, H - .1), new THREE.MeshStandardMaterial({ map: this.pageTex, roughness: .78, bumpMap: this.paperBump, bumpScale: .25 }));
    page.rotation.x = -Math.PI / 2; page.position.set(0, PAGE_TOP_Y + .0006, 0); page.receiveShadow = true; this.root.add(page); this.page = page;
    // photo (rises from the page)
    this.photoSize = [2.5, 2.9]; this.photoCenter = new THREE.Vector3(0, PAGE_TOP_Y + .002, -.3);
    const pg = new THREE.PlaneGeometry(this.photoSize[0], this.photoSize[1], 50, 58); pg.rotateX(-Math.PI / 2);
    this.photoMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .32, clearcoat: .5, clearcoatRoughness: .25, transparent: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.photo = new THREE.Mesh(pg, this.photoMat); this.photo.position.copy(this.photoCenter); this.photo.visible = false; this.root.add(this.photo);
    this.photoOrig = pg.attributes.position.array.slice();

    // ── front cover (pivot at hinge) ──
    this.pivot = new THREE.Group(); this.pivot.position.set(-W / 2, PIVOT_Y, 0); this.root.add(this.pivot);
    const cg = new THREE.BoxGeometry(W, T, H, 150, 1, 2); cg.translate(W / 2, 0, 0);
    this.cover = new THREE.Mesh(cg, leather); this.cover.position.y = CLOSED_Y - PIVOT_Y; this.pivot.add(this.cover);
    this.benders = [new Bendable(this.cover)];
    const decal = (canvas, outward, mat) => {
      const g = new THREE.PlaneGeometry(W - .06, H - .06, 150, 2); g.rotateX(outward > 0 ? -Math.PI / 2 : Math.PI / 2); g.translate(W / 2, outward * (T / 2 + .0012), 0);
      const mesh = new THREE.Mesh(g, mat); mesh.position.y = this.cover.position.y; this.pivot.add(mesh); this.benders.push(new Bendable(mesh)); return mesh;
    };
    const foil = (map, uni) => revealMaterial(new THREE.MeshPhysicalMaterial({ color: '#f6dc9c', map, transparent: true, metalness: 1, roughness: .24, clearcoat: .3, emissive: new THREE.Color('#a07424'), emissiveMap: map, envMapIntensity: 3, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, depthWrite: false }), uni);
    this.titleMesh = decal(this.titleCanvas, 1, foil(canvasTex(this.titleCanvas, { aniso: 16 }), this.uTitle));
    this.logoMesh = decal(this.logoCanvas, 1, foil(canvasTex(this.logoCanvas, { aniso: 16 }), this.uLogo));
    // inside lining (visible when open)
    const lin = new THREE.MeshPhysicalMaterial({ map: canvasTex(this._liningCanvas(), { aniso: 16 }), roughness: .7, bumpMap: this.paperBump, bumpScale: .2 });
    this.lining = decal(null, -1, lin);
    // closed-state foil hairline frame (embossed)
    this.frameMesh = decal(this.frameCanvas, 1, new THREE.MeshPhysicalMaterial({ color: GOLD, map: canvasTex(this.frameCanvas, { aniso: 16 }), transparent: true, metalness: 1, roughness: .32, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, depthWrite: false }));
    this.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.lining.castShadow = false; this.titleMesh.castShadow = this.logoMesh.castShadow = this.frameMesh.castShadow = false;
    this.setOpen(0);
  }

  _buildTextures(leatherCanvas) {
    // debossed leather bump = pebble grain + pressed text areas darker
    const c = cv(2048, 2867), x = c.getContext('2d');
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) x.drawImage(leatherCanvas, i * 1024, j * 1024, 1024, 1024);
    x.globalCompositeOperation = 'source-over';
    // title canvas (TODAY'S SPECIAL)
    this.titleCanvas = foilTexture((g, w, h) => {
      g.fillStyle = '#fff'; g.textBaseline = 'middle';
      g.font = `500 62px ${FONT.serif}`; g.fillStyle = '#f6e3b0'; tracked(g, 'T O D A Y ’ S', w / 2, h * .30, 0);
      g.font = `600 150px ${FONT.display}`; g.fillStyle = '#fff1cf'; tracked(g, 'SPECIAL', w / 2, h * .365, 26);
      g.fillStyle = '#e8c477'; g.fillRect(w / 2 - 210, h * .43, 420, 3);
      g.beginPath(); g.arc(w / 2, h * .43 + 1.5, 9, 0, 7); g.fill();
    });
    this.logoCanvas = foilTexture((g, w, h) => {
      drawMonogram(g, w / 2, h * .66, 1.55, '#f1d08a');
      g.fillStyle = '#f6dfa6'; g.textBaseline = 'middle'; g.font = `600 118px ${FONT.display}`;
      const [a, b] = CONFIG.RESTAURANT_NAME.split(' '); tracked(g, CONFIG.RESTAURANT_NAME.length > 14 ? a : CONFIG.RESTAURANT_NAME, w / 2, h * .765, 22);
      if (b) { g.font = `500 64px ${FONT.serif}`; tracked(g, CONFIG.RESTAURANT_NAME.slice(a.length + 1), w / 2, h * .805, 40); }
    });
    this.frameCanvas = foilTexture((g, w, h) => {
      g.strokeStyle = '#d8b062'; g.lineWidth = 5; const m = 120; g.strokeRect(m, m, w - 2 * m, h - 2 * m); g.lineWidth = 2; g.strokeRect(m + 28, m + 28, w - 2 * m - 56, h - 2 * m - 56);
      [[m, m], [w - m, m], [m, h - m], [w - m, h - m]].forEach(([cx, cy]) => { g.fillStyle = '#d8b062'; g.beginPath(); g.arc(cx, cy, 12, 0, 7); g.fill(); });
    });
    // deboss the bump where foil will sit
    x.globalCompositeOperation = 'multiply'; x.globalAlpha = .55;
    [this.titleCanvas, this.logoCanvas, this.frameCanvas].forEach(fc => { x.save(); x.filter = 'invert(1)'; x.drawImage(fc, 0, 0, 2048, 2867); x.restore(); });
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
    this.coverBump = canvasTex(c, { srgb: false, aniso: 16 });
    this.paperBump = canvasTex(paperTexture(512, [200, 200, 200]), { srgb: false });
  }
  _pageEdge() { const c = cv(8, 256), x = c.getContext('2d'); for (let i = 0; i < 256; i++) { x.fillStyle = i % 4 < 2 ? '#e9dcc2' : '#f4ead6'; x.fillRect(0, i, 8, 1); } return c; }
  _pageCanvas() {
    const w = 1536, h = Math.round(w * (H - .1) / (W - .1)), c = cv(w, h), x = c.getContext('2d');
    x.drawImage(paperTexture(1024, [200, 184, 156]), 0, 0, w, h);
    // photo mat: a printed white border + hairline; photo itself is a separate plane.
    const pw = this.photoSize ? 2.5 : 2.5, ph = 2.9, sx = w / (W - .1);
    const cx = w / 2, cy = (H - .1) / 2 + (-.3) * -1; // photo centre is z=-0.3 → page y = (H-.1)/2 + z
    const py = ((H - .1) / 2 - 0.3) * sx; // page-space y of the photo centre (top = +z far)
    x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(cx - pw * sx / 2 - 8, ((H - .1) / 2 - 0.3) * sx - ph * sx / 2 - 8, pw * sx + 16, ph * sx + 16);
    // caption block under the photo
    x.textAlign = 'center'; x.fillStyle = '#3a2a1c'; x.font = `500 30px ${FONT.serif}`;
    const capY = ((H - .1) / 2 - .3 + ph / 2) * sx + 78; tracked(x, 'CHEF’S SIGNATURE', cx, capY, 9);
    x.strokeStyle = 'rgba(160,120,60,.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx - 90, capY + 34); x.lineTo(cx + 90, capY + 34); x.stroke();
    x.fillStyle = '#6a5238'; x.font = `italic 400 34px ${FONT.serif}`; x.textAlign = 'center'; x.fillText('Made fresh, served hot.', cx, capY + 86);
    // page frame
    x.strokeStyle = 'rgba(160,120,60,.55)'; x.lineWidth = 3; x.strokeRect(36, 36, w - 72, h - 72);
    return c;
  }
  _liningCanvas() {
    const w = 1536, h = Math.round(w * (H - .06) / (W - .06)), c = cv(w, h), x = c.getContext('2d');
    x.drawImage(paperTexture(1024, [60, 22, 22]), 0, 0, w, h);
    x.strokeStyle = 'rgba(224,181,101,.75)'; x.lineWidth = 3; x.strokeRect(70, 70, w - 140, h - 140); x.lineWidth = 1.5; x.strokeRect(92, 92, w - 184, h - 184);
    drawMonogram(x, w / 2, h * .46, 1.6, '#e0b565');
    x.fillStyle = '#e0b565'; x.textBaseline = 'middle'; x.font = `500 40px ${FONT.serif}`; tracked(x, CONFIG.RESTAURANT_NAME, w / 2, h * .56, 16);
    x.font = `italic 400 36px ${FONT.serif}`; x.fillStyle = 'rgba(240,215,160,.8)'; x.textAlign = 'center'; x.fillText('The Chef’s Selection', w / 2, h * .60);
    return c;
  }

  /** photo texture is injected after the first render (see main.js) */
  setPhoto(tex) { this.photoMat.map = tex; this.photoMat.needsUpdate = true; }

  /** open: 0 closed → 1 open. omega: angular velocity used to flex the cover */
  setOpen(open, omega = 0) {
    const th = open * Math.PI;
    this.pivot.rotation.z = th;
    const k = THREE.MathUtils.clamp(-omega * .055, -.2, .2);
    this.benders.forEach(b => b.bend(k));
    this.photo.visible = this.photo.visible; // controlled by setPhotoState
  }
  /** lift 0..1 : print peels up off the page & fades while the 3D dish forms; show: 0/1 */
  setPhotoState({ show = 0, lift = 0, fade = 1, shimmer = 0 } = {}) {
    this.photo.visible = show > 0 && fade > .003;
    if (!this.photo.visible) return;
    const p = this.photo.geometry.attributes.position, o = this.photoOrig;
    for (let i = 0; i < p.count; i++) {
      const x = o[i * 3], z = o[i * 3 + 2], u = x / (this.photoSize[0] / 2), v = z / (this.photoSize[1] / 2), r = Math.hypot(u, v);
      const dome = Math.exp(-r * r * 1.8), curl = Math.pow(Math.max(0, Math.abs(u) * .8 + Math.abs(v) * .6 - .5), 2);
      p.setXYZ(i, x * (1 - lift * .04), lift * (.55 * dome + .35 * curl) , z);
    }
    p.needsUpdate = true; this.photo.geometry.computeVertexNormals();
    this.photo.position.y = this.photoCenter.y + lift * .12;
    this.photoMat.opacity = fade; this.photoMat.emissive.setScalar(shimmer * .25); this.photoMat.emissiveMap = this.photoMat.map; this.photoMat.emissiveIntensity = shimmer * 1.2;
  }
}
