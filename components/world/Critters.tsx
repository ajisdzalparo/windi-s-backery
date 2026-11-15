"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { runtime } from "@/lib/runtime";
import { Ball, Box } from "../scene/parts";

const isDay = () => runtime.clock >= 390 && runtime.clock < 1110;

/** Merpati yang mematuk-matuk di dekat Pak Budi, terbang kabur sebentar kalau Windi mendekat. */
function Pigeon({ home, i }: { home: [number, number]; i: number }) {
  const root = useRef<Group>(null!);
  const head = useRef<Group>(null!);
  const st = useRef({ x: home[0], z: home[1], fly: 0 });
  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime + i * 1.3;
    const s = st.current;
    root.current.visible = isDay();
    const dx = s.x - runtime.player.x;
    const dz = s.z - runtime.player.z;
    const d = Math.hypot(dx, dz);
    if (d < 1.4 && s.fly <= 0) s.fly = 1.6;
    if (s.fly > 0) {
      // Terbang menjauh dari Windi lalu turun lagi di dekat rumahnya.
      s.fly -= dt;
      s.x += (dx / (d || 1)) * 2.4 * dt;
      s.z += (dz / (d || 1)) * 2.4 * dt;
      root.current.position.y = Math.sin(((1.6 - s.fly) / 1.6) * Math.PI) * 1.2;
      root.current.rotation.y = Math.atan2(dx, dz);
    } else {
      root.current.position.y = 0;
      s.x += (home[0] - s.x) * dt * 0.3;
      s.z += (home[1] - s.z) * dt * 0.3;
      head.current.rotation.x = Math.max(0, Math.sin(t * 3)) * 0.9; // mematuk
      root.current.rotation.y = Math.sin(t * 0.4 + i) * 2;
    }
    root.current.position.x = s.x;
    root.current.position.z = s.z;
  });
  return (
    <group ref={root}>
      <Ball p={[0, 0.12, 0]} rad={0.1} c="#a8a29e" s={[0.8, 0.75, 1.2]} />
      <Box p={[0, 0.13, -0.13]} s={[0.1, 0.03, 0.1]} c="#78716c" />
      <group ref={head} position={[0, 0.19, 0.08]}>
        <Ball p={[0, 0.03, 0.03]} rad={0.055} c="#6b7280" />
        <Ball p={[0, 0.02, 0.08]} rad={0.015} c="#f59e0b" />
      </group>
    </group>
  );
}

/** Kupu-kupu yang terbang berputar di atas petak bunga. */
function Butterfly({ center, i }: { center: [number, number]; i: number }) {
  const root = useRef<Group>(null!);
  const wl = useRef<Group>(null!);
  const wr = useRef<Group>(null!);
  const color = ["#f9a8d4", "#fde047", "#a5b4fc", "#fdba74"][i % 4];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (0.6 + (i % 3) * 0.15) + i * 2;
    root.current.visible = isDay();
    const x = center[0] + Math.cos(t) * 1.3 + Math.sin(t * 2.3) * 0.3;
    const z = center[1] + Math.sin(t) * 1.1;
    root.current.position.set(x, 0.9 + Math.sin(t * 3.1) * 0.25, z);
    root.current.rotation.y = -t + Math.PI;
    const flap = Math.sin(clock.elapsedTime * 22 + i) * 0.9;
    wl.current.rotation.z = flap;
    wr.current.rotation.z = -flap;
  });
  return (
    <group ref={root} scale={0.9}>
      <Box p={[0, 0, 0]} s={[0.025, 0.025, 0.12]} c="#292524" />
      <group ref={wl}>
        <mesh position={[-0.07, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.07, 8]} />
          <meshStandardMaterial color={color} side={2} />
        </mesh>
      </group>
      <group ref={wr}>
        <mesh position={[0.07, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.07, 8]} />
          <meshStandardMaterial color={color} side={2} />
        </mesh>
      </group>
    </group>
  );
}

const PIGEONS: [number, number][] = [
  [4.7, 11.4], [4.4, 12.4], [5.0, 12.9], [4.2, 11.8], [4.9, 13.4],
];
const FLOWERS: [number, number][] = [[-4, 9], [4, 9], [0, 4.6], [0, 13.4], [-12.5, -2], [12.5, 4], [-7.4, -0.4]];

export function Critters() {
  return (
    <>
      {PIGEONS.map((h, i) => (
        <Pigeon key={i} home={h} i={i} />
      ))}
      {FLOWERS.map((c, i) => (
        <Butterfly key={i} center={c} i={i} />
      ))}
    </>
  );
}
