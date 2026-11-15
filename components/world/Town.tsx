"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Hand } from "lucide-react";
import { runtime } from "@/lib/runtime";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import type { Group, Mesh, MeshStandardMaterial, Texture } from "three";
import { AJIS_BENCH, BASE_PLOTS, BENCHES, CROPS, FOUNTAIN, MAP_LIMIT, TREES, plotPos } from "@/lib/data";
import { useGame } from "@/lib/store";
import { Ball, Box, Cyl } from "../scene/parts";
import { Person, type Motion } from "./Person";
import { useTextTexture } from "./props";
import { TexBox, useTiled } from "./textures";

const PATH = "#ead7b0";
const WOOD = "#c99b6d";
const WOOD_DARK = "#a97c50";

/** Status lampu jalan dibagikan lewat ref modul supaya tidak memicu render. */
export const lampState = { on: 0 };

function Ground() {
  const grass = useTiled("grass", 32, 32);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={grass} color="#e8f5dc" roughness={1} />
      </mesh>
      {/* Jalan utama barat–timur, jalan ke toko, taman air mancur, dan jalan ke kebun */}
      <TexBox tex="path" face="top" tile={1.6} p={[0, 0.003, 2]} s={[MAP_LIMIT * 2 + 2, 0.01, 2.6]} />
      <TexBox tex="path" face="top" tile={1.6} p={[0, 0.007, -1]} s={[2.4, 0.01, 6]} />
      <TexBox tex="path" face="top" tile={1.6} p={[0, 0.011, 5.5]} s={[2.2, 0.01, 5]} />
      <Cyl p={[FOUNTAIN[0], 0.015, FOUNTAIN[1]]} rt={3.6} rb={3.6} h={0.01} c="#d8cdbb" seg={48} />
      <TexBox tex="path" face="top" tile={1.6} p={[6, 0.015, -2.4]} s={[10, 0.01, 1.6]} />
      <TexBox tex="path" face="top" tile={1.6} p={[10.8, 0.019, -5]} s={[1.6, 0.01, 6]} />
      {/* Jalan ke peternakan (utara-timur) dan ke lahan kebun barat */}
      <TexBox tex="path" face="top" tile={1.6} p={[13.6, 0.023, -2.4]} s={[5.6, 0.01, 1.6]} />
      <TexBox tex="path" face="top" tile={1.6} p={[16.3, 0.027, -9.4]} s={[1.6, 0.01, 14]} />
      <TexBox tex="path" face="top" tile={1.6} p={[-6, 0.015, -2.4]} s={[10, 0.01, 1.6]} />
      <TexBox tex="path" face="top" tile={1.6} p={[-11, 0.019, -5.2]} s={[1.6, 0.01, 5.6]} />
      <TexBox tex="path" face="top" tile={1.6} p={[-8, 0.007, 13]} s={[10, 0.01, 1.6]} />
      <TexBox tex="path" face="top" tile={1.6} p={[7, 0.007, 13]} s={[10, 0.01, 1.6]} />
    </>
  );
}

type TreeMats = { leaf: Texture; bark: Texture };

/** Tekstur pohon dipakai bersama semua pohon: daun memakai tekstur rumput, batang memakai serat kayu. */
function useTreeMats(): TreeMats {
  return { leaf: useTiled("grass", 2, 2), bark: useTiled("wood_floor", 1, 2) };
}

// Palet daun: [terang, gelap]; sesekali pohon sakura pink.
const LEAF_TINTS: [string, string][] = [
  ["#c7ecb0", "#7fb86a"],
  ["#d5f2b8", "#8cc576"],
  ["#b9e3a2", "#6ea85a"],
  ["#ffd1e3", "#f29bbf"],
];

