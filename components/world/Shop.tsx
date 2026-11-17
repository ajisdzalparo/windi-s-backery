"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import type { Group, MeshStandardMaterial } from "three";
import { SHOP, SPOTS } from "@/lib/data";
import { runtime } from "@/lib/runtime";
import { useGame } from "@/lib/store";
import { GlbModel } from "../scene/GlbModel";
import { Ball, Box, Cyl } from "../scene/parts";
import { Gable, ProductMesh, useTextTexture } from "./props";
import { TexBox } from "./textures";

const H = 3.2;
const T = 0.3;
const WALL = "#fff3e0";
const TRIM = "#f9a8d4";
const WOOD = "#c99b6d";
const WOOD_DARK = "#a97c50";
const ROOF = "#e2556b";
const BED_SIZE: [number, number] = [1.7, 2.5];

const isInside = () =>
  runtime.player.x > SHOP.minX && runtime.player.x < SHOP.maxX && runtime.player.z > SHOP.minZ && runtime.player.z < SHOP.maxZ;

function Sign() {
  const tex = useTextTexture(["Windi's Sweet Bakery"], "#fff7ed", "#be185d", 1024, 200);
  return (
    <group position={[0, 3.95, -3.45]}>
      <Box p={[0, 0, -0.05]} s={[4.9, 1.0, 0.1]} c={WOOD_DARK} />
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4.7, 0.9]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
    </group>
  );
}

function OpenSign() {
  const open = useGame((s) => s.save.shopOpen);
  const openTex = useTextTexture(["BUKA"], "#16a34a", "#ffffff", 256, 110);
  const closedTex = useTextTexture(["TUTUP"], "#dc2626", "#ffffff", 256, 110);
  return (
    <mesh position={[2.2, 1.6, -3.83]}>
      <planeGeometry args={[0.8, 0.34]} />
      <meshStandardMaterial map={open ? openTex : closedTex} emissive="#ffffff" emissiveIntensity={0.15} />
    </mesh>
  );
}

function Window({ x }: { x: number }) {
  return (
    <group position={[x, 1.7, -3.82]}>
      <Box p={[0, 0, 0]} s={[1.5, 1.3, 0.08]} c="#ffffff" />
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.3, 1.1]} />
        <meshStandardMaterial color="#fde9b8" emissive="#ffd28a" emissiveIntensity={0.5} />
      </mesh>
      <Box p={[0, 0, 0.06]} s={[0.05, 1.1, 0.03]} c="#ffffff" />
      <Box p={[-0.95, 0, 0.02]} s={[0.36, 1.3, 0.06]} c={TRIM} />
      <Box p={[0.95, 0, 0.02]} s={[0.36, 1.3, 0.06]} c={TRIM} />
      <Box p={[0, -0.72, 0.12]} s={[1.6, 0.12, 0.26]} c={WOOD} />
      {[-0.45, 0, 0.45].map((fx) => (
        <Ball key={fx} p={[fx, -0.6, 0.12]} rad={0.1} c={fx === 0 ? "#fb7185" : "#fde047"} />
      ))}
    </group>
  );
}

function Awning() {
  return (
    <group position={[0, 2.65, -3.45]} rotation={[0.45, 0, 0]}>
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} p={[-1.4 + i * 0.4, 0, 0]} s={[0.4, 0.06, 0.9]} c={i % 2 ? "#ffffff" : "#f472b6"} />
      ))}
    </group>
  );
}

