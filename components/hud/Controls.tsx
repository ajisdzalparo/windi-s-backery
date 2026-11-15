"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, Hand, PawPrint } from "lucide-react";
import { runtime } from "@/lib/runtime";
import { useGame } from "@/lib/store";

/** Keyboard (laptop): W A S D / panah untuk berjalan, E / Spasi / Enter untuk aksi. Tidak menampilkan apa pun. */
export function KeyboardControls() {
  useEffect(() => {
    const keys = new Set<string>();
    const apply = () => {
      const x = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
      const z = (keys.has("s") || keys.has("arrowdown") ? 1 : 0) - (keys.has("w") || keys.has("arrowup") ? 1 : 0);
      const len = Math.hypot(x, z) || 1;
      runtime.input.x = x / len;
      runtime.input.z = z / len;
    };
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "e" || k === " " || k === "enter") {
        if (k === " ") e.preventDefault();
        if (!e.repeat) useGame.getState().interact();
        return;
      }
      keys.add(k);
      apply();
    };
    const up = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
      apply();
    };
    const blur = () => {
      keys.clear();
      apply();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
  return null;
}

const RADIUS = 48;

/**
 * Joystick bergaya toko roti: cincin kayu dengan tanda panah, bagian dalam krem, dan kenop kue
 * bercap tapak kaki. Bisa dipakai bersamaan dengan ketuk-untuk-jalan.
 */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = pointer.current !== null;

  const update = (clientX: number, clientY: number) => {
    const r = base.current!.getBoundingClientRect();
    let dx = clientX - (r.left + r.width / 2);
    let dy = clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    runtime.moveTarget = null; // joystick mengambil alih dari ketuk-untuk-jalan
    runtime.input.x = dx / RADIUS;
    runtime.input.z = dy / RADIUS;
  };
  const release = () => {
    pointer.current = null;
    setKnob({ x: 0, y: 0 });
    runtime.input.x = 0;
    runtime.input.z = 0;
  };

  const arrow = (rot: number) => (
    <ChevronUp
      size={18}
      strokeWidth={3.2}
      className="absolute top-1/2 left-1/2 text-[#fff3dc] drop-shadow-[0_1px_0_#5b3418]"
      style={{ transform: `translate(-50%, -50%) rotate(${rot}deg) translateY(-54px)` }}
    />
  );

  return (
    <div
      ref={base}
      aria-label="Joystick"
      className="pointer-events-auto relative h-[136px] w-[136px] touch-none rounded-full border-[3px] border-[#5b3418] bg-gradient-to-b from-[#c98a55] via-[#a86b3c] to-[#8a5530] shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_4px_0_#5b3418,0_10px_18px_rgba(0,0,0,0.25)]"
      onPointerDown={(e) => {
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pointer.current === e.pointerId) update(e.clientX, e.clientY);
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      {[0, 90, 180, 270].map((r) => (
        <span key={r}>{arrow(r)}</span>
      ))}
      {/* bagian dalam krem */}
      <span className="absolute inset-[22px] rounded-full border-2 border-[#5b3418]/60 bg-[#fff3dc]/90 shadow-inner" />
      {/* kenop kue bercap tapak kaki */}
      <span
        className={`absolute top-1/2 left-1/2 flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-[#7a4520] bg-gradient-to-b from-[#f8c47c] via-[#eba352] to-[#c97a33] shadow-[inset_0_3px_0_rgba(255,255,255,0.5),0_4px_8px_rgba(0,0,0,0.3)] transition-transform ${active ? "scale-95" : ""}`}
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      >
        <PawPrint size={24} className="text-[#7a4520]" strokeWidth={2.4} />
      </span>
    </div>
  );
}

/** Petunjuk kecil; hilang setelah pemain mulai berjalan. */
export function TapHint() {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    const id = setInterval(() => {
      if (runtime.moveTarget || runtime.input.x || runtime.input.z) setSeen(true);
    }, 300);
    return () => clearInterval(id);
  }, [seen]);
  if (seen) return null;
  return (
    <div className="pop-in flex items-center gap-2 rounded-2xl border-2 border-[#8a5530] bg-[#fff6e5]/95 px-3 py-2 text-xs font-extrabold text-[#6b3f22] shadow-md">
      <Hand size={16} className="animate-bounce text-[#a86b3c]" />
      Geser joystick atau ketuk tanah untuk berjalan
    </div>
  );
}
