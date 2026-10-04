import * as THREE from 'three';
import { CONFIG } from './config.js';
import { Lighting } from './components/Lighting.js';
import { MenuCard, PAGE_TOP_Y } from './components/MenuCard.js';
import { FoodHero } from './components/FoodHero.js';
import * as Dishes from './components/Dishes.js';
import { Particles } from './components/Particles.js';
import { Post } from './components/Post.js';
import { CameraRig } from './components/Camera.js';
import { Typography } from './components/Typography.js';
import { FinalCTA } from './components/FinalCTA.js';
import { SceneTimeline, CAMERA, subframes, PLAN, CUES, KS, ES } from './components/SceneTimeline.js';

const W = CONFIG.WIDTH, H = CONFIG.HEIGHT, FPS = CONFIG.FPS;
const SCALE = +new URLSearchParams(location.search).get('scale') || 1;   // preview scale
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W * SCALE, H * SCALE, false); canvas.style.width = W * SCALE + 'px'; canvas.style.height = H * SCALE + 'px';
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.NoToneMapping; renderer.autoClear = true;

async function loadFonts() {
  const fams = ['700 40px "Playfair Display"', '600 40px "Playfair Display"', '400 40px "Playfair Display"', '500 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"', '500 30px Inter', '600 30px Inter', '700 30px Inter', '700 40px "Hind Siliguri"'];
  await Promise.all(fams.map(f => document.fonts.load(f, 'Aa৳ 0123')));
  await document.fonts.ready;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, .08, 120); scene.add(camera);
let A = null; window.__A = () => A;

async function setup() {
  await loadFonts();
  const lighting = new Lighting(renderer, scene);
  const book = new MenuCard(); scene.add(book.root);
  const hero = new FoodHero(); const heroGroup = new THREE.Group(); heroGroup.add(hero.root); scene.add(heroGroup);
  const extraObjs = { cake: Dishes.lavaCake(), fries: Dishes.trufflFries(), shake: Dishes.shake() };
  for (const k in extraObjs) { extraObjs[k].visible = false; scene.add(extraObjs[k]); }
  const particles = new Particles(scene, camera);
  const post = new Post(renderer, W * SCALE, H * SCALE);
  const rig = new CameraRig(camera, CAMERA);
  const typo = new Typography(W, H); const cta = new FinalCTA(typo);
  A = { scene, camera, rig, lighting, book, hero, heroGroup, extraObjs, particles, post, typo, cta, renderer };
  A.tl = new SceneTimeline(A);
  makePhoto();
  window.__ready = true;
}

