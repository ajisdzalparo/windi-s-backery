"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Frown } from "lucide-react";
import { ItemIcon } from "../hud/Art";
import type { Group } from "three";
import { MAP_LIMIT, SPOTS, itemOf } from "@/lib/data";
import { playSfx } from "@/lib/sfx";
import { isBusinessHours, useGame } from "@/lib/store";
import { turnToward } from "../scene/parts";
import { Person, type Look, type Motion } from "./Person";
import { ProductMesh } from "./props";

const SPEED = 2.2;
const MAX_CUSTOMERS = 3;
const SKINS = ["#fcd9bd", "#e8b48f", "#d29a72", "#f5c9a6"];
const TOPS = ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f472b6", "#f87171", "#2dd4bf"];
const BOTTOMS = ["#44403c", "#1e3a8a", "#78716c", "#d6c4a8", "#7c3aed"];
const HIJABS = ["#fce7f3", "#e0e7ff", "#fef3c7", "#1f2937", "#9f1239"];

type Customer = { id: number; look: Look; side: 1 | -1 };

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function randomLook(): Look {
  const hijab = Math.random() < 0.5;
  return {
    skin: pick(SKINS),
    top: pick(TOPS),
    bottom: pick(BOTTOMS),
    skirt: hijab && Math.random() < 0.6,
    hijab: hijab ? pick(HIJABS) : undefined,
    hair: pick(["#1c1917", "#3f2a1d", "#57534e"]),
    glasses: Math.random() < 0.2,
  };
}

/** Jalur: dari tepi kota → jalan utama → pintu → depan etalase, lalu kembali. */
function route(side: 1 | -1): [number, number][] {
  const edge: [number, number] = [side * (MAP_LIMIT - 0.5), 2 + (Math.random() - 0.5)];
  const lane = (Math.random() - 0.5) * 0.8;
  return [edge, [lane, 2], [lane * 0.5, SPOTS.door[1]], [lane * 0.4, -4.6], [SPOTS.counterCustomer[0] + lane, SPOTS.counterCustomer[1]]];
}

function CustomerNpc({ c, onDone }: { c: Customer; onDone: (id: number) => void }) {
  const root = useRef<Group>(null!);
  const motion = useRef<Motion>({ walking: true, sitting: false });
  const path = useRef(route(c.side));
  const state = useRef({ leg: 1, phase: "in" as "in" | "buy" | "out", wait: 0 });
  const [bought, setBought] = useState<string | null | undefined>(undefined);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const p = path.current;
    if (s.phase === "buy") {
      s.wait -= dt;
      motion.current.walking = false;
      if (s.wait <= 0) {
        s.phase = "out";
        p.reverse();
        s.leg = 1;
      }
      return;
    }
    const target = p[s.leg];
    const pos = root.current.position;
    const dx = target[0] - pos.x;
    const dz = target[1] - pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.08) {
      if (s.leg < p.length - 1) {
        // Bel pintu berbunyi saat pelanggan melewati pintu toko (masuk maupun keluar).
        if (Math.abs(target[1] - SPOTS.door[1]) < 0.01) playSfx("door");
        s.leg++;
      } else if (s.phase === "in") {
        s.phase = "buy";
        s.wait = 2.2;
        root.current.rotation.y = Math.PI; // menghadap etalase
        setBought(useGame.getState().sellOne());
      } else {
        onDone(c.id);
      }
      return;
    }
    motion.current.walking = true;
    const step = Math.min(dist, SPEED * dt);
    pos.x += (dx / dist) * step;
    pos.z += (dz / dist) * step;
    root.current.rotation.y = turnToward(root.current.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-10 * dt));
  });

  return (
    <group ref={root} position={[path.current[0][0], 0, path.current[0][1]]}>
      <Person look={c.look} motion={motion} />
      {bought && (
        <group position={[0.35, 0.95, 0.25]}>
          <ProductMesh itemId={bought} />
        </group>
      )}
      {bought !== undefined && (
        <Html center position={[0, 2.1, 0]} style={{ pointerEvents: "none" }}>
          <div className="pop-in whitespace-nowrap rounded-full bg-white/90 px-2 py-1 text-sm font-bold shadow">
            {bought ? (
              <span className="flex items-center gap-1">
                <ItemIcon id={bought} size={16} /> Makasih!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Frown size={14} className="text-stone-500" /> Habis…
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Saat toko buka di jam kerja dan etalase berisi, pelanggan berdatangan dari tepi kota. */
export function Customers() {
  const [list, setList] = useState<Customer[]>([]);
  const timer = useRef(4);
  const nextId = useRef(1);

  useFrame((_, dt) => {
    const s = useGame.getState();
    if (s.status !== "ready" || !s.save.shopOpen || !isBusinessHours(s.minute)) return;
    if (s.menu || s.panel !== null || s.photo) return; // waktu sedang berhenti
    timer.current -= Math.min(dt, 0.1);
    if (timer.current > 0) return;
    timer.current = 9 + Math.random() * 9;
    if (s.save.caseItems.length === 0 || list.length >= MAX_CUSTOMERS) return;
    const id = nextId.current++;
    setList((l) => [...l, { id, look: randomLook(), side: Math.random() < 0.5 ? -1 : 1 }]);
  });

  return (
    <>
      {list.map((c) => (
        <CustomerNpc key={c.id} c={c} onDone={(id) => setList((l) => l.filter((x) => x.id !== id))} />
      ))}
    </>
  );
}
