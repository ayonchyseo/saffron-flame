"use client";

import {
  Environment,
  Lightformer,
  ContactShadows,
  Float,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Vector2 } from "three";

import { PlatedSteak } from "./PlatedSteak";
import { SmokeParticles } from "./SmokeParticles";
import {
  useIsMobile,
  usePrefersReducedMotion,
} from "@/hooks/useMediaQuery";

export function HeroScene() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  return (
    <>
      {/* 3-point lighting — warm key + cool fill + gold rim */}
      <ambientLight intensity={0.3} color="#3a2a18" />
      <spotLight
        position={[4, 6, 4]}
        angle={0.45}
        penumbra={0.5}
        intensity={2.2}
        color="#ffb766"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.5}
        color="#3a4a6a"
      />
      <pointLight position={[0, -1, 2]} intensity={0.6} color="#ff7a3d" />
      {/* Procedural environment — no external HDR fetch, works offline */}
      <Environment resolution={256} background={false}>
        <Lightformer intensity={3} color="#ffb766" position={[6, 8, 6]} scale={[8, 8, 1]} />
        <Lightformer intensity={1.2} color="#c89b3c" position={[-6, 4, -4]} scale={[6, 6, 1]} />
        <Lightformer intensity={0.6} color="#3a4a6a" position={[0, -4, -6]} scale={[8, 4, 1]} />
        <Lightformer intensity={0.8} color="#ff7a3d" position={[0, 2, 6]} scale={[4, 4, 1]} />
      </Environment>

      <Float
        speed={reduced ? 0 : 1.2}
        rotationIntensity={0.18}
        floatIntensity={reduced ? 0 : 0.35}
      >
        <PlatedSteak />
      </Float>

      {!isMobile && !reduced && <SmokeParticles count={48} />}

      <ContactShadows
        position={[0, -0.48, 0]}
        opacity={0.55}
        scale={6}
        blur={3.2}
        far={1.5}
      />

      {!reduced && (
        <EffectComposer>
          <Bloom
            kernelSize={KernelSize.LARGE}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.4}
            intensity={0.7}
            mipmapBlur
          />
          <ChromaticAberration
            offset={new Vector2(0.0008, 0.0008)}
            radialModulation
            modulationOffset={0.5}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette eskil={false} offset={0.18} darkness={0.78} />
        </EffectComposer>
      )}
    </>
  );
}
