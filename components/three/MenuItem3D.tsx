"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import type { MenuCategory } from "@/types";

interface MenuItem3DProps {
  category: MenuCategory;
  hovered: boolean;
}

export function MenuItem3D({ category, hovered }: MenuItem3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = hovered ? 0.9 : 0.35;
    groupRef.current.rotation.y += delta * speed;
    const targetY = hovered ? 0.12 : 0;
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * 0.1;
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.3}
        color="#ffd57a"
        castShadow
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#5b6a8a" />
      {/* Procedural environment — no external HDR fetch */}
      <Environment resolution={128} background={false}>
        <Lightformer intensity={2} color="#ffd57a" position={[4, 6, 4]} scale={[6, 6, 1]} />
        <Lightformer intensity={0.8} color="#c89b3c" position={[-4, 2, -3]} scale={[5, 5, 1]} />
        <Lightformer intensity={0.4} color="#5b6a8a" position={[0, -3, -4]} scale={[6, 3, 1]} />
      </Environment>

      <group ref={groupRef}>
        {category === "steak" && <SteakGeometry />}
        {category === "sushi" && <SushiGeometry />}
        {category === "ramen" && <RamenGeometry />}
        {category === "dessert" && <DessertGeometry />}
        {category === "cocktail" && <CocktailGeometry />}
      </group>

      <ContactShadows
        position={[0, -0.45, 0]}
        opacity={0.6}
        scale={3}
        blur={2.6}
        far={1}
      />
    </>
  );
}

/* ── Per-category procedural geometries ───────────────────── */

function SteakGeometry() {
  return (
    <group>
      {/* Slate base */}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[0.88, 0.92, 0.06, 48]} />
        <meshStandardMaterial color="#1a1817" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Steak body */}
      <mesh position={[0, -0.16, 0]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.92, 0.24, 0.62]} />
        <meshStandardMaterial
          color="#3a1612"
          roughness={0.75}
          metalness={0.05}
          emissive="#5c1f1a"
          emissiveIntensity={0.18}
        />
      </mesh>
      {/* Sear glaze */}
      <mesh position={[0, -0.04, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.94, 0.04, 0.64]} />
        <meshStandardMaterial
          color="#c89b3c"
          roughness={0.25}
          metalness={0.6}
          emissive="#ff5b1f"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Microgreen accent */}
      <mesh position={[0.3, 0.0, 0.18]}>
        <torusGeometry args={[0.04, 0.012, 8, 16]} />
        <meshStandardMaterial color="#3d5f2e" roughness={0.6} />
      </mesh>
    </group>
  );
}

function SushiGeometry() {
  return (
    <group>
      {/* Wood board */}
      <mesh position={[0, -0.36, 0]}>
        <boxGeometry args={[1.3, 0.05, 0.6]} />
        <meshStandardMaterial color="#2a1d12" roughness={0.85} />
      </mesh>
      {/* Three nigiri */}
      {[-0.42, 0, 0.42].map((x, i) => (
        <group key={i} position={[x, -0.18, 0]}>
          {/* Rice */}
          <mesh>
            <boxGeometry args={[0.3, 0.16, 0.22]} />
            <meshStandardMaterial color="#f5efe4" roughness={0.7} />
          </mesh>
          {/* Fish slice — pink/red toro */}
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.32, 0.04, 0.24]} />
            <meshStandardMaterial
              color={i === 0 ? "#a83737" : i === 1 ? "#c45050" : "#e07e7e"}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          {/* Nori band */}
          <mesh position={[0, 0.04, 0]}>
            <torusGeometry args={[0.16, 0.012, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#0d0a08" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RamenGeometry() {
  return (
    <group>
      {/* Bowl exterior — dark glaze */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#0d0a08"
          roughness={0.3}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bowl interior */}
      <mesh position={[0, -0.15, 0]} scale={[0.92, 0.92, 0.92]}>
        <sphereGeometry args={[0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#7a3a14"
          roughness={0.4}
          side={THREE.DoubleSide}
          emissive="#7a3a14"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Broth surface */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.56, 48]} />
        <meshStandardMaterial
          color="#3a1808"
          roughness={0.2}
          metalness={0.6}
          emissive="#5c1f1a"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Noodle knot */}
      <mesh position={[0, 0.12, 0]}>
        <torusKnotGeometry args={[0.18, 0.04, 64, 8]} />
        <meshStandardMaterial color="#e8c879" roughness={0.55} />
      </mesh>
      {/* Egg */}
      <mesh position={[0.28, 0.12, 0.05]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#f5efe4" roughness={0.5} />
      </mesh>
      <mesh position={[0.28, 0.12, 0.105]} scale={[1, 1, 0.1]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ff7a3d"
          emissive="#ff5b1f"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function DessertGeometry() {
  return (
    <group>
      {/* Plate */}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.04, 48]} />
        <meshStandardMaterial color="#1a1817" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Chocolate sphere with transmission */}
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.32, 48, 48]} />
        <MeshTransmissionMaterial
          color="#2a0f0a"
          thickness={0.6}
          roughness={0.1}
          transmission={0.4}
          ior={1.5}
        />
      </mesh>
      {/* Gold band */}
      <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.012, 12, 64]} />
        <meshStandardMaterial color="#e8c879" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Gold leaf — icosahedron flake */}
      <mesh position={[0.05, 0.28, 0]} rotation={[0.3, 0.5, 0]}>
        <icosahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#f3e0a8" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
}

function CocktailGeometry() {
  return (
    <group>
      {/* Foot */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.32, 0.34, 0.04, 32]} />
        <meshStandardMaterial color="#0d0a08" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 16]} />
        <meshStandardMaterial color="#2a2520" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Bowl (open cone) */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.42, 0.5, 32, 1, true]} />
        <MeshTransmissionMaterial
          color="#ffd57a"
          thickness={0.3}
          roughness={0.05}
          transmission={1}
          ior={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Liquid (smaller cone) */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 0.36, 32]} />
        <meshStandardMaterial
          color="#b8330e"
          roughness={0.1}
          metalness={0.4}
          emissive="#5c1f1a"
          emissiveIntensity={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Garnish — olive/peel */}
      <mesh position={[0.2, 0.18, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#3d5f2e" roughness={0.6} />
      </mesh>
    </group>
  );
}
