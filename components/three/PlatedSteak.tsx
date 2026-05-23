"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMouseNormalized } from "@/hooks/useMouseNormalized";

/** Hero centerpiece — a plated Wagyu over a slate base, on a gold charger plate.
 *  Auto-rotates, tilts toward the cursor, and bobs gently. */
export function PlatedSteak() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMouseNormalized();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y += delta * 0.18;
    // cursor tilt — gentle, capped
    const tx = mouse.current.y * 0.08;
    const tz = mouse.current.x * 0.06;
    groupRef.current.rotation.x += (tx - groupRef.current.rotation.x) * 0.06;
    groupRef.current.rotation.z += (tz - groupRef.current.rotation.z) * 0.06;
    // bob
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* Slate base */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.18, 0.08, 64]} />
        <meshStandardMaterial color="#1a1817" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Gold charger plate */}
      <mesh position={[0, -0.38, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.018, 64]} />
        <meshStandardMaterial color="#c89b3c" metalness={0.95} roughness={0.18} />
      </mesh>
      {/* Thin gold rim */}
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.012, 16, 96]} />
        <meshStandardMaterial color="#f3e0a8" metalness={1} roughness={0.1} />
      </mesh>

      {/* Seared steak — chamfered box */}
      <mesh position={[0, -0.16, 0]} rotation={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.05, 0.3, 0.7]} />
        <meshStandardMaterial
          color="#3a1612"
          roughness={0.78}
          metalness={0.05}
          emissive="#5c1f1a"
          emissiveIntensity={0.22}
        />
      </mesh>
      {/* Sear lacquer — gold tamari glaze, mildly transmissive */}
      <mesh position={[0, 0.0, 0]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[1.08, 0.04, 0.72]} />
        <MeshTransmissionMaterial
          color="#c89b3c"
          thickness={0.4}
          roughness={0.18}
          transmission={0.6}
          ior={1.4}
        />
      </mesh>

      {/* Microgreens */}
      {[
        [0.35, 0.06, 0.15],
        [-0.28, 0.06, -0.18],
        [0.08, 0.06, 0.28],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <torusGeometry args={[0.05, 0.014, 8, 16]} />
          <meshStandardMaterial color="#3d5f2e" roughness={0.55} />
        </mesh>
      ))}

      {/* Gold-leaf flake */}
      <mesh position={[0.15, 0.1, 0.05]} rotation={[0.3, 0.4, 0.2]}>
        <planeGeometry args={[0.18, 0.12]} />
        <meshStandardMaterial
          color="#f3e0a8"
          metalness={1}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Drizzle — gold tube */}
      <DrizzleTube />
    </group>
  );
}

function DrizzleTube() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.05, 0.2),
    new THREE.Vector3(-0.15, 0.06, -0.05),
    new THREE.Vector3(0.15, 0.05, 0.15),
    new THREE.Vector3(0.4, 0.05, -0.1),
  ]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 40, 0.012, 8, false]} />
      <meshStandardMaterial
        color="#c89b3c"
        metalness={0.9}
        roughness={0.2}
        emissive="#7a5c1b"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
