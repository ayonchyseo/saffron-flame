import * as THREE from 'three';

const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const fsq = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); const fsScene = new THREE.Scene(); fsScene.add(fsq); const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const mat = (fs, uniforms, extra = {}) => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, ...extra });
const rt = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, ...o });

/**
 * Cinematic post stack (all custom, linear HDR until the final pass):
 *  scene(MSAA) → depth-aware gather DOF @half-res (circular bokeh, highlight boost) → [motion-blur accumulation]
 *  → multi-scale bloom → exposure, filmic tone-map, grade, chromatic fringe, vignette, grain, typography overlay.
 */
export class Post {
  constructor(renderer, w, h) {
    this.r = renderer; this.w = w; this.h = h; const hw = w >> 1, hh = h >> 1;
    this.sceneRT = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 2, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.sceneRT.depthTexture = new THREE.DepthTexture(w, h); this.sceneRT.depthTexture.type = THREE.UnsignedIntType;
    this.halfA = rt(hw, hh); this.halfZ = rt(hw, hh); this.halfB = rt(hw, hh);
    this.dofRT = rt(w, h); this.accRT = rt(w, h);
    this.mips = []; for (let i = 1, mw = hw, mh = hh; i <= 6; i++, mw >>= 1, mh >>= 1) this.mips.push({ down: rt(Math.max(2, mw), Math.max(2, mh)), up: rt(Math.max(2, mw), Math.max(2, mh)) });
    this.U = { cam: { value: new THREE.Vector2(.1, 100) }, focus: { value: 5 }, aperture: { value: 0 }, texel: { value: new THREE.Vector2(1 / w, 1 / h) } };
    const lin = `uniform sampler2D tDepth; uniform vec2 cam; float linZ(vec2 uv){ float d=texture2D(tDepth,uv).x; float z=d*2.-1.; return (2.*cam.x*cam.y)/(cam.y+cam.x-z*(cam.y-cam.x)); }`;
    const cocFn = `uniform float focus, aperture; float coc(float z){ return aperture*clamp(abs(z-focus)/max(z,.01) * (focus<4. ? 1.0 : 1.35), 0., 1.); }`;
    this.mPrep = mat(`${lin}${cocFn} uniform sampler2D tColor,tAO; uniform float aoStr; varying vec2 vUv; void main(){ float z=linZ(vUv); float ao=mix(1.,texture2D(tAO,vUv).r,aoStr); gl_FragColor=vec4(texture2D(tColor,vUv).rgb*ao*ao, coc(z)); }`, { tColor: { value: null }, tAO: { value: null }, aoStr: { value: .9 }, tDepth: { value: this.sceneRT.depthTexture }, cam: this.U.cam, focus: this.U.focus, aperture: this.U.aperture });
    this.mZ = mat(`${lin} varying vec2 vUv; void main(){ gl_FragColor=vec4(linZ(vUv)); }`, { tDepth: { value: this.sceneRT.depthTexture }, cam: this.U.cam });
    this.mGather = mat(`uniform sampler2D tA,tZ; uniform vec2 texel; uniform float frame; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233))+frame*.37)*43758.5453); }
      void main(){
        vec4 c0=texture2D(tA,vUv); float z0=texture2D(tZ,vUv).x; float R=max(c0.a,0.); // coc radius in FULL-res px; half-res taps → /2
        // search radius also from neighbours so near-field bleeds over sharp pixels
        float maxR=R; vec4 acc=vec4(c0.rgb,1.); float wsum=1.;
        const int N=56; float ang=hash(vUv*vec2(1920.,1080.))*6.2831853; const float GA=2.39996323;
        float Rm=max(R, 0.); 
        // fetch ring neighbours' CoC to extend radius for foreground blur
        float nb=0.; for(int i=0;i<8;i++){ float a=float(i)*.7853; nb=max(nb,texture2D(tA,vUv+vec2(cos(a),sin(a))*texel*14.).a); }
        Rm=max(Rm,nb*.9);
        if(Rm<1.0){ gl_FragColor=vec4(c0.rgb,1.); return; }
        acc=vec4(0.); wsum=0.;
        for(int i=0;i<N;i++){
          float fi=float(i); float rr=sqrt((fi+.5)/float(N)); float a=fi*GA+ang; vec2 off=vec2(cos(a),sin(a))*rr*Rm*.5; // half-res px
          vec2 uv=vUv+off*texel*2.; vec4 s=texture2D(tA,uv); float sz=texture2D(tZ,uv).x;
          float d=rr*Rm; float sc=s.a; if(sz>z0) sc=min(sc,max(c0.a,.0)+1.0); // background must not bleed over sharp subject
          float w=smoothstep(d-1.5,d+.5,sc);
          float lum=dot(s.rgb,vec3(.299,.587,.114)); w*= 1.+ pow(max(lum,0.),1.6)*.35; // bright highlights bloom into discs
          acc+=vec4(s.rgb*w,w); wsum+=w;
        }
        gl_FragColor=vec4(acc.rgb/max(wsum,1e-4),1.);
      }`, { tA: { value: null }, tZ: { value: null }, texel: { value: new THREE.Vector2(1 / hw, 1 / hh) }, frame: { value: 0 } });
    this.aoA = rt(hw, hh); this.aoB = rt(hw, hh);
    this.AO = { projInv: { value: new THREE.Matrix4() }, proj: { value: new THREE.Matrix4() }, radius: { value: .32 }, strength: { value: 1.0 } };
    this.mAO = mat(`${lin} uniform mat4 projInv, proj; uniform float radius; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      vec3 vpos(vec2 uv){ float d=texture2D(tDepth,uv).x; vec4 c=vec4(uv*2.-1.,d*2.-1.,1.); vec4 v=projInv*c; return v.xyz/v.w; }
      void main(){
        float d0=texture2D(tDepth,vUv).x; if(d0>=.99999){ gl_FragColor=vec4(1.); return; }
        vec3 P=vpos(vUv); vec3 dx=vpos(vUv+vec2(1./1080.,0.))-P, dy=vpos(vUv+vec2(0.,1./1920.))-P;
        vec3 dx2=P-vpos(vUv-vec2(1./1080.,0.)), dy2=P-vpos(vUv-vec2(0.,1./1920.));
        if(abs(dx2.z)<abs(dx.z)) dx=dx2; if(abs(dy2.z)<abs(dy.z)) dy=dy2;
        vec3 N=normalize(cross(dx,dy)); if(dot(N,-P)<0.) N=-N;
        float ang=h(vUv*vec2(1080.,1920.))*6.2831853; float occ=0.; const int NS=16;
        vec3 T=normalize(abs(N.y)<.9?cross(N,vec3(0,1,0)):cross(N,vec3(1,0,0))); vec3 B=cross(N,T);
        for(int i=0;i<NS;i++){ float fi=float(i); float a=fi*2.39996+ang; float rr=sqrt((fi+.5)/float(NS)); float zc=sqrt(max(0.,1.-rr*rr));
          vec3 dir=T*cos(a)*rr+B*sin(a)*rr+N*zc; float sc=mix(.15,1.,rr*rr); vec3 S=P+dir*radius*sc;
          vec4 q=proj*vec4(S,1.); vec2 uv=q.xy/q.w*.5+.5; float sz=linZ(uv); float szs=-S.z;
          float diff=szs-sz; float range=smoothstep(0.,1.,radius/max(abs(-P.z-sz),1e-4));
          occ+= (diff>.012*radius ? 1. : 0.)*range; }
        gl_FragColor=vec4(1.-occ/float(NS),0.,0.,1.);
      }`, { tDepth: { value: this.sceneRT.depthTexture }, cam: this.U.cam, projInv: this.AO.projInv, proj: this.AO.proj, radius: this.AO.radius });
    this.mAOBlur = mat(`${lin} uniform sampler2D tAO; uniform vec2 texel; varying vec2 vUv; void main(){ float z0=linZ(vUv); float s=0.,w=0.; for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){ vec2 uv=vUv+vec2(float(i),float(j))*texel; float z=linZ(uv); float k=exp(-abs(z-z0)*14./max(z0,.5)); s+=texture2D(tAO,uv).r*k; w+=k; } gl_FragColor=vec4(s/max(w,1e-4),0.,0.,1.); }`, { tAO: { value: null }, texel: { value: new THREE.Vector2(1 / hw, 1 / hh) }, tDepth: { value: this.sceneRT.depthTexture }, cam: this.U.cam });
    this.mComp = mat(`${lin}${cocFn} uniform sampler2D tColor,tBlur,tAO; uniform float aoStr; varying vec2 vUv; void main(){ float z=linZ(vUv); float c=coc(z); float ao=mix(1.,texture2D(tAO,vUv).r,aoStr); ao=ao*ao; vec3 s=texture2D(tColor,vUv).rgb*ao; vec3 b=texture2D(tBlur,vUv).rgb; float w=smoothstep(.6,3.2,c); gl_FragColor=vec4(mix(s,b,w),1.); }`,
      { tColor: { value: null }, tBlur: { value: null }, tAO: { value: null }, aoStr: { value: .9 }, tDepth: { value: this.sceneRT.depthTexture }, cam: this.U.cam, focus: this.U.focus, aperture: this.U.aperture });
    this.mAdd = mat(`uniform sampler2D tColor; uniform float weight; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tColor,vUv).rgb*weight,1.); }`, { tColor: { value: null }, weight: { value: 1 } }, { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor });
    this.mDown = mat(`uniform sampler2D tColor; uniform vec2 texel; uniform float thresh; uniform float first; varying vec2 vUv;
      vec3 pre(vec3 c){ float l=max(c.r,max(c.g,c.b)); float k=max(l-thresh,0.)/max(l,1e-4); return c*mix(1.,k,first); }
      void main(){ vec2 t=texel; vec3 a=pre(texture2D(tColor,vUv+t*vec2(-2,2)).rgb),b=pre(texture2D(tColor,vUv+t*vec2(0,2)).rgb),c=pre(texture2D(tColor,vUv+t*vec2(2,2)).rgb),d=pre(texture2D(tColor,vUv+t*vec2(-2,0)).rgb),e=pre(texture2D(tColor,vUv).rgb),f=pre(texture2D(tColor,vUv+t*vec2(2,0)).rgb),g=pre(texture2D(tColor,vUv+t*vec2(-2,-2)).rgb),h=pre(texture2D(tColor,vUv+t*vec2(0,-2)).rgb),i=pre(texture2D(tColor,vUv+t*vec2(2,-2)).rgb),j=pre(texture2D(tColor,vUv+t*vec2(-1,1)).rgb),k=pre(texture2D(tColor,vUv+t*vec2(1,1)).rgb),l=pre(texture2D(tColor,vUv+t*vec2(-1,-1)).rgb),m=pre(texture2D(tColor,vUv+t*vec2(1,-1)).rgb);
        vec3 o=e*.125+(a+c+g+i)*.03125+(b+d+f+h)*.0625+(j+k+l+m)*.125; gl_FragColor=vec4(o,1.); }`, { tColor: { value: null }, texel: { value: new THREE.Vector2() }, thresh: { value: 1.0 }, first: { value: 0 } });
    this.mUp = mat(`uniform sampler2D tColor,tPrev; uniform vec2 texel; uniform float mixAmt; varying vec2 vUv; void main(){ vec3 s=vec3(0.); s+=texture2D(tColor,vUv+texel*vec2(-1,-1)).rgb; s+=texture2D(tColor,vUv+texel*vec2(0,-1)).rgb*2.; s+=texture2D(tColor,vUv+texel*vec2(1,-1)).rgb; s+=texture2D(tColor,vUv+texel*vec2(-1,0)).rgb*2.; s+=texture2D(tColor,vUv).rgb*4.; s+=texture2D(tColor,vUv+texel*vec2(1,0)).rgb*2.; s+=texture2D(tColor,vUv+texel*vec2(-1,1)).rgb; s+=texture2D(tColor,vUv+texel*vec2(0,1)).rgb*2.; s+=texture2D(tColor,vUv+texel*vec2(1,1)).rgb; s/=16.; gl_FragColor=vec4(s*mixAmt+texture2D(tPrev,vUv).rgb,1.); }`, { tColor: { value: null }, tPrev: { value: null }, texel: { value: new THREE.Vector2() }, mixAmt: { value: 1 } });
    this.F = {
      exposure: { value: 1 }, bloom: { value: .5 }, fade: { value: 1 }, frame: { value: 0 }, grain: { value: .035 }, vig: { value: .55 }, ca: { value: .0016 }, warm: { value: 1 }, flash: { value: 0 },
      tColor: { value: null }, tBloom: { value: null }, tOver: { value: null }, aspect: { value: w / h },
    };
    this.mFinal = mat(`uniform sampler2D tColor,tBloom,tOver; uniform float exposure,bloom,fade,frame,grain,vig,ca,warm,flash,aspect; varying vec2 vUv;
      float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      vec3 aces(vec3 x){ const float a=2.51,b=.03,c=2.43,d=.59,e=.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.); }
      vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c,vec3(1./2.4))-.055, step(.0031308,c)); }
      void main(){
        vec2 d=vUv-.5; float r2=dot(d*vec2(aspect,1.),d*vec2(aspect,1.)); vec2 o=d*ca*(1.+r2*3.);
        vec3 col; col.r=texture2D(tColor,vUv-o).r; col.g=texture2D(tColor,vUv).g; col.b=texture2D(tColor,vUv+o).b;
        col+=texture2D(tBloom,vUv).rgb*bloom;
        col*=exposure; col+=flash*vec3(1.,.82,.55);
        // filmic + food grade: keep warm saturated mids, gentle toe
        vec3 t=aces(col*.82); float L=dot(t,vec3(.2126,.7152,.0722)); t=mix(vec3(L),t,1.18);
        t=mix(t*vec3(1.02,.99,.93), t, .0); t*=mix(vec3(1.),vec3(1.05,1.0,.9),warm*smoothstep(.25,1.,L)); t+=vec3(.010,.004,.000)*(1.-L)*warm; // warm highlights, brown shadows
        vec3 s=toSRGB(max(t,0.));
        s=mix(s, s*s*(3.-2.*s), .22); // gentle S-curve contrast
        float v=1.-vig*smoothstep(.18,.95,r2*1.9); s*=v;
        vec4 ov=texture2D(tOver,vUv); s=s*(1.-ov.a)+ov.rgb; // premultiplied overlay
        float g=h21(vUv*vec2(1080.,1920.)+frame*13.7)-.5; s+=g*grain*(1.-.5*dot(s,vec3(.33)));
        s*=fade; gl_FragColor=vec4(clamp(s,0.,1.),1.);
      }`, this.F);
    this.quad = (m, target) => { fsq.material = m; this.r.setRenderTarget(target); this.r.render(fsScene, fsCam); };
  }
  /** renders `scene` through the DOF stage into dofRT (HDR linear). */
  renderDOF(scene, camera, cam) {
    const r = this.r; this.U.cam.value.set(camera.near, camera.far); this.U.focus.value = cam.focus; this.U.aperture.value = cam.aperture;
    r.setRenderTarget(this.sceneRT); r.clear(); r.render(scene, camera);
    camera.updateMatrixWorld(); this.AO.proj.value.copy(camera.projectionMatrix); this.AO.projInv.value.copy(camera.projectionMatrixInverse);
    this.quad(this.mAO, this.aoA); this.mAOBlur.uniforms.tAO.value = this.aoA.texture; this.quad(this.mAOBlur, this.aoB);
    // AO is baked into the colour before DOF so bokeh/blur treat occlusion consistently
    this.mComp.uniforms.tAO.value = this.aoB.texture;
    this.mPrep.uniforms.tColor.value = this.sceneRT.texture; this.mPrep.uniforms.tAO.value = this.aoB.texture;
    this.quad(this.mPrep, this.halfA);
    this.quad(this.mZ, this.halfZ);
    this.mGather.uniforms.tA.value = this.halfA.texture; this.mGather.uniforms.tZ.value = this.halfZ.texture; this.quad(this.mGather, this.halfB);
    this.mComp.uniforms.tColor.value = this.sceneRT.texture; this.mComp.uniforms.tBlur.value = this.halfB.texture; this.quad(this.mComp, this.dofRT);
    return this.dofRT;
  }
  clearAcc() { this.r.setRenderTarget(this.accRT); this.r.setClearColor(0x000000, 1); this.r.clear(); }
  accumulate(src, weight) { this.mAdd.uniforms.tColor.value = src.texture; this.mAdd.uniforms.weight.value = weight; this.quad(this.mAdd, this.accRT); }
  bloomPass(src, thresh = 1.0) {
    let prev = src; this.mDown.uniforms.thresh.value = thresh;
    this.mips.forEach((m, i) => { this.mDown.uniforms.tColor.value = prev.texture; this.mDown.uniforms.texel.value.set(1 / prev.width, 1 / prev.height); this.mDown.uniforms.first.value = i === 0 ? 1 : 0; this.quad(this.mDown, m.down); prev = m.down; });
    // up-sample chain with additive accumulation
    const n = this.mips.length; let cur = this.mips[n - 1].down;
    for (let i = n - 2; i >= 0; i--) { this.mUp.uniforms.tColor.value = cur.texture; this.mUp.uniforms.tPrev.value = this.mips[i].down.texture; this.mUp.uniforms.texel.value.set(1 / cur.width, 1 / cur.height); this.mUp.uniforms.mixAmt.value = .85; this.quad(this.mUp, this.mips[i].up); cur = this.mips[i].up; }
    return cur;
  }
  finish(src, bloomTex, overlayTex) {
    this.F.tColor.value = src.texture; this.F.tBloom.value = bloomTex.texture; this.F.tOver.value = overlayTex; this.quad(this.mFinal, null);
  }
}