/** Render the hero dish through the full post stack → printed photograph on the menu page. */
function makePhoto() {
  const { hero, heroGroup, book, lighting, particles, post, typo, extraObjs } = A;
  const hidden = [book.root, ...Object.values(extraObjs)], vis = hidden.map(o => o.visible); hidden.forEach(o => o.visible = false);
  heroGroup.visible = true; heroGroup.position.set(0, 0, 0); heroGroup.scale.setScalar(1); heroGroup.rotation.y = .5; hero.update({ build: 1, explode: 0, time: 0 });
  const pc = new THREE.PerspectiveCamera(26, W / H, .08, 120); pc.position.set(1.4, 3.1, 4.9); pc.lookAt(-.1, .35, 0); pc.updateMatrixWorld();
  lighting.apply({ key: 840 * KS, rim: 300 * KS, kick: 28 * KS, fill: .25, env: .75 * ES, shaft: 0, bokeh: 1, keyAngle: .62, keyPenumbra: .95, keyPos: [Math.sin(1.7) * 7.2, 6.4, Math.cos(1.7) * 7.2], rimPos: [-5, 3.4, -4], keyTarget: [0, .35, 0] }, 0);
  particles.update(2.0, { steam: 1, dust: .2, origin: new THREE.Vector3(0, 0, 0), scale: 1, center: new THREE.Vector3(0, .3, 0) });
  const s = post.renderDOF(scene, pc, { focus: pc.position.distanceTo(new THREE.Vector3(-.1, .5, 0)), aperture: 10 });
  const bloom = post.bloomPass(s, 1.0); typo.begin(); const ov = typo.end();
  post.F.exposure.value = 1; post.F.fade.value = 1; post.F.vig.value = .5; post.F.grain.value = .02; post.finish(s, bloom, ov);
  // crop the central portrait region to the photo's aspect, bake to an 8-bit sRGB canvas
  const pw = 2.5, ph = 2.9, ar = pw / ph, cw = canvas.width, chh = Math.round(cw / ar), cy = Math.round((canvas.height - chh) / 2 - canvas.height * .02);
  const c2 = document.createElement('canvas'); c2.width = 1400; c2.height = Math.round(1400 / ar); const x = c2.getContext('2d');
  x.drawImage(canvas, 0, cy, cw, chh, 0, 0, c2.width, c2.height);
  // print finish: slight matte lift + vignette-ish border so it reads as paper
  const g = x.createLinearGradient(0, 0, 0, c2.height); g.addColorStop(0, 'rgba(20,10,4,.0)'); g.addColorStop(1, 'rgba(20,10,4,.12)'); x.fillStyle = g; x.fillRect(0, 0, c2.width, c2.height);
  x.strokeStyle = '#f3ecdc'; x.lineWidth = 34; x.strokeRect(0, 0, c2.width, c2.height);
  const tex = new THREE.CanvasTexture(c2); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16; book.setPhoto(tex);
  hidden.forEach((o, i) => o.visible = vis[i]); post.F.vig.value = .55; post.F.grain.value = .035; window.__photo = c2.toDataURL('image/jpeg', .9);
}

function renderAt(t, frame = 0) {
  const { tl, post, rig, camera } = A, n = subframes(t), dt = 1 / FPS;
  if (n === 1) {
    const cam = tl.apply(t); const s = post.renderDOF(A.scene, camera, cam); const bl = post.bloomPass(s, 1.0); const ov = tl.overlay(t); post.F.frame.value = frame; post.mGather.uniforms.frame.value = frame % 7; post.finish(s, bl, ov);
  } else {
    post.clearAcc();
    for (let j = 0; j < n; j++) { const tj = t + ((j + .5) / n - .5) * dt * .5; const cam = tl.apply(tj); const s = post.renderDOF(A.scene, camera, cam); post.mGather.uniforms.frame.value = (frame + j) % 7; post.accumulate(s, 1 / n); }
    tl.apply(t); const bl = post.bloomPass(post.accRT, 1.0); const ov = tl.overlay(t); post.F.frame.value = frame; post.finish(post.accRT, bl, ov);
  }
}

window.setupAd = setup;
window.renderT = t => { renderAt(t, Math.round(t * FPS)); renderer.getContext().finish(); return true; };
window.grab = (q = .95) => canvas.toDataURL('image/jpeg', q).slice(23);
window.grabPNG = () => canvas.toDataURL('image/png').slice(22);
window.__plan = { PLAN, CUES };
setup().catch(e => { console.error('SETUP FAIL', e.stack || e); window.__err = String(e); });

// ---- profiling helper: per-stage ms for one frame ----
window.profile = t => {
  const { tl, post, camera } = A, gl = renderer.getContext(), T = {}; let t0 = performance.now(); const px = new Uint8Array(4); const lap = k => { renderer.setRenderTarget(null); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const n = performance.now(); T[k] = Math.round(n - t0); t0 = n; };
  const cam = tl.apply(t); lap('apply');
  renderer.setRenderTarget(post.sceneRT); renderer.clear(); renderer.render(A.scene, camera); lap('scene');
  post.renderDOF(A.scene, camera, cam); lap('scene+dof(all)'); const sc = post.sceneRT; 
  const s = post.dofRT; const bl = post.bloomPass(s, 1.0); lap('bloom'); const ov = tl.overlay(t); lap('overlay'); post.finish(s, bl, ov); lap('final');
  return T;
};
