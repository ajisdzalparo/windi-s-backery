"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import { Egg, Heart, type LucideIcon, Milk, Wheat } from "lucide-react";
import type { Group } from "three";
import {
  BARN_POS,
  BASE_PLOTS,
  CHICKEN_AREA,
  COOP_POS,
  COW_AREA,
  PLOT_COUNT,
  RANCH,
  WEST_FIELD,
  plotPos,
} from "@/lib/data";
import { runtime } from "@/lib/runtime";
import { useGame } from "@/lib/store";
import type { Animal } from "@/lib/types";
import { Ball, Box, Cyl, turnToward } from "../scene/parts";
import { useTextTexture } from "./props";
import { Crop } from "./Town";

const WOOD = "#c99b6d";
const WOOD_DARK = "#a97c50";

type Rect = { minX: number; maxX: number; minZ: number; maxZ: number; gate: [number, number] };

/** Pagar kayu persegi dengan celah gerbang di sisi selatan; gerbang tertutup kalau lahan belum dibeli. */
function Fence({ r, open }: { r: Rect; open: boolean }) {
  const w = r.maxX - r.minX;
  const d = r.maxZ - r.minZ;
  const segs: [number, number, number, number][] = [
    [(r.minX + r.maxX) / 2, r.minZ, w, 0],
    [r.minX, (r.minZ + r.maxZ) / 2, d, Math.PI / 2],
    [r.maxX, (r.minZ + r.maxZ) / 2, d, Math.PI / 2],
    [(r.minX + r.gate[0]) / 2, r.maxZ, r.gate[0] - r.minX, 0],
    [(r.gate[1] + r.maxX) / 2, r.maxZ, r.maxX - r.gate[1], 0],
  ];
  if (!open) segs.push([(r.gate[0] + r.gate[1]) / 2, r.maxZ, r.gate[1] - r.gate[0], 0]);
  return (
    <>
      {segs.map(([x, z, len, rot]) => {
        const count = Math.max(2, Math.round(len / 1.2) + 1);
        return (
          <group key={`${x},${z},${len}`} position={[x, 0, z]} rotation={[0, rot, 0]}>
            <Box p={[0, 0.45, 0]} s={[len, 0.08, 0.06]} c={WOOD} />
            <Box p={[0, 0.75, 0]} s={[len, 0.08, 0.06]} c={WOOD} />
            {Array.from({ length: count }, (_, k) => (
              <Box key={k} p={[-len / 2 + (k * len) / (count - 1), 0.5, 0]} s={[0.1, 1.0, 0.1]} c={WOOD_DARK} />
            ))}
          </group>
        );
      })}
      <RigidBody type="fixed" colliders={false}>
        {segs.map(([x, z, len, rot]) => (
          <CuboidCollider key={`c${x},${z},${len}`} args={rot ? [0.08, 0.6, len / 2] : [len / 2, 0.6, 0.08]} position={[x, 0.6, z]} />
        ))}
      </RigidBody>
    </>
  );
}

function SaleSign({ x, z, price }: { x: number; z: number; price: number }) {
  const tex = useTextTexture(["DIJUAL", `${price} koin`], "#fef3c7", "#b91c1c", 256, 140);
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.6, 0]} s={[0.1, 1.2, 0.1]} c={WOOD_DARK} />
      <mesh position={[0, 1.25, 0.06]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
}

/** Rumput liar tinggi menandai lahan yang belum digarap. */
function WildGrass({ r }: { r: Rect }) {
  const tufts: [number, number][] = [];
  for (let x = r.minX + 0.8; x < r.maxX - 0.4; x += 1.3) for (let z = r.minZ + 0.8; z < r.maxZ - 0.4; z += 1.3) tufts.push([x + ((x * 7) % 0.5), z + ((z * 3) % 0.5)]);
  return (
    <>
      {tufts.map(([x, z], i) => (
        <Cyl key={i} p={[x, 0.2, z]} rt={0.02} rb={0.22} h={0.4 + (i % 3) * 0.1} c={i % 2 ? "#6ea85a" : "#7fb86a"} seg={5} />
      ))}
    </>
  );
}