function Tree({ x, z, i, mats }: { x: number; z: number; i: number; mats: TreeMats }) {
  const s = 0.85 + ((i * 37) % 10) / 25;
  const [light, dark] = LEAF_TINTS[i % 4];
  const blob = (p: [number, number, number], r: number, tint: string) => (
    <mesh position={p} castShadow>
      <sphereGeometry args={[r, 16, 12]} />
      <meshStandardMaterial map={mats.leaf} color={tint} roughness={0.95} />
    </mesh>
  );
  return (
    <group position={[x, 0, z]} scale={s} rotation={[0, i * 1.7, 0]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.27, 1.7, 9]} />
        <meshStandardMaterial map={mats.bark} color="#a0714a" roughness={1} />
      </mesh>
      {/* Akar kecil di pangkal batang */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.12, 9]} />
        <meshStandardMaterial map={mats.bark} color="#8b5e3c" />
      </mesh>
      {/* Lapisan dalam yang lebih gelap memberi kesan rimbun, lapisan luar lebih terang */}
      {blob([0, 2.05, 0], 0.95, dark)}
      {blob([0, 2.35, 0.05], 0.9, light)}
      {blob([0.6, 1.95, 0.25], 0.65, light)}
      {blob([-0.55, 2.0, -0.2], 0.7, light)}
      {blob([0.1, 2.85, -0.1], 0.55, light)}
      {blob([-0.2, 1.8, 0.55], 0.5, dark)}
    </group>
  );
}