/** Etalase: kue yang dipajang tampil di dalam kaca. */
function DisplayCase() {
  const items = useGame((s) => s.save.caseItems);
  const slots = useGame((s) => s.save.caseSlots);
  return (
    <group position={[0, 0, -8.2]}>
      <Box p={[0, 0.5, 0]} s={[4.2, 1.0, 0.8]} c="#fce7f3" />
      <Box p={[0, 0.5, 0.41]} s={[4.0, 0.8, 0.02]} c={TRIM} />
      <Box p={[0, 1.02, 0]} s={[4.2, 0.04, 0.8]} c="#ffffff" />
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[4.1, 0.52, 0.72]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.22} roughness={0.05} />
      </mesh>
      <Box p={[0, 1.57, 0]} s={[4.2, 0.04, 0.8]} c="#ffffff" />
      {Array.from({ length: slots }, (_, i) => {
        const x = -((slots - 1) * 0.66) / 2 + i * 0.66;
        return (
          <group key={i} position={[x, 1.05, 0]}>
            <Cyl p={[0, 0.01, 0]} rt={0.2} rb={0.2} h={0.02} c="#ffffff" seg={16} />
            {items[i] && (
              <group position={[0, 0.02, 0]}>
                <ProductMesh itemId={items[i]} />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Oven() {
  const baking = useGame((s) => s.bake !== null);
  const glass = useRef<MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    glass.current.emissiveIntensity = baking ? 1.2 + Math.sin(clock.elapsedTime * 6) * 0.3 : 0.05;
  });
  return (
    <group position={[SPOTS.oven[0], 0, SPOTS.oven[1]]}>
      <Box p={[0, 0.8, 0]} s={[1.4, 1.6, 0.9]} c="#d6876b" />
      <Box p={[0, 1.62, 0]} s={[1.5, 0.08, 1.0]} c="#78716c" />
      <mesh position={[0, 0.75, 0.46]}>
        <planeGeometry args={[0.9, 0.6]} />
        <meshStandardMaterial ref={glass} color="#292524" emissive="#fb923c" emissiveIntensity={0.05} />
      </mesh>
      <Box p={[0, 1.15, 0.47]} s={[0.8, 0.05, 0.05]} c="#e7e5e4" />
      <Cyl p={[0.45, 2.4, -0.2]} rt={0.12} rb={0.12} h={1.5} c="#78716c" seg={8} />
      {baking && <pointLight position={[0, 0.8, 0.8]} color="#fb923c" intensity={4} distance={3} />}
    </group>
  );
}

function Fridge() {
  return (
    <group position={[SPOTS.fridge[0], 0, SPOTS.fridge[1]]}>
      {/* Kaki kulkas */}
      {[-0.36, 0.36].flatMap((x) =>
        [-0.3, 0.3].map((z) => <Cyl key={`${x}${z}`} p={[x, 0.05, z]} rt={0.05} rb={0.04} h={0.1} c="#57534e" seg={8} />),
      )}
      {/* Bodi utama pastel mint (sesuai ikon katalog) */}
      <Box p={[0, 1.02, 0]} s={[0.96, 1.9, 0.82]} c="#a7f3d0" />
      <Box p={[0, 1.98, 0]} s={[0.92, 0.04, 0.78]} c="#d1fae5" />
      {/* Pintu freezer atas */}
      <Box p={[0, 1.56, 0.42]} s={[0.9, 0.68, 0.05]} c="#bbf7d0" />
      {/* Celah pemisah pintu */}
      <Box p={[0, 1.19, 0.425]} s={[0.91, 0.025, 0.05]} c="#065f46" />
      {/* Pintu bawah */}
      <Box p={[0, 0.63, 0.42]} s={[0.9, 1.08, 0.05]} c="#bbf7d0" />
      {/* Gagang pintu silver */}
      <Box p={[-0.26, 1.34, 0.465]} s={[0.24, 0.045, 0.05]} c="#f5f5f4" />
      <Box p={[-0.26, 1.02, 0.465]} s={[0.24, 0.045, 0.05]} c="#f5f5f4" />
      {/* Magnet hiasan kecil di pintu kulkas */}
      <Ball p={[0.22, 1.62, 0.45]} rad={0.045} c="#fb7185" />
      <Ball p={[0.14, 1.5, 0.45]} rad={0.04} c="#facc15" />
    </group>
  );
}

function Kitchen() {
  const hasFridge = useGame((s) => s.save.upgrades.includes("fridge"));
  return (
    <>
      {hasFridge && <Fridge />}
      <Oven />
      {/* Meja kerja: tepung, adonan, rolling pin */}
      <group position={[2.1, 0, -13.35]}>
        <Box p={[0, 0.45, 0]} s={[1.8, 0.9, 0.8]} c={WOOD} />
        <Box p={[0, 0.92, 0]} s={[1.85, 0.05, 0.85]} c="#f5f5f4" />
        <Cyl p={[-0.5, 1.1, 0]} rt={0.18} rb={0.22} h={0.32} c="#fef3c7" />
        <Ball p={[0.25, 1.0, 0.05]} rad={0.16} c="#fde68a" s={[1.3, 0.5, 1]} />
        <Cyl p={[0.55, 1.0, 0.15]} rt={0.03} rb={0.03} h={0.5} c={WOOD_DARK} r={[0, 0, Math.PI / 2]} />
      </group>
      {/* Rak dinding berisi toples */}
      <group position={[3, 2.2, -13.78]}>
        <Box p={[0, 0, 0]} s={[2.6, 0.06, 0.32]} c={WOOD_DARK} />
        {["#fecaca", "#bbf7d0", "#fde68a", "#c7d2fe", "#fbcfe8"].map((c, i) => (
          <Cyl key={c} p={[-1 + i * 0.5, 0.17, 0]} rt={0.1} rb={0.1} h={0.28} c={c} />
        ))}
      </group>
    </>
  );
}

function Bedroom() {
  return (
    <>
      <group position={[SPOTS.bed[0], 0, SPOTS.bed[1]]}>
        <Suspense fallback={<Box p={[0, 0.3, 0]} s={[1.7, 0.6, 2.5]} c="#fda4af" />}>
          <GlbModel url="/models/bed.glb" size={BED_SIZE} />
        </Suspense>
      </group>
      <Cyl p={[-4.4, 0.04, -11.4]} rt={1.5} rb={1.5} h={0.02} c="#fbcfe8" seg={28} />
      <group position={[-2.9, 0, -13.35]}>
        <Box p={[0, 0.3, 0]} s={[0.6, 0.6, 0.5]} c={WOOD} />
        <Cyl p={[0, 0.75, 0]} rt={0.06} rb={0.1} h={0.3} c="#fef3c7" />
        <Ball p={[0, 0.98, 0]} rad={0.16} c="#fef9c3" />
      </group>
      {/* Pigura dan jam dinding */}
      <Box p={[-4.4, 2.2, -13.82]} s={[1.0, 0.75, 0.05]} c={WOOD} />
      <Box p={[-4.4, 2.2, -13.79]} s={[0.85, 0.6, 0.02]} c="#bae6fd" />
      <Cyl p={[-1.6, 2.4, -13.82]} rt={0.3} rb={0.3} h={0.05} c="#ffffff" r={[Math.PI / 2, 0, 0]} seg={20} />
    </>
  );
}

function CafeTable({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, 0.38, 0]} rt={0.05} rb={0.18} h={0.76} c={WOOD_DARK} />
      <Cyl p={[0, 0.78, 0]} rt={0.5} rb={0.5} h={0.05} c="#ffffff" seg={18} />
      <Cyl p={[0, 0.86, 0]} rt={0.08} rb={0.06} h={0.12} c="#fb7185" />
      {[-0.75, 0.75].map((dx) => (
        <group key={dx} position={[dx, 0, 0]}>
          <Cyl p={[0, 0.25, 0]} rt={0.04} rb={0.12} h={0.5} c={WOOD_DARK} />
          <Cyl p={[0, 0.52, 0]} rt={0.22} rb={0.22} h={0.06} c={TRIM} seg={14} />
        </group>
      ))}
    </group>
  );
}

function Radio() {
  const playing = useGame((s) => s.music.on);
  const notes = useRef<Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    notes.current.visible = playing;
    notes.current.position.y = 1.2 + ((t * 0.35) % 0.5);
    notes.current.rotation.y = t * 1.5;
  });
  return (
    <group position={[SPOTS.radio[0], 0, SPOTS.radio[1]]} rotation={[0, Math.PI / 2, 0]}>
      <Cyl p={[0, 0.5, 0]} rt={0.4} rb={0.4} h={0.06} c={WOOD} seg={20} />
      <Cyl p={[0, 0.24, 0]} rt={0.05} rb={0.16} h={0.48} c={WOOD_DARK} />
      <Box p={[0, 0.72, 0]} s={[0.6, 0.36, 0.22]} c="#fb923c" />
      <Box p={[0, 0.72, 0.112]} s={[0.54, 0.3, 0.005]} c="#fed7aa" />
      <Cyl p={[-0.14, 0.72, 0.118]} rt={0.1} rb={0.1} h={0.01} c="#57534e" seg={16} r={[Math.PI / 2, 0, 0]} />
      <group ref={notes} visible={false}>
        <Ball p={[0.12, 0, 0]} rad={0.045} c="#f472b6" />
        <Ball p={[-0.12, 0.1, 0]} rad={0.035} c="#60a5fa" />
      </group>
    </group>
  );
}

function Decorations() {
  const decor = useGame((s) => s.save.decorations);
  const menuTex = useTextTexture(["MENU", "Roti • Kue • Teh"], "#1f2937", "#fef3c7", 256, 200);
  return (
    <>
      {decor.includes("flowers") &&
        [-2.2, 2.9].map((x) => (
          <group key={x} position={[x, 0, -3.35]}>
            <Cyl p={[0, 0.25, 0]} rt={0.3} rb={0.22} h={0.5} c="#fb923c" seg={12} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Ball key={i} p={[Math.cos(i * 1.26) * 0.15, 0.62, Math.sin(i * 1.26) * 0.15]} rad={0.1} c={i % 2 ? "#f472b6" : "#facc15"} />
            ))}
          </group>
        ))}
      {decor.includes("lanterns") &&
        [-4, -2, 2, 4].map((x, i) => (
          <group key={x} position={[x, 2.55, -6]}>
            <Cyl p={[0, 0.3, 0]} rt={0.01} rb={0.01} h={0.6} c="#57534e" seg={4} />
            <mesh>
              <sphereGeometry args={[0.18, 12, 10]} />
              <meshStandardMaterial color={i % 2 ? "#fca5a5" : "#fde68a"} emissive={i % 2 ? "#f87171" : "#facc15"} emissiveIntensity={0.9} />
            </mesh>
          </group>
        ))}
      {decor.includes("rug") && <Cyl p={[0, 0.07, -5.9]} rt={1.4} rb={1.4} h={0.02} c="#fde68a" seg={30} />}
      {decor.includes("menu_board") && (
        <group position={[-2.9, 0, -2.6]} rotation={[0, 0.25, 0]}>
          <Box p={[0, 0.6, -0.08]} s={[0.75, 1.15, 0.06]} c={WOOD_DARK} r={[-0.12, 0, 0]} />
          <mesh position={[0, 0.63, -0.04]} rotation={[-0.12, 0, 0]}>
            <planeGeometry args={[0.62, 0.95]} />
            <meshStandardMaterial map={menuTex} />
          </mesh>
        </group>
      )}
    </>
  );
}

