"use client";

import { useMemo } from "react";
import { CanvasTexture, ExtrudeGeometry, Shape, SRGBColorSpace } from "three";
import { Ball, Box, Cyl } from "../scene/parts";

/** Tekstur bertulisan dari canvas 2D (tidak perlu unduh font). */
export function useTextTexture(lines: string[], bg: string, fg: string, w = 512, h = 128) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const size = Math.floor(h / (lines.length + 0.6));
    g.font = `bold ${size}px 'Trebuchet MS', 'Segoe UI', sans-serif`;
    lines.forEach((line, i) => g.fillText(line, w / 2, (h / (lines.length + 1)) * (i + 1), w - 24));
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.join("|"), bg, fg, w, h]);
}

/** Prisma segitiga untuk ujung atap; alas `base` di bawah, tinggi `height`, tebal `depth` (searah x dunia). */
export function Gable({ base, height, depth, color, position }: { base: number; height: number; depth: number; color: string; position: [number, number, number] }) {
  const geo = useMemo(() => {
    const s = new Shape();
    s.moveTo(-base / 2, 0);
    s.lineTo(base / 2, 0);
    s.lineTo(0, height);
    s.closePath();
    const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [base, height, depth]);
  return (
    <mesh geometry={geo} position={position} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

/** Model mini tiap produk untuk etalase dan pelanggan. */
export function ProductMesh({ itemId }: { itemId: string }) {
  switch (itemId) {
    case "bread":
      return (
        <>
          <Ball p={[0, 0.08, 0]} rad={0.12} c="#d4a058" s={[1.4, 0.7, 0.9]} />
          <Box p={[0, 0.15, 0]} s={[0.04, 0.02, 0.14]} c="#f5deb3" />
        </>
      );
    case "chamomile_tea":
      return (
        <>
          <Cyl p={[0, 0.08, 0]} rt={0.09} rb={0.07} h={0.16} c="#ffffff" />
          <Cyl p={[0, 0.155, 0]} rt={0.08} rb={0.08} h={0.01} c="#e9c46a" />
          <Cyl p={[0, 0.005, 0]} rt={0.13} rb={0.13} h={0.01} c="#fde68a" />
        </>
      );
    case "berry_tart":
      return (
        <>
          <Cyl p={[0, 0.04, 0]} rt={0.16} rb={0.13} h={0.08} c="#e8b56d" seg={16} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Ball key={i} p={[Math.cos(i * 1.26) * 0.08, 0.09, Math.sin(i * 1.26) * 0.08]} rad={0.035} c="#4f46e5" />
          ))}
        </>
      );
    case "mushroom_pie":
      return (
        <>
          <Cyl p={[0, 0.05, 0]} rt={0.15} rb={0.13} h={0.1} c="#c98b4a" seg={16} />
          <Ball p={[0, 0.1, 0]} rad={0.15} c="#e2a764" s={[1, 0.35, 1]} />
        </>
      );
    case "strawberry_cake":
      return (
        <>
          <Cyl p={[0, 0.08, 0]} rt={0.15} rb={0.15} h={0.16} c="#fbcfe8" seg={16} />
          <Cyl p={[0, 0.165, 0]} rt={0.155} rb={0.155} h={0.02} c="#ffffff" seg={16} />
          <Ball p={[0, 0.2, 0]} rad={0.045} c="#e11d48" />
        </>
      );
    case "windi_special":
      return (
        <>
          <Cyl p={[0, 0.07, 0]} rt={0.17} rb={0.17} h={0.14} c="#f9a8d4" seg={16} />
          <Cyl p={[0, 0.19, 0]} rt={0.12} rb={0.12} h={0.1} c="#fef3c7" seg={16} />
          <Cyl p={[0, 0.28, 0]} rt={0.08} rb={0.08} h={0.08} c="#c4b5fd" seg={16} />
          <Ball p={[0, 0.35, 0]} rad={0.04} c="#e11d48" />
        </>
      );
    default:
      return <Ball p={[0, 0.08, 0]} rad={0.08} c="#fda4af" />;
  }
}
