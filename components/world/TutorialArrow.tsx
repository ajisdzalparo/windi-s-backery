"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { useGame } from "@/lib/store";
import { TUTORIAL } from "@/lib/tutorial";

/** Panah 3D memantul di atas tujuan langkah tutorial, plus lingkaran berdenyut di tanah. */
export function TutorialArrow() {
  const step = useGame((s) => (s.tutorialStep === null ? null : TUTORIAL[s.tutorialStep]));
  const arrow = useRef<Group>(null!);
  const ring = useRef<Mesh>(null!);
  useFrame(({ clock }) => {
    if (!arrow.current) return;
    const t = clock.elapsedTime;
    arrow.current.position.y = 2.4 + Math.abs(Math.sin(t * 3)) * 0.5;
    arrow.current.rotation.y = t * 1.5;
    const s = 1 + ((t * 0.8) % 1) * 0.6;
    ring.current.scale.set(s, s, s);
    (ring.current.material as { opacity: number }).opacity = 1 - ((t * 0.8) % 1);
  });
  if (!step?.target) return null;
  const [x, z] = step.target;
  return (
    <group position={[x, 0, z]}>
      <group ref={arrow}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.32, 0.6, 16]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 12]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent />
      </mesh>
    </group>
  );
}