function Fountain() {
  const water = useRef<Mesh>(null!);
  useFrame(({ clock }) => {
    water.current.scale.y = 1 + Math.sin(clock.elapsedTime * 4) * 0.12;
  });
  return (
    <group position={[FOUNTAIN[0], 0, FOUNTAIN[1]]}>
      <Cyl p={[0, 0.3, 0]} rt={1.8} rb={1.9} h={0.6} c="#e7e5e4" seg={24} />
      <Cyl p={[0, 0.55, 0]} rt={1.6} rb={1.6} h={0.1} c="#7dd3fc" seg={24} />
      <Cyl p={[0, 1.0, 0]} rt={0.18} rb={0.3} h={1.0} c="#e7e5e4" seg={10} />
      <Cyl p={[0, 1.55, 0]} rt={0.7} rb={0.4} h={0.2} c="#e7e5e4" seg={16} />
      <mesh ref={water} position={[0, 1.95, 0]}>
        <coneGeometry args={[0.35, 0.8, 10]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.75} emissive="#7dd3fc" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function BenchModel() {
  return (
    <>
      <Box p={[0, 0.45, 0]} s={[1.6, 0.08, 0.5]} c={WOOD} />
      <Box p={[0, 0.8, -0.24]} s={[1.6, 0.4, 0.07]} c={WOOD} />
      {[-0.65, 0.65].map((x) => (
        <Box key={x} p={[x, 0.22, 0]} s={[0.08, 0.44, 0.45]} c="#57534e" />
      ))}
    </>
  );
}

function LampPost({ x, z }: { x: number; z: number }) {
  const mat = useRef<MeshStandardMaterial>(null!);
  useFrame(() => {
    mat.current.emissiveIntensity = 0.1 + lampState.on * 1.6;
  });
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, 1.4, 0]} rt={0.06} rb={0.1} h={2.8} c="#44403c" seg={8} />
      <mesh position={[0, 2.95, 0]}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial ref={mat} color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

export const LAMPS: [number, number][] = [
  [-2.2, -0.2], [2.2, -0.2], [-3.4, 9], [3.4, 9], [-12, 1], [12, 1], [9.4, -7.2], [-9, 14.2], [10, 14.2],
];

export function Crop({ seedId, stage, watered }: { seedId: string | null; stage: number; watered: boolean }) {
  const crop = seedId ? CROPS[seedId] : null;
  const ripe = crop && stage >= crop.days;
  return (
    <>
      <Box p={[0, 0.06, 0]} s={[1.5, 0.12, 1.5]} c={watered ? "#6b4a2f" : "#9a6b43"} />
      {[-0.45, 0, 0.45].map((dz) => (
        <Box key={dz} p={[0, 0.125, dz]} s={[1.4, 0.03, 0.12]} c={watered ? "#5b3d26" : "#86593a"} />
      ))}
      {crop &&
        [-0.45, 0, 0.45].flatMap((dx) =>
          [-0.45, 0, 0.45].map((dz) => {
            const key = `${dx}${dz}`;
            const grow = Math.min(1, (stage + 1) / (crop.days + 1));
            if (crop.crop === "wheat") {
              return (
                <group key={key} position={[dx, 0.12, dz]}>
                  <Cyl p={[0, 0.3 * grow, 0]} rt={0.02} rb={0.035} h={0.6 * grow} c={ripe ? "#d9a441" : "#65a30d"} seg={5} />
                  {ripe && <Ball p={[0, 0.62, 0]} rad={0.06} c="#eab308" s={[0.8, 1.8, 0.8]} />}
                </group>
              );
            }
            return (
              <group key={key} position={[dx, 0.12, dz]}>
                <Ball p={[0, 0.1 * grow, 0]} rad={0.08 + 0.1 * grow} c="#4d9c3a" s={[1, 0.7, 1]} />
                {ripe && <Ball p={[0.1, 0.12, 0.08]} rad={0.05} c="#e11d48" />}
                {ripe && <Ball p={[-0.08, 0.14, -0.06]} rad={0.045} c="#e11d48" />}
              </group>
            );
          }),
        )}
    </>
  );
}

function Garden() {
  const plots = useGame((s) => s.save.plots);
  const sign = useTextTexture(["Kebun Windi"], "#fef3c7", "#15803d", 256, 80);
  const posts: [number, number, number, number][] = [
    // [x, z, panjang, rotasi] pagar kayu; celah gerbang di sisi selatan x 10–11.6
    [11.25, -13.8, 6.7, 0],
    [7.9, -10.9, 5.8, Math.PI / 2],
    [14.6, -10.9, 5.8, Math.PI / 2],
    [8.95, -8.0, 2.1, 0],
    [13.1, -8.0, 3.0, 0],
  ];
  return (
    <group>
      {Array.from({ length: BASE_PLOTS }, (_, i) => {
        const [x, z] = plotPos(i);
        const p = plots[i];
        return (
          <group key={i} position={[x, 0, z]}>
            <Crop seedId={p.seedId} stage={p.growthStage} watered={p.watered} />
          </group>
        );
      })}
      {posts.map(([x, z, len, rot]) => {
        const count = Math.max(2, Math.round(len / 1.2) + 1);
        return (
          <group key={`${x},${z}`} position={[x, 0, z]} rotation={[0, rot, 0]}>
            <Box p={[0, 0.45, 0]} s={[len, 0.08, 0.06]} c={WOOD} />
            <Box p={[0, 0.75, 0]} s={[len, 0.08, 0.06]} c={WOOD} />
            {Array.from({ length: count }, (_, k) => (
              <Box key={k} p={[-len / 2 + (k * len) / (count - 1), 0.5, 0]} s={[0.1, 1.0, 0.1]} c={WOOD_DARK} />
            ))}
          </group>
        );
      })}
      <group position={[9.6, 0, -7.7]}>
        <Box p={[0, 0.6, 0]} s={[0.08, 1.2, 0.08]} c={WOOD_DARK} />
        <mesh position={[0, 1.2, 0.05]}>
          <planeGeometry args={[1.1, 0.36]} />
          <meshStandardMaterial map={sign} />
        </mesh>
      </group>
      {/* Orang-orangan sawah dan sumur kecil */}
      <group position={[14, 0, -13.1]}>
        <Box p={[0, 0.8, 0]} s={[0.08, 1.6, 0.08]} c={WOOD_DARK} />
        <Box p={[0, 1.25, 0]} s={[0.9, 0.08, 0.08]} c={WOOD_DARK} />
        <Box p={[0, 1.15, 0]} s={[0.4, 0.45, 0.22]} c="#60a5fa" />
        <Ball p={[0, 1.6, 0]} rad={0.18} c="#fde68a" />
        <Cyl p={[0, 1.8, 0]} rt={0.05} rb={0.3} h={0.15} c="#d9a441" />
      </group>
      <RigidBody type="fixed" colliders={false}>
        {posts.map(([x, z, len, rot]) => (
          <CuboidCollider
            key={`${x},${z}`}
            args={rot ? [0.08, 0.5, len / 2] : [len / 2, 0.5, 0.08]}
            position={[x, 0.5, z]}
          />
        ))}
      </RigidBody>
    </group>
  );
}

/**
 * Toko Ajis: kios serba ada (peralatan, benih, pakan, hewan, lahan, baju). Ajis berdiri di balik konter
 * menghadap barat ke taman; Windi belanja dari depan konter.
 */
function AjisCorner() {
  const motion = useRef<Motion>({ walking: false, sitting: false });
  const marker = useRef<Group>(null!);
  const greeted = useRef(false);
  const [hello, setHello] = useState(false);
  useFrame(({ clock }) => {
    marker.current.position.y = 3.35 + Math.sin(clock.elapsedTime * 2.5) * 0.1;
    marker.current.rotation.y = clock.elapsedTime * 1.2;
    // Seperti warga lain: kalau Windi mendekat, Ajis melambai dan menyapa (sekali tiap didekati).
    const d = Math.hypot(runtime.player.x - AJIS_BENCH.pos[0], runtime.player.z - AJIS_BENCH.pos[1]);
    const near = d < 3.2;
    if (near && !greeted.current) {
      greeted.current = true;
      setHello(true);
      setTimeout(() => setHello(false), 2600);
    }
    if (!near && d > 4) greeted.current = false;
    const g = runtime.greet;
    motion.current.wave = (near && Date.now() % 4000 < 1000) || (!!g && g.id === "ajis" && Date.now() - g.at < 1800);
  });
  const signTex = useTextTexture(["Toko Ajis", "Peralatan & Serba Ada"], "#fff7ed", "#7c2d12", 512, 180);
  const counterTex = useTextTexture(["BUKA"], "#16a34a", "#ffffff", 256, 90);
  const [x, z] = AJIS_BENCH.pos;
  const stripes = ["#86efac", "#ffffff"];
  return (
    <group>
      {/* Lokal +z = arah depan konter (menghadap barat) */}
      <group position={[x + 0.4, 0, z]} rotation={[0, AJIS_BENCH.rot, 0]}>
        {/* Rak belakang berisi barang dagangan */}
        <Box p={[0, 1.1, -0.9]} s={[2.6, 2.2, 0.4]} c={WOOD_DARK} />
        {[0.5, 1.15, 1.8].map((y) => (
          <Box key={y} p={[0, y, -0.7]} s={[2.5, 0.05, 0.35]} c={WOOD} />
        ))}
        {/* Isi rak: kantong benih, karung pakan, pot, penyiram, toples */}
        {[-0.9, -0.45, 0, 0.45, 0.9].map((dx, i) => (
          <Box key={`s${dx}`} p={[dx, 1.35, -0.68]} s={[0.3, 0.38, 0.12]} c={["#fde68a", "#fecaca", "#bbf7d0", "#fbcfe8", "#bfdbfe"][i]} />
        ))}
        {[-0.8, 0, 0.8].map((dx) => (
          <Cyl key={`p${dx}`} p={[dx, 0.68, -0.66]} rt={0.14} rb={0.11} h={0.3} c="#fb923c" />
        ))}
        <Cyl p={[-0.6, 2.0, -0.66]} rt={0.12} rb={0.12} h={0.3} c="#60a5fa" />
        <Cyl p={[0.6, 2.0, -0.66]} rt={0.1} rb={0.1} h={0.28} c="#fef3c7" />
        <Box p={[0.05, 1.98, -0.66]} s={[0.36, 0.26, 0.22]} c="#d6c4a8" />

        {/* Ajis di balik konter */}
        <group position={[0, 0, -0.2]}>
          <Person
            motion={motion}
            look={{ skin: "#e8b48f", top: "#1e3a8a", bottom: "#d6c4a8", hair: "#1c1917", glasses: true, apron: "#15803d", faceKey: "ajis" }}
          />
          {hello && (
            <Html center position={[0, 2.25, 0]} style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
              <div className="pop-in flex items-center gap-1 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-sm font-bold shadow">
                <Hand size={14} className="text-amber-600" /> Halo Windi!
              </div>
            </Html>
          )}
        </group>

        {/* Konter depan */}
        <Box p={[0, 0.55, 0.55]} s={[2.6, 1.1, 0.6]} c={WOOD} />
        <Box p={[0, 1.12, 0.55]} s={[2.7, 0.06, 0.7]} c="#fff7ed" />
        <mesh position={[0, 0.6, 0.86]}>
          <planeGeometry args={[0.7, 0.25]} />
          <meshStandardMaterial map={counterTex} />
        </mesh>
        {/* Barang di atas konter: penyiram, karung benih, timbangan */}
        <Cyl p={[-0.8, 1.27, 0.55]} rt={0.12} rb={0.14} h={0.24} c="#38bdf8" />
        <Box p={[0.75, 1.25, 0.5]} s={[0.3, 0.2, 0.25]} c="#d6c4a8" />
        <Cyl p={[0.2, 1.2, 0.6]} rt={0.16} rb={0.16} h={0.06} c="#a8a29e" />

        {/* Tiang, kanopi bergaris, papan nama */}
        {[-1.25, 1.25].map((dx) => (
          <Box key={`t${dx}`} p={[dx, 1.3, 0.75]} s={[0.1, 2.6, 0.1]} c={WOOD_DARK} />
        ))}
        <group position={[0, 2.62, 0.2]} rotation={[0.35, 0, 0]}>
          {Array.from({ length: 7 }, (_, i) => (
            <Box key={i} p={[-1.35 + i * 0.45, 0, 0]} s={[0.45, 0.06, 1.7]} c={stripes[i % 2]} />
          ))}
        </group>
        <group position={[0, 3.0, -0.75]}>
          <Box p={[0, 0, -0.04]} s={[2.4, 0.75, 0.08]} c={WOOD_DARK} />
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[2.25, 0.65]} />
            <meshStandardMaterial map={signTex} />
          </mesh>
        </group>
      </group>

      {/* Penanda berputar supaya toko gampang ditemukan */}
      <group ref={marker} position={[x - 0.2, 3.35, z]}>
        <mesh>
          <octahedronGeometry args={[0.22]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      </group>

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.0, 1.1, 1.35]} position={[x + 0.52, 1.1, z]} />
      </RigidBody>
    </group>
  );
}

