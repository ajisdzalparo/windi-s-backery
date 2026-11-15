"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Hand } from "lucide-react";
import { EMOTE_ICONS } from "../hud/Icons";
import { CapsuleCollider, CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { Group } from "three";
import { runtime } from "@/lib/runtime";
import { FLOWER_STALL, NPC_BENCH, TOWNSFOLK, type Townsperson } from "@/lib/townsfolk";
import { Ball, Box, Cyl, turnToward } from "../scene/parts";
import { Person, type Motion } from "./Person";
import { useTextTexture } from "./props";
import { BenchModel } from "./Town";

const HIDDEN_Y = -50;
const NOTICE_DIST = 1.7; // warga berhenti dan menoleh kalau Windi sedekat ini

function startPos(p: Townsperson): [number, number] {
  const b = p.behavior;
  if (b.kind === "patrol") return b.points[0];
  if (b.kind === "circle") return [b.center[0] + Math.cos(b.phase) * b.radius, b.center[1] + Math.sin(b.phase) * b.radius];
  return b.pos;
}

/** Satu warga: menjalankan rutinitasnya, menoleh & melambai ke Windi, sesekali memunculkan emote. */
function Npc({ p }: { p: Townsperson }) {
  const root = useRef<Group>(null!);
  const body = useRef<RapierRigidBody>(null);
  const motion = useRef<Motion>({ walking: false, sitting: p.behavior.kind === "sit" });
  const st = useRef({ leg: 1, angle: p.behavior.kind === "circle" ? p.behavior.phase : 0, emoteIn: 3 + Math.random() * 8, greeted: false });
  const [bubble, setBubble] = useState<string | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = startPos(p);

  const show = (text: string, ms = 2400) => {
    setBubble(text);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  };
  useEffect(() => () => clearTimeout(bubbleTimer.current), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const m = runtime.clock;
    const present = m >= p.hours[0] && m < p.hours[1];
    const g = root.current;
    if (!present) {
      if (g.visible) {
        g.visible = false;
        runtime.npcs.delete(p.id);
        body.current?.setNextKinematicTranslation({ x: start[0], y: HIDDEN_Y, z: start[1] });
      }
      return;
    }
    g.visible = true;

    const b = p.behavior;
    const pos = g.position;
    const dxp = runtime.player.x - pos.x;
    const dzp = runtime.player.z - pos.z;
    const near = Math.hypot(dxp, dzp) < NOTICE_DIST;
    let walking = false;

    if (near) {
      // Berhenti, menoleh ke Windi, dan menyapa sekali tiap kali didekati.
      if (b.kind !== "sit") g.rotation.y = turnToward(g.rotation.y, Math.atan2(dxp, dzp), 1 - Math.exp(-8 * dt));
      if (!st.current.greeted) {
        st.current.greeted = true;
        show("hello");
      }
    } else {
      st.current.greeted = false;
      if (b.kind === "patrol") {
        const target = b.points[st.current.leg];
        const dx = target[0] - pos.x;
        const dz = target[1] - pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.08) st.current.leg = (st.current.leg + 1) % b.points.length;
        else {
          const step = Math.min(dist, b.speed * dt);
          pos.x += (dx / dist) * step;
          pos.z += (dz / dist) * step;
          g.rotation.y = turnToward(g.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-10 * dt));
          walking = true;
        }
      } else if (b.kind === "circle") {
        st.current.angle += b.speed * dt;
        const a = st.current.angle;
        const nx = b.center[0] + Math.cos(a) * b.radius;
        const nz = b.center[1] + Math.sin(a) * b.radius;
        g.rotation.y = Math.atan2(nx - pos.x, nz - pos.z);
        pos.x = nx;
        pos.z = nz;
        walking = true;
      } else {
        pos.set(b.pos[0], 0, b.pos[1]);
        g.rotation.y = turnToward(g.rotation.y, b.rot, 1 - Math.exp(-4 * dt));
      }
    }

    const greet = runtime.greet;
    motion.current.wave = (!!greet && greet.id === p.id && Date.now() - greet.at < 1800) || (near && !walking && Date.now() % 4000 < 900);
    motion.current.walking = walking;
    runtime.npcs.set(p.id, { x: pos.x, z: pos.z });
    body.current?.setNextKinematicTranslation({ x: pos.x, y: 0, z: pos.z });

    st.current.emoteIn -= dt;
    if (st.current.emoteIn <= 0) {
      st.current.emoteIn = 8 + Math.random() * 10;
      if (!near) show(p.emotes[Math.floor(Math.random() * p.emotes.length)], 2200);
    }
  });

  const scale = p.scale ?? 1;
  const sitting = p.behavior.kind === "sit";
  return (
    <>
      {!sitting && (
        <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[start[0], 0, start[1]]}>
          <CapsuleCollider args={[0.35 * scale, 0.28 * scale]} position={[0, 0.66 * scale, 0]} />
        </RigidBody>
      )}
      <group ref={root} position={[start[0], 0, start[1]]} rotation={[0, p.behavior.kind === "sit" || p.behavior.kind === "stand" ? p.behavior.rot : 0, 0]}>
        <group scale={scale}>
          <Person look={p.look} motion={motion} />
        </group>
        {bubble && (
          <Html center position={[0, 2.25 * scale, 0]} style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
            <div key={bubble} className="pop-in whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-sm font-bold shadow">
              {bubble === "hello" ? (
                <span className="flex items-center gap-1">
                  <Hand size={14} className="text-amber-600" /> Halo Windi!
                </span>
              ) : (
                (() => {
                  const I = EMOTE_ICONS[bubble];
                  return I ? <I size={16} className="text-rose-500" /> : null;
                })()
              )}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

/** Lapak bunga Mas Andi di pinggir jalan. */
function FlowerStall() {
  const sign = useTextTexture(["Bunga Segar"], "#fff7ed", "#be185d", 256, 70);
  const [x, z] = FLOWER_STALL;
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.45, 0]} s={[1.9, 0.9, 0.8]} c="#a97c50" />
      <Box p={[0, 0.92, 0]} s={[2.0, 0.06, 0.9]} c="#fef3c7" />
      {[-0.9, 0.9].map((dx) => (
        <Box key={dx} p={[dx, 1.45, -0.35]} s={[0.07, 1.1, 0.07]} c="#78350f" />
      ))}
      <Box p={[0, 2.0, -0.1]} s={[2.2, 0.08, 1.1]} c="#86efac" r={[0.15, 0, 0]} />
      <mesh position={[0, 1.75, -0.36]}>
        <planeGeometry args={[1.4, 0.38]} />
        <meshStandardMaterial map={sign} />
      </mesh>
      {[-0.65, -0.2, 0.25, 0.7].map((dx, i) => (
        <group key={dx} position={[dx, 0.95, 0.05]}>
          <Cyl p={[0, 0.12, 0]} rt={0.13} rb={0.1} h={0.24} c="#e7e5e4" />
          {[0, 1, 2, 3, 4].map((k) => (
            <Ball key={k} p={[Math.cos(k * 1.26) * 0.08, 0.32, Math.sin(k * 1.26) * 0.08]} rad={0.06} c={["#f472b6", "#facc15", "#fb7185", "#c084fc"][i]} />
          ))}
        </group>
      ))}
    </group>
  );
}

export function Townsfolk() {
  useEffect(() => () => runtime.npcs.clear(), []);
  return (
    <>
      {TOWNSFOLK.map((p) => (
        <Npc key={p.id} p={p} />
      ))}
      <group position={[NPC_BENCH.pos[0], 0, NPC_BENCH.pos[1]]} rotation={[0, NPC_BENCH.rot, 0]}>
        <BenchModel />
      </group>
      <FlowerStall />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.3, 0.6, 0.85]} position={[NPC_BENCH.pos[0], 0.6, NPC_BENCH.pos[1]]} />
        <CuboidCollider args={[0.95, 0.6, 0.4]} position={[FLOWER_STALL[0], 0.6, FLOWER_STALL[1]]} />
      </RigidBody>
    </>
  );
}