/** Lahan kebun barat: 6 petak tambahan setelah dibeli. */
function WestField() {
  const owned = useGame((s) => s.save.upgrades.includes("land_farm2"));
  const plots = useGame((s) => s.save.plots);
  const r = WEST_FIELD;
  return (
    <group>
      <Fence r={r} open={owned} />
      {owned ? (
        Array.from({ length: PLOT_COUNT - BASE_PLOTS }, (_, k) => {
          const i = BASE_PLOTS + k;
          const [x, z] = plotPos(i);
          const p = plots[i];
          return (
            <group key={i} position={[x, 0, z]}>
              <Crop seedId={p.seedId} stage={p.growthStage} watered={p.watered} />
            </group>
          );
        })
      ) : (
        <>
          <WildGrass r={r} />
          <SaleSign x={(r.gate[0] + r.gate[1]) / 2 - 1.4} z={r.maxZ + 0.6} price={400} />
        </>
      )}
    </group>
  );
}

function Coop() {
  return (
    <group position={[COOP_POS[0], 0, COOP_POS[1]]}>
      <Box p={[0, 0.25, 0]} s={[2.4, 0.5, 1.8]} c="#a97c50" />
      <Box p={[0, 0.95, 0]} s={[2.2, 0.9, 1.6]} c="#fde68a" />
      <Box p={[0, 1.55, 0.45]} s={[2.6, 0.12, 1.2]} c="#e2556b" r={[0.45, 0, 0]} />
      <Box p={[0, 1.55, -0.45]} s={[2.6, 0.12, 1.2]} c="#e2556b" r={[-0.45, 0, 0]} />
      <Box p={[0, 0.7, 0.81]} s={[0.5, 0.6, 0.04]} c="#78350f" />
      <Box p={[0.3, 0.3, 1.2]} s={[0.25, 0.04, 0.9]} c={WOOD} r={[0.4, 0, 0]} />
    </group>
  );
}

function Barn() {
  return (
    <group position={[BARN_POS[0], 0, BARN_POS[1]]}>
      <Box p={[0, 1.1, 0]} s={[3.2, 2.2, 2.4]} c="#dc2626" />
      <Box p={[0, 2.5, 0.65]} s={[3.5, 0.15, 1.6]} c="#78350f" r={[0.6, 0, 0]} />
      <Box p={[0, 2.5, -0.65]} s={[3.5, 0.15, 1.6]} c="#78350f" r={[-0.6, 0, 0]} />
      <Box p={[0, 0.85, 1.21]} s={[1.4, 1.7, 0.04]} c="#fef3c7" />
      <Box p={[0, 0.85, 1.24]} s={[1.3, 0.08, 0.02]} c="#dc2626" r={[0, 0, 0.9]} />
      <Box p={[0, 0.85, 1.24]} s={[1.3, 0.08, 0.02]} c="#dc2626" r={[0, 0, -0.9]} />
    </group>
  );
}

function Trough({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.25, 0]} s={[1.4, 0.4, 0.5]} c={WOOD_DARK} />
      <Box p={[0, 0.44, 0]} s={[1.25, 0.04, 0.38]} c="#d9a441" />
    </group>
  );
}

function ChickenModel() {
  return (
    <>
      <Ball p={[0, 0.25, 0]} rad={0.2} c="#ffffff" s={[0.9, 0.85, 1.15]} />
      <Ball p={[0, 0.44, 0.15]} rad={0.12} c="#ffffff" />
      <Box p={[0, 0.58, 0.15]} s={[0.04, 0.08, 0.1]} c="#ef4444" />
      <Cyl p={[0, 0.44, 0.29]} rt={0} rb={0.04} h={0.08} c="#f59e0b" seg={4} r={[Math.PI / 2, 0, 0]} />
      <Ball p={[-0.07, 0.47, 0.24]} rad={0.018} c="#1c1917" />
      <Ball p={[0.07, 0.47, 0.24]} rad={0.018} c="#1c1917" />
      <Box p={[0, 0.3, -0.24]} s={[0.12, 0.18, 0.06]} c="#f5f5f4" r={[-0.5, 0, 0]} />
      {[-0.07, 0.07].map((x) => (
        <Box key={x} p={[x, 0.05, 0]} s={[0.03, 0.1, 0.03]} c="#f59e0b" />
      ))}
    </>
  );
}

