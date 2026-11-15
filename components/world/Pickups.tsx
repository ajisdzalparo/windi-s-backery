"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { Group } from "three";
import { forageForDay } from "@/lib/data";
import { useGame } from "@/lib/store";
import type { LetterItem } from "@/lib/types";
import { Ball, Cyl } from "../scene/parts";

function WildItem({ item }: { item: string }) {
  if (item === "mushroom") {
    return (
      <>
        <Cyl p={[0, 0.1, 0]} rt={0.05} rb={0.07} h={0.2} c="#fef3c7" />
        <Ball p={[0, 0.22, 0]} rad={0.16} c="#dc2626" s={[1, 0.6, 1]} />
        <Ball p={[0.06, 0.29, 0.06]} rad={0.03} c="#ffffff" />
        <Cyl p={[0.2, 0.07, 0.1]} rt={0.03} rb={0.04} h={0.14} c="#fef3c7" />
        <Ball p={[0.2, 0.15, 0.1]} rad={0.09} c="#dc2626" s={[1, 0.6, 1]} />
      </>
    );
  }
  if (item === "chamomile") {
    return (
      <>
        {[0, 1, 2, 3].map((i) => {
          const a = i * 1.6;
          const x = Math.cos(a) * 0.15;
          const z = Math.sin(a) * 0.15;
          return (
            <group key={i} position={[x, 0, z]}>
              <Cyl p={[0, 0.14, 0]} rt={0.012} rb={0.015} h={0.28} c="#65a30d" seg={5} />
              <Ball p={[0, 0.29, 0]} rad={0.07} c="#ffffff" s={[1, 0.35, 1]} />
              <Ball p={[0, 0.31, 0]} rad={0.03} c="#facc15" />
            </group>
          );
        })}
      </>
    );
  }
  return (
    <>
      <Ball p={[0, 0.2, 0]} rad={0.26} c="#3f8f3a" s={[1, 0.8, 1]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Ball key={i} p={[Math.cos(i * 1.3) * 0.2, 0.25 + (i % 2) * 0.07, Math.sin(i * 1.3) * 0.2]} rad={0.05} c="#4f46e5" />
      ))}
    </>
  );
}

/** Item liar hari ini (berganti tiap hari game) yang belum diambil. */
export function Forage() {
  const day = useGame((s) => s.save.inGameDay);
  const taken = useGame((s) => s.save.foraged);
  return (
    <>
      {forageForDay(day)
        .filter((f) => !taken.includes(f.id))
        .map((f) => (
          <group key={f.id} position={[f.pos[0], 0, f.pos[1]]}>
            <WildItem item={f.item} />
            <Sparkles count={6} scale={[0.8, 0.6, 0.8]} position={[0, 0.4, 0]} size={3} speed={0.4} color="#fef08a" />
          </group>
        ))}
    </>
  );
}

function LetterMesh({ letter, index }: { letter: LetterItem; index: number }) {
  const ref = useRef<Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + index * 1.7;
    ref.current.position.y = 0.7 + Math.sin(t * 1.8) * 0.1;
    ref.current.rotation.y = t * 0.7;
  });
  return (
    <group position={[letter.posX, 0, letter.posZ]}>
      <group ref={ref}>
        <mesh castShadow>
          <boxGeometry args={[0.56, 0.38, 0.04]} />
          <meshStandardMaterial color="#fffaf0" emissive="#fde68a" emissiveIntensity={0.45} />
        </mesh>
        {[0.022, -0.022].map((z) => (
          <mesh key={z} position={[0, 0.07, z]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.28, 0.28, 0.004]} />
            <meshStandardMaterial color="#fde8d0" />
          </mesh>
        ))}
        {[0.03, -0.03].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
      <Sparkles count={14} scale={[1.2, 1.2, 1.2]} position={[0, 0.8, 0]} size={5} speed={0.5} color="#f472b6" />
    </group>
  );
}

/** Surat harian yang belum dibaca melayang di titik acaknya di kota. */
export function Letters() {
  const letters = useGame((s) => s.letters);
  return (
    <>
      {letters
        .filter((l) => !l.readAt)
        .map((l, i) => (
          <LetterMesh key={l.id} letter={l} index={i} />
        ))}
    </>
  );
}
