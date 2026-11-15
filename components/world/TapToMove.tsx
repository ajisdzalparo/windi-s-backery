"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, MeshBasicMaterial } from "three";
import { MAP_LIMIT } from "@/lib/data";
import { runtime } from "@/lib/runtime";
import { useGame } from "@/lib/store";

const clamp = (v: number) => Math.max(-MAP_LIMIT + 0.5, Math.min(MAP_LIMIT - 0.5, v));

/** Ketuk / klik di mana saja di dunia → Windi berjalan ke titik itu (pengganti joystick). */
export function TapToMove({ children }: { children: React.ReactNode }) {
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 10) return; // itu geseran, bukan ketukan
    const s = useGame.getState();
    if (s.menu || s.panel || s.photo || s.openLetterId) return;
    e.stopPropagation();
    runtime.moveTarget = { x: clamp(e.point.x), z: clamp(e.point.z), at: Date.now() };
  };
  return <group onClick={onClick}>{children}</group>;
}

/** Penanda tujuan: lingkaran yang mengecil di titik yang diketuk. */
export function TapMarker() {
  const ref = useRef<Group>(null!);
  const ring = useRef<MeshBasicMaterial>(null!);
  const dot = useRef<MeshBasicMaterial>(null!);
  useFrame(() => {
    const t = runtime.moveTarget;
    ref.current.visible = !!t;
    if (!t) return;
    const age = (Date.now() - t.at) / 1000;
    const pulse = 1 + Math.max(0, 0.6 - age) * 1.2 + Math.sin(age * 6) * 0.05;
    ref.current.position.set(t.x, 0.04, t.z);
    ref.current.scale.setScalar(pulse);
    ring.current.opacity = 0.85;
    dot.current.opacity = 0.6;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.42, 32]} />
        <meshBasicMaterial ref={ring} color="#fff3dc" transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.1, 20]} />
        <meshBasicMaterial ref={dot} color="#f29bb0" transparent />
      </mesh>
    </group>
  );
}