function CowModel() {
  return (
    <>
      <Box p={[0, 0.75, 0]} s={[0.7, 0.6, 1.2]} c="#fafaf9" />
      <Box p={[0.2, 0.85, 0.2]} s={[0.32, 0.35, 0.4]} c="#292524" />
      <Box p={[-0.2, 0.7, -0.3]} s={[0.32, 0.3, 0.35]} c="#292524" />
      <Box p={[0, 0.95, 0.75]} s={[0.45, 0.42, 0.42]} c="#fafaf9" />
      <Box p={[0, 0.85, 0.98]} s={[0.36, 0.2, 0.08]} c="#fbcfe8" />
      <Ball p={[-0.13, 1.03, 0.97]} rad={0.035} c="#1c1917" />
      <Ball p={[0.13, 1.03, 0.97]} rad={0.035} c="#1c1917" />
      <Cyl p={[-0.2, 1.22, 0.72]} rt={0.02} rb={0.04} h={0.14} c="#fef3c7" seg={6} />
      <Cyl p={[0.2, 1.22, 0.72]} rt={0.02} rb={0.04} h={0.14} c="#fef3c7" seg={6} />
      <Ball p={[0, 0.42, -0.1]} rad={0.1} c="#fbcfe8" />
      {[
        [-0.24, 0.42],
        [0.24, 0.42],
        [-0.24, -0.42],
        [0.24, -0.42],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x, 0.22, z]} s={[0.14, 0.45, 0.14]} c="#fafaf9" />
      ))}
    </>
  );
}

/** Hewan ternak: jalan-jalan pelan di areanya; tanda di atas kepala menunjukkan butuh apa. */
function AnimalActor({ a, index }: { a: Animal; index: number }) {
  const root = useRef<Group>(null!);
  const area = a.kind === "cow" ? COW_AREA : CHICKEN_AREA;
  const brain = useRef({ target: null as [number, number] | null, rest: 1 + index });
  const start: [number, number] = [area.center[0] + ((index * 0.9) % 2) - 1, area.center[1] + ((index * 1.3) % 2) - 1];
  const speed = a.kind === "cow" ? 0.45 : 0.8;

  useEffect(() => () => void runtime.animals.delete(a.id), [a.id]);

  useFrame(({ clock }, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = clock.elapsedTime;
    const b = brain.current;
    const pos = root.current.position;
    if (!b.target && t > b.rest) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * area.radius;
      b.target = [area.center[0] + Math.cos(ang) * rad, area.center[1] + Math.sin(ang) * rad];
    }
    if (b.target) {
      const dx = b.target[0] - pos.x;
      const dz = b.target[1] - pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.05) {
        b.target = null;
        b.rest = t + 2 + Math.random() * 4;
      } else {
        const step = Math.min(d, speed * dt);
        pos.x += (dx / d) * step;
        pos.z += (dz / d) * step;
        root.current.rotation.y = turnToward(root.current.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-6 * dt));
      }
    }
    // Ayam mematuk-matuk saat diam
    root.current.rotation.x = a.kind === "chicken" && !b.target ? Math.max(0, Math.sin(t * 4 + index)) * 0.3 : 0;
    runtime.animals.set(a.id, { x: pos.x, z: pos.z });
  });

  const need: NeedKind | null = a.product ? (a.kind === "cow" ? "milk" : "egg") : !a.fed ? "feed" : !a.petted ? "love" : null;
  return (
    <group ref={root} position={[start[0], 0, start[1]]}>
      {a.kind === "cow" ? <CowModel /> : <ChickenModel />}
      {need && <NeedBubble text={need} y={a.kind === "cow" ? 1.7 : 0.95} />}
    </group>
  );
}

type NeedKind = "egg" | "milk" | "feed" | "love";
const NEED_ICONS: Record<NeedKind, { Icon: LucideIcon; color: string }> = {
  egg: { Icon: Egg, color: "#a16207" },
  milk: { Icon: Milk, color: "#0369a1" },
  feed: { Icon: Wheat, color: "#4d7c0f" },
  love: { Icon: Heart, color: "#e11d48" },
};