/** Pojok baca: rak buku kecil di taman (vibe taman literasi). */
function ReadingCorner() {
  const tex = useTextTexture(["Pojok Baca"], "#fef3c7", "#7c2d12", 256, 80);
  return (
    <group position={[-13, 0, 17]}>
      <Box p={[0, 0.9, 0]} s={[2.2, 1.8, 0.5]} c={WOOD_DARK} />
      {[0.35, 0.95, 1.5].map((y) =>
        ["#fda4af", "#93c5fd", "#fde68a", "#86efac", "#c4b5fd", "#fdba74"].map((c, i) => (
          <Box key={`${y}${c}`} p={[-0.85 + i * 0.32, y, 0.2]} s={[0.22, 0.42, 0.12]} c={c} />
        )),
      )}
      <Box p={[0, 1.95, 0.1]} s={[2.5, 0.12, 0.8]} c="#e2556b" />
      <mesh position={[0, 2.2, 0.2]}>
        <planeGeometry args={[1.4, 0.44]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
}

function FlowerBeds() {
  const beds: [number, number][] = [[-4, 9], [4, 9], [0, 4.6], [0, 13.4], [-12.5, -2], [12.5, 4]];
  return (
    <>
      {beds.map(([x, z], b) => (
        <group key={b} position={[x, 0, z]}>
          <Cyl p={[0, 0.12, 0]} rt={0.9} rb={0.95} h={0.24} c="#a8a29e" seg={16} />
          <Cyl p={[0, 0.2, 0]} rt={0.8} rb={0.8} h={0.1} c="#6b4a2f" seg={16} />
          {Array.from({ length: 7 }, (_, i) => (
            <Ball
              key={i}
              p={[Math.cos(i * 0.9 + b) * 0.5 * (i % 2 ? 1 : 0.5), 0.35, Math.sin(i * 0.9 + b) * 0.5 * (i % 2 ? 1 : 0.5)]}
              rad={0.12}
              c={["#f472b6", "#facc15", "#fb7185", "#ffffff", "#c084fc"][(i + b) % 5]}
            />
          ))}
        </group>
      ))}
    </>
  );
}

export function Town() {
  const treeMats = useTreeMats();
  return (
    <group>
      <Ground />
      {TREES.map(([x, z], i) => (
        <Tree key={i} x={x} z={z} i={i} mats={treeMats} />
      ))}
      <Fountain />
      <FlowerBeds />
      {BENCHES.map((b, i) => (
        <group key={i} position={[b.pos[0], 0, b.pos[1]]} rotation={[0, b.rot, 0]}>
          <BenchModel />
        </group>
      ))}
      {LAMPS.map(([x, z]) => (
        <LampPost key={`${x},${z}`} x={x} z={z} />
      ))}
      <Garden />
      <AjisCorner />
      <ReadingCorner />

      {/* Pagar semak di tepi peta */}
      {[
        [0, -MAP_LIMIT - 0.6, MAP_LIMIT * 2 + 2.4, 0],
        [0, MAP_LIMIT + 0.6, MAP_LIMIT * 2 + 2.4, 0],
        [-MAP_LIMIT - 0.6, 0, MAP_LIMIT * 2 + 2.4, Math.PI / 2],
        [MAP_LIMIT + 0.6, 0, MAP_LIMIT * 2 + 2.4, Math.PI / 2],
      ].map(([x, z, len, rot]) => (
        <group key={`${x},${z}`} position={[x, 0, z]} rotation={[0, rot, 0]}>
          <Box p={[0, 0.5, 0]} s={[len, 1, 0.9]} c="#4d8f45" />
        </group>
      ))}

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[MAP_LIMIT + 1, 2, 0.5]} position={[0, 1, -MAP_LIMIT - 0.6]} />
        <CuboidCollider args={[MAP_LIMIT + 1, 2, 0.5]} position={[0, 1, MAP_LIMIT + 0.6]} />
        <CuboidCollider args={[0.5, 2, MAP_LIMIT + 1]} position={[-MAP_LIMIT - 0.6, 1, 0]} />
        <CuboidCollider args={[0.5, 2, MAP_LIMIT + 1]} position={[MAP_LIMIT + 0.6, 1, 0]} />
        {TREES.map(([x, z]) => (
          <CylinderCollider key={`${x},${z}`} args={[1, 0.35]} position={[x, 1, z]} />
        ))}
        <CylinderCollider args={[0.5, 1.95]} position={[FOUNTAIN[0], 0.5, FOUNTAIN[1]]} />
        {LAMPS.map(([x, z]) => (
          <CylinderCollider key={`l${x},${z}`} args={[1, 0.12]} position={[x, 1, z]} />
        ))}
        <CuboidCollider args={[1.1, 1, 0.3]} position={[-13, 1, 17]} />
      </RigidBody>
    </group>
  );
}