export function Shop() {
  const outside = useRef<Group>(null!);
  const hasFridge = useGame((s) => s.save.upgrades.includes("fridge"));
  useFrame(() => {
    // Saat Windi di dalam toko, atap dan dinding depan disembunyikan supaya isi toko terlihat.
    outside.current.visible = !isInside();
  });

  const frontW = SHOP.maxX - SHOP.doorHalf; // lebar tiap sisi dinding depan dari pintu
  return (
    <group>
      {/* Lantai dan dinding yang selalu terlihat */}
      <TexBox p={[0, 0.03, -9]} s={[12, 0.06, 10]} tex="wood_floor" face="top" tile={2.4} />
      <TexBox p={[0, H / 2, SHOP.minZ]} s={[12 + T, H, T]} tex="wall" face="front" tile={1.6} />
      <TexBox p={[SHOP.minX, H / 2, -9]} s={[T, H, 10]} tex="wall" face="side" tile={1.6} />
      <TexBox p={[SHOP.maxX, H / 2, -9]} s={[T, H, 10]} tex="wall" face="side" tile={1.6} />
      <Box p={[0, 0.2, SHOP.minZ + 0.16]} s={[12, 0.4, 0.04]} c={TRIM} />
      <Box p={[SHOP.minX + 0.16, 0.2, -9]} s={[0.04, 0.4, 10]} c={TRIM} />
      <Box p={[SHOP.maxX - 0.16, 0.2, -9]} s={[0.04, 0.4, 10]} c={TRIM} />

      <group ref={outside}>
        <TexBox p={[-(SHOP.doorHalf + frontW / 2), H / 2, SHOP.maxZ]} s={[frontW, H, T]} tex="wall" face="front" tile={1.6} />
        <TexBox p={[SHOP.doorHalf + frontW / 2, H / 2, SHOP.maxZ]} s={[frontW, H, T]} tex="wall" face="front" tile={1.6} />
        <Box p={[0, 2.85, SHOP.maxZ]} s={[SHOP.doorHalf * 2, 0.7, T]} c={WALL} />
        <Box p={[0, 0.25, SHOP.maxZ + 0.17]} s={[12, 0.5, 0.04]} c={TRIM} />
        <Window x={-3.6} />
        <Window x={3.9} />
        <Awning />
        <Sign />
        <OpenSign />
        {/* Atap pelana */}
        <TexBox p={[0, 4.02, -6.33]} s={[12.9, 0.25, 5.7]} r={[0.3, 0, 0]} tex="roof" face="top" tile={1.4} />
        <TexBox p={[0, 4.02, -11.67]} s={[12.9, 0.25, 5.7]} r={[-0.3, 0, 0]} tex="roof" face="top" tile={1.4} />
        <Box p={[0, 4.88, -9]} s={[13, 0.18, 0.3]} c="#fff1f2" />
        <Gable base={10.7} height={1.62} depth={0.3} color={WALL} position={[SHOP.minX, H, -9]} />
        <Gable base={10.7} height={1.62} depth={0.3} color={WALL} position={[SHOP.maxX, H, -9]} />
        <Cyl p={[3.5, 5.2, -10.5]} rt={0.3} rb={0.3} h={1.4} c="#b45309" seg={8} />
      </group>

      {/* Isi toko */}
      <Box p={[-4, 0.5, -8.2]} s={[3.7, 1.0, 0.8]} c={WOOD} />
      <Box p={[-4, 1.02, -8.2]} s={[3.75, 0.05, 0.85]} c="#fff7ed" />
      <Box p={[2.75, 0.5, -8.2]} s={[1.3, 1.0, 0.8]} c={WOOD} />
      <Box p={[2.75, 1.02, -8.2]} s={[1.35, 0.05, 0.85]} c="#fff7ed" />
      <Ball p={[-4.6, 1.15, -8.2]} rad={0.13} c="#d4a058" s={[1.3, 0.7, 1]} />
      <Box p={[-3.5, 1.15, -8.2]} s={[0.35, 0.22, 0.3]} c="#fde68a" />
      <DisplayCase />
      <Kitchen />
      <Bedroom />
      <CafeTable x={-3.6} z={-5.6} />
      <CafeTable x={3.7} z={-5.6} />
      <Radio />
      <Decorations />
      <pointLight position={[0, 2.8, -7]} color="#ffe4c4" intensity={6} distance={9} decay={1.6} />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[6.15, 1.6, T / 2]} position={[0, 1.6, SHOP.minZ]} />
        <CuboidCollider args={[T / 2, 1.6, 5]} position={[SHOP.minX, 1.6, -9]} />
        <CuboidCollider args={[T / 2, 1.6, 5]} position={[SHOP.maxX, 1.6, -9]} />
        <CuboidCollider args={[frontW / 2, 1.6, T / 2]} position={[-(SHOP.doorHalf + frontW / 2), 1.6, SHOP.maxZ]} />
        <CuboidCollider args={[frontW / 2, 1.6, T / 2]} position={[SHOP.doorHalf + frontW / 2, 1.6, SHOP.maxZ]} />
        {/* Konter + etalase, dengan celah di kanan (x 3.4–5.85) untuk masuk ke dapur */}
        <CuboidCollider args={[4.62, 0.5, 0.4]} position={[-1.23, 0.5, -8.2]} />
        <CuboidCollider args={[0.7, 0.8, 0.45]} position={[SPOTS.oven[0], 0.8, SPOTS.oven[1]]} />
        {hasFridge && <CuboidCollider args={[0.48, 1.0, 0.42]} position={[SPOTS.fridge[0], 1.0, SPOTS.fridge[1]]} />}
        <CuboidCollider args={[0.9, 0.45, 0.4]} position={[2.1, 0.45, -13.35]} />
        <CuboidCollider args={[0.85, 0.4, 1.25]} position={[SPOTS.bed[0], 0.4, SPOTS.bed[1]]} />
        <CuboidCollider args={[0.3, 0.3, 0.25]} position={[-2.9, 0.3, -13.35]} />
        <CylinderCollider args={[0.4, 0.45]} position={[-3.6, 0.4, -5.6]} />
        <CylinderCollider args={[0.4, 0.45]} position={[3.7, 0.4, -5.6]} />
        <CylinderCollider args={[0.4, 0.38]} position={[SPOTS.radio[0], 0.4, SPOTS.radio[1]]} />
      </RigidBody>
    </group>
  );
}