/** Gelembung kecil di atas hewan: butuh makan, minta dielus, atau hasil siap diambil. */
function NeedBubble({ text, y }: { text: NeedKind; y: number }) {
  const ref = useRef<Group>(null!);
  useFrame(({ clock }) => {
    ref.current.position.y = y + Math.sin(clock.elapsedTime * 2.5) * 0.06;
  });
  const { Icon, color } = NEED_ICONS[text];
  return (
    <group ref={ref}>
      <Html center style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/95 shadow-md">
          <Icon size={18} color={color} strokeWidth={2.4} />
        </div>
      </Html>
    </group>
  );
}

/** Lahan peternakan: pagar, kandang ayam & sapi (kalau sudah dibeli), tempat makan, dan hewan-hewannya. */
function Ranch() {
  const owned = useGame((s) => s.save.upgrades.includes("land_ranch"));
  const coop = useGame((s) => s.save.upgrades.includes("coop"));
  const barn = useGame((s) => s.save.upgrades.includes("barn"));
  const animals = useGame((s) => s.save.animals);
  const r = RANCH;
  return (
    <group>
      <Fence r={r} open={owned} />
      {!owned && (
        <>
          <WildGrass r={r} />
          <SaleSign x={(r.gate[0] + r.gate[1]) / 2 - 1.5} z={r.maxZ + 0.6} price={600} />
        </>
      )}
      {owned && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(r.minX + r.maxX) / 2, 0.004, (r.minZ + r.maxZ) / 2]} receiveShadow>
            <planeGeometry args={[r.maxX - r.minX, r.maxZ - r.minZ]} />
            <meshStandardMaterial color="#b5e08f" />
          </mesh>
          {coop && <Coop />}
          {barn && <Barn />}
          {coop && <Trough x={CHICKEN_AREA.center[0]} z={CHICKEN_AREA.center[1] + 2.3} />}
          {barn && <Trough x={COW_AREA.center[0]} z={COW_AREA.center[1] + 2.4} />}
          {animals.map((a, i) => (
            <AnimalActor key={a.id} a={a} index={i} />
          ))}
          <RigidBody type="fixed" colliders={false}>
            {coop && <CuboidCollider args={[1.2, 1, 0.9]} position={[COOP_POS[0], 1, COOP_POS[1]]} />}
            {barn && <CuboidCollider args={[1.6, 1.2, 1.2]} position={[BARN_POS[0], 1.2, BARN_POS[1]]} />}
          </RigidBody>
        </>
      )}
    </group>
  );
}

// ---------- Peliharaan yang mengikuti Windi ----------

function BunnyModel() {
  return (
    <>
      <Ball p={[0, 0.2, 0]} rad={0.18} c="#ffffff" s={[0.9, 0.85, 1.1]} />
      <Ball p={[0, 0.38, 0.14]} rad={0.13} c="#ffffff" />
      <Box p={[-0.06, 0.58, 0.12]} s={[0.05, 0.22, 0.04]} c="#ffffff" />
      <Box p={[0.06, 0.58, 0.12]} s={[0.05, 0.22, 0.04]} c="#ffffff" />
      <Box p={[-0.06, 0.58, 0.14]} s={[0.025, 0.16, 0.01]} c="#fbcfe8" />
      <Box p={[0.06, 0.58, 0.14]} s={[0.025, 0.16, 0.01]} c="#fbcfe8" />
      <Ball p={[-0.05, 0.41, 0.26]} rad={0.018} c="#1c1917" />
      <Ball p={[0.05, 0.41, 0.26]} rad={0.018} c="#1c1917" />
      <Ball p={[0, 0.37, 0.27]} rad={0.015} c="#f472b6" />
      <Ball p={[0, 0.22, -0.2]} rad={0.06} c="#ffffff" />
    </>
  );
}

