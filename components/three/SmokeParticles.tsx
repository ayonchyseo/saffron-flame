"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SmokeProps {
  count?: number;
  origin?: [number, number, number];
}

/** Instanced smoke / heat shimmer rising from a point. Pure GPU friendly. */
export function SmokeParticles({
  count = 50,
  origin = [0, -0.4, 0],
}: SmokeProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      pos: new THREE.Vector3(
        origin[0] + (Math.random() - 0.5) * 0.4,
        origin[1] + Math.random() * 0.2,
        origin[2] + (Math.random() - 0.5) * 0.4,
      ),
      vel: new THREE.Vector3(0, 0.4 + Math.random() * 0.6, 0),
      sway: Math.random() * Math.PI * 2,
      scale: 0.08 + Math.random() * 0.18,
      life: Math.random(),
    }));
  }, [count, origin]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cWarm = useMemo(() => new THREE.Color("#ffd57a"), []);
  const cCool = useMemo(() => new THREE.Color("#3a3a3a"), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    data.forEach((p, i) => {
      p.life += delta * 0.4;
      if (p.life > 1) {
        p.pos.set(
          origin[0] + (Math.random() - 0.5) * 0.4,
          origin[1],
          origin[2] + (Math.random() - 0.5) * 0.4,
        );
        p.life = 0;
      }
      p.pos.y += p.vel.y * delta;
      p.pos.x += Math.sin(t * 1.5 + p.sway) * 0.005;

      dummy.position.copy(p.pos);
      const s = p.scale * (0.4 + p.life * 1.4);
      dummy.scale.setScalar(s);
      dummy.rotation.z = t * 0.3 + p.sway;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      const color = cWarm.clone().lerp(cCool, p.life);
      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial
        color="#ffd57a"
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