function DogModel() {
  const fur = "#d97706";
  return (
    <>
      <Box p={[0, 0.3, 0]} s={[0.3, 0.26, 0.55]} c={fur} />
      <Box p={[0, 0.25, 0.05]} s={[0.24, 0.12, 0.4]} c="#fef3c7" />
      <Box p={[0, 0.5, 0.3]} s={[0.32, 0.28, 0.28]} c={fur} />
      <Box p={[0, 0.43, 0.45]} s={[0.18, 0.12, 0.1]} c="#fef3c7" />
      <Ball p={[0, 0.46, 0.5]} rad={0.025} c="#1c1917" />
      <Cyl p={[-0.1, 0.69, 0.28]} rt={0} rb={0.06} h={0.12} c={fur} seg={4} />
      <Cyl p={[0.1, 0.69, 0.28]} rt={0} rb={0.06} h={0.12} c={fur} seg={4} />
      <Ball p={[-0.08, 0.54, 0.44]} rad={0.025} c="#1c1917" />
      <Ball p={[0.08, 0.54, 0.44]} rad={0.025} c="#1c1917" />
      <Ball p={[0, 0.45, -0.3]} rad={0.08} c={fur} />
      {[
        [-0.1, 0.18],
        [0.1, 0.18],
        [-0.1, -0.18],
        [0.1, -0.18],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x, 0.1, z]} s={[0.08, 0.2, 0.08]} c="#fef3c7" />
      ))}
    </>
  );
}

function CatModel() {
  const fur = "#fdba74";
  return (
    <>
      <Box p={[0, 0.27, 0]} s={[0.26, 0.22, 0.5]} c={fur} />
      <Box p={[0, 0.45, 0.28]} s={[0.3, 0.25, 0.25]} c={fur} />
      <Cyl p={[-0.09, 0.62, 0.27]} rt={0} rb={0.06} h={0.11} c={fur} seg={4} />
      <Cyl p={[0.09, 0.62, 0.27]} rt={0} rb={0.06} h={0.11} c={fur} seg={4} />
      <Ball p={[-0.07, 0.48, 0.41]} rad={0.024} c="#1c1917" />
      <Ball p={[0.07, 0.48, 0.41]} rad={0.024} c="#1c1917" />
      <Ball p={[0, 0.43, 0.42]} rad={0.017} c="#fb7185" />
      <Box p={[0, 0.42, -0.3]} s={[0.06, 0.32, 0.06]} c={fur} r={[-0.4, 0, 0]} />
      {[
        [-0.08, 0.16],
        [0.08, 0.16],
        [-0.08, -0.16],
        [0.08, -0.16],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x, 0.08, z]} s={[0.07, 0.16, 0.07]} c="#fff7ed" />
      ))}
    </>
  );
}

function PetCompanion() {
  const kind = useGame((s) => s.save.activePet);
  const root = useRef<Group>(null!);
  const hop = useRef(0);

  useEffect(() => {
    if (!kind) runtime.pet = null;
  }, [kind]);

  useFrame(({ clock }, raw) => {
    if (!kind) return;
    const dt = Math.min(raw, 0.05);
    const pos = root.current.position;
    // Ikut di belakang-samping Windi; berhenti kalau sudah dekat.
    const tx = runtime.player.x - Math.sin(runtime.player.rot) * 1.0 + Math.cos(runtime.player.rot) * 0.6;
    const tz = runtime.player.z - Math.cos(runtime.player.rot) * 1.0 - Math.sin(runtime.player.rot) * 0.6;
    const dx = tx - pos.x;
    const dz = tz - pos.z;
    const d = Math.hypot(dx, dz);
    if (d > 8) {
      pos.set(tx, 0, tz); // tertinggal jauh → langsung menyusul
    } else if (d > 0.25) {
      const step = Math.min(d, Math.max(2, d * 2.2) * dt);
      pos.x += (dx / d) * step;
      pos.z += (dz / d) * step;
      root.current.rotation.y = turnToward(root.current.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-8 * dt));
      hop.current += dt * (kind === "bunny" ? 12 : 16);
    }
    const moving = d > 0.25;
    root.current.position.y = moving ? Math.abs(Math.sin(hop.current)) * (kind === "bunny" ? 0.18 : 0.05) : 0;
    if (!moving) root.current.rotation.y = turnToward(root.current.rotation.y, runtime.player.rot, 1 - Math.exp(-2 * dt));
    runtime.pet = { x: pos.x, z: pos.z };
    void clock;
  });

  if (!kind) return null;
  return (
    <group ref={root} position={[runtime.player.x - 1, 0, runtime.player.z]}>
      {kind === "bunny" ? <BunnyModel /> : kind === "dog" ? <DogModel /> : <CatModel />}
    </group>
  );
}

export function Farmland() {
  return (
    <>
      <WestField />
      <Ranch />
      <PetCompanion />
    </>
  );
}
