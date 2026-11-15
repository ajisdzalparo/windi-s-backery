"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Ball, Box, Cyl } from "../scene/parts";
import { getFaceTexture, type FaceStyle } from "./faceTexture";

export type Look = {
  skin: string;
  top: string;
  bottom: string;
  skirt?: boolean;
  accent?: string;
  hijab?: string;
  hair?: string;
  longHair?: boolean;
  apron?: string;
  nameTag?: boolean;
  clip?: string; // jepit rambut/hijab
  glasses?: boolean;
  lips?: string;
  lashes?: boolean; // khusus Windi: gaya wajah utama
  faceKey?: string; // nama file wajah kustom di public/textures/faces
  smileOpen?: boolean;
  bow?: string;
  hat?: "beret" | "straw";
  hatColor?: string;
  prop?: "book" | "guitar" | "bag" | "flowers";
};

export type Motion = { walking: boolean; sitting: boolean; wave?: boolean };

function Torus({ p, r, tube, c, s }: { p: [number, number, number]; r: number; tube: number; c: string; s?: [number, number, number] }) {
  return (
    <mesh position={p} scale={s} castShadow>
      <torusGeometry args={[r, tube, 10, 28]} />
      <meshStandardMaterial color={c} roughness={0.85} />
    </mesh>
  );
}

/** Bola polos tanpa bayangan, dipakai untuk detail kecil (mis. kilau rambut). */
function Dot({ p, r, c, s, opacity }: { p: [number, number, number]; r: number; c: string; s?: [number, number, number]; opacity?: number }) {
  return (
    <mesh position={p} scale={s}>
      <sphereGeometry args={[r, 16, 12]} />
      <meshStandardMaterial color={c} roughness={0.5} transparent={opacity !== undefined} opacity={opacity ?? 1} depthWrite={opacity === undefined} />
    </mesh>
  );
}

/**
 * Wajah: bola kulit + tambalan tekstur wajah anime yang ditempel tepat di depannya.
 * Tekstur dilukis lewat canvas (lihat faceTexture.ts) atau diambil dari public/textures/faces/<key>.png.
 */
function Face({ skin, style }: { skin: string; style: FaceStyle }) {
  const id = JSON.stringify(style);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tex = useMemo(() => getFaceTexture(style), [id]);
  return (
    <group position={[0, -0.005, 0.03]} scale={[1.06, 1, 0.95]}>
      <mesh castShadow>
        <sphereGeometry args={[0.26, 32, 24]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh>
        {/* Potongan bola di bagian depan: phi 1.8 rad (lebar) × theta 0.95–2.25 rad (tinggi) */}
        <sphereGeometry args={[0.2618, 40, 28, Math.PI / 2 - 0.9, 1.8, 0.95, 1.3]} />
        <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.55} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}

/** Hijab segi empat gaya foto: membingkai wajah, puncak kecil di dahi, menjuntai menutup bahu sampai dada. */
function Hijab({ color, clip }: { color: string; clip?: string }) {
  return (
    <>
      <Ball p={[0, 0.05, -0.08]} rad={0.3} c={color} s={[1.05, 1.1, 1]} />
      <Torus p={[0, 0.0, 0.1]} r={0.262} tube={0.05} c={color} s={[1, 1.15, 1.3]} />
      <Box p={[0, 0.262, 0.13]} s={[0.26, 0.07, 0.1]} c={color} r={[0.35, 0, 0]} />
      {/* Juntaian di bawah dagu dan kain yang jatuh menutup dada */}
      <Cyl p={[0, -0.31, -0.02]} rt={0.22} rb={0.36} h={0.34} c={color} seg={20} />
      <Box p={[0, -0.34, 0.17]} s={[0.4, 0.26, 0.06]} c={color} r={[0.1, 0, 0]} />
      {clip && (
        <group position={[0.24, 0.02, 0.15]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Ball key={i} p={[Math.cos(i * 1.26) * 0.03, Math.sin(i * 1.26) * 0.03, 0]} rad={0.022} c={clip} />
          ))}
          <Ball p={[0, 0, 0.01]} rad={0.015} c="#ffffff" />
        </group>
      )}
    </>
  );
}

const BANGS: [number, number, number][] = [
  [-0.16, 0.19, 0.14],
  [-0.085, 0.21, 0.168],
  [0, 0.215, 0.176],
  [0.08, 0.21, 0.168],
  [0.155, 0.19, 0.14],
];

/** Rambut bulat lembut: poni berlapis, helai samping, rambut panjang di punggung, dan kilau. */
function Hair({ color, long, clip }: { color: string; long?: boolean; clip?: string }) {
  return (
    <>
      <Ball p={[0, 0.07, -0.06]} rad={0.285} c={color} s={[1.06, 0.95, 1.05]} />
      {BANGS.map((p, i) => (
        <Ball key={i} p={p} rad={0.072} c={color} s={[1, 1.3, 0.6]} />
      ))}
      <Dot p={[-0.09, 0.25, 0.12]} r={0.05} c="#ffffff" s={[1.6, 0.3, 0.3]} opacity={0.18} />
      {/* Helai di samping wajah */}
      {[-1, 1].map((side) => (
        <Ball key={side} p={[side * 0.245, -0.07, 0.07]} rad={0.075} c={color} s={[0.6, long ? 2.3 : 1.4, 0.8]} />
      ))}
      {long && (
        <>
          <Ball p={[0, -0.12, -0.16]} rad={0.26} c={color} s={[1.08, 1.5, 0.6]} />
          <Ball p={[0, -0.4, -0.15]} rad={0.2} c={color} s={[1.15, 0.55, 0.6]} />
        </>
      )}
      {clip && (
        <group position={[0.2, 0.17, 0.12]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Ball key={i} p={[Math.cos(i * 1.26) * 0.028, Math.sin(i * 1.26) * 0.028, 0]} rad={0.02} c={clip} />
          ))}
          <Ball p={[0, 0, 0.01]} rad={0.014} c="#ffffff" />
        </group>
      )}
    </>
  );
}

function Bow({ color }: { color: string }) {
  return (
    <group position={[0.17, 0.24, 0.02]} rotation={[0, 0, -0.45]}>
      <Ball p={[-0.06, 0, 0]} rad={0.055} c={color} s={[1.25, 0.8, 0.5]} />
      <Ball p={[0.06, 0, 0]} rad={0.055} c={color} s={[1.25, 0.8, 0.5]} />
      <Ball p={[0, 0, 0.012]} rad={0.028} c={color} />
    </group>
  );
}

function Hat({ kind, color }: { kind: "beret" | "straw"; color: string }) {
  if (kind === "beret") {
    return (
      <group position={[0.03, 0.27, -0.02]} rotation={[0, 0, -0.2]}>
        <Ball p={[0, 0, 0]} rad={0.25} c={color} s={[1.2, 0.36, 1.15]} />
        <Cyl p={[0, 0.09, 0]} rt={0.012} rb={0.02} h={0.05} c={color} seg={6} />
      </group>
    );
  }
  return (
    <group position={[0, 0.2, -0.01]} rotation={[-0.12, 0, 0]}>
      <Cyl p={[0, 0, 0]} rt={0.4} rb={0.4} h={0.025} c={color} seg={22} />
      <Cyl p={[0, 0.08, 0]} rt={0.2} rb={0.23} h={0.15} c={color} seg={18} />
      <Cyl p={[0, 0.035, 0]} rt={0.235} rb={0.235} h={0.045} c="#e11d48" seg={18} />
    </group>
  );
}

function Prop({ kind }: { kind: NonNullable<Look["prop"]> }) {
  switch (kind) {
    case "book":
      return (
        <group position={[0, 0.95, 0.32]} rotation={[-0.9, 0, 0]}>
          <Box p={[0, 0, 0]} s={[0.36, 0.26, 0.04]} c="#2563eb" />
          <Box p={[0, 0, 0.022]} s={[0.33, 0.23, 0.01]} c="#fffbeb" />
        </group>
      );
    case "guitar":
      return (
        <group position={[0.05, 0.82, 0.26]} rotation={[0, 0, -0.9]}>
          <Ball p={[0, 0, 0]} rad={0.2} c="#b45309" s={[1, 1.2, 0.35]} />
          <Ball p={[0, 0, 0.06]} rad={0.05} c="#292524" s={[1, 1, 0.2]} />
          <Box p={[0, 0.42, 0]} s={[0.06, 0.5, 0.04]} c="#78350f" />
        </group>
      );
    case "bag":
      return <Box p={[-0.36, 0.62, 0.02]} s={[0.12, 0.26, 0.3]} c="#fef3c7" />;
    case "flowers":
      return (
        <group position={[0.2, 0.7, 0.28]}>
          {[0, 1, 2, 3].map((i) => (
            <Ball key={i} p={[Math.cos(i * 1.6) * 0.06, 0.12, Math.sin(i * 1.6) * 0.06]} rad={0.05} c={i % 2 ? "#f472b6" : "#facc15"} />
          ))}
          <Cyl p={[0, 0, 0]} rt={0.05} rb={0.02} h={0.2} c="#86efac" />
        </group>
      );
  }
}

function faceStyle(look: Look): FaceStyle {
  const windi = !!look.lashes;
  const female = windi || !!look.hijab || !!look.longHair || !!look.skirt;
  return {
    key: look.faceKey ?? (windi ? "windi" : female ? "girl" : "boy"),
    iris: windi ? "#9a5530" : "#7a4a2a",
    lashes: female,
    blush: windi ? 1 : female ? 0.7 : 0.35,
    brow: windi ? "#4a2e20" : (look.hair ?? "#3b2418"),
    lips: look.lips ?? (female ? "#e26a80" : "#b8604f"),
    mole: windi,
    glasses: look.glasses,
    smile: look.smileOpen ? "open" : "soft",
  };
}

/** Karakter chibi low-poly serbaguna: Windi, Ajis, warga, dan pelanggan. Menghadap +z. */
export function Person({ look, motion }: { look: Look; motion: React.RefObject<Motion> }) {
  const body = useRef<Group>(null!);
  const head = useRef<Group>(null!);
  const legL = useRef<Group>(null!);
  const legR = useRef<Group>(null!);
  const armL = useRef<Group>(null!);
  const armR = useRef<Group>(null!);
  const phase = useRef(Math.random() * 10);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase.current;
    const { walking, sitting, wave } = motion.current;
    head.current.rotation.z = walking ? 0 : Math.sin(t * 0.9) * 0.05;
    armR.current.rotation.z = 0;
    if (sitting) {
      legL.current.rotation.x = legR.current.rotation.x = -1.45;
      armL.current.rotation.x = armR.current.rotation.x = -0.45;
      body.current.position.y = -0.08 + Math.sin(t * 1.5) * 0.006;
      if (wave) {
        armR.current.rotation.x = -2.7;
        armR.current.rotation.z = 0.3 + Math.sin(t * 14) * 0.35;
      }
      return;
    }
    const swing = walking ? Math.sin(t * 10) * 0.65 : 0;
    legL.current.rotation.x = swing;
    legR.current.rotation.x = -swing;
    const holding = !!look.prop && look.prop !== "bag";
    armL.current.rotation.x = holding ? -0.9 : walking ? -swing * 0.8 : Math.sin(t * 1.6) * 0.05;
    armR.current.rotation.x = holding ? -0.9 : walking ? swing * 0.8 : -Math.sin(t * 1.6) * 0.05;
    body.current.position.y = walking ? Math.abs(Math.sin(t * 10)) * 0.04 : Math.sin(t * 2) * 0.012;
    if (wave) {
      // Melambai: lengan kanan terangkat dan bergoyang.
      armR.current.rotation.x = -2.7;
      armR.current.rotation.z = 0.3 + Math.sin(t * 14) * 0.35;
    }
  });

  // Hijab atau seragam toko: lengan panjang dan rok panjang seperti di foto.
  const modest = !!look.hijab || !!look.apron;
  const legColor = look.skirt || modest ? look.bottom : look.bottom;
  const sleeve = modest ? look.top : look.skin;

  return (
    <group ref={body}>
      <group ref={legL} position={[-0.12, 0.55, 0]}>
        <Box p={[0, -0.25, 0]} s={[0.17, 0.5, 0.19]} c={look.skirt && !modest ? look.skin : legColor} />
        <Box p={[0, -0.51, 0.03]} s={[0.18, 0.08, 0.26]} c="#3f2a2a" />
      </group>
      <group ref={legR} position={[0.12, 0.55, 0]}>
        <Box p={[0, -0.25, 0]} s={[0.17, 0.5, 0.19]} c={look.skirt && !modest ? look.skin : legColor} />
        <Box p={[0, -0.51, 0.03]} s={[0.18, 0.08, 0.26]} c="#3f2a2a" />
      </group>
      {look.skirt && <Cyl p={[0, modest ? 0.36 : 0.52, 0]} rt={modest ? 0.22 : 0.27} rb={modest ? 0.38 : 0.44} h={modest ? 0.62 : 0.36} c={look.bottom} seg={16} />}

      <Box p={[0, 0.84, 0]} s={[0.5, 0.56, 0.3]} c={look.top} />
      {look.apron ? (
        <>
          <Box p={[0, 0.66, 0.165]} s={[0.46, 0.66, 0.03]} c={look.apron} />
          <Box p={[0, 0.98, 0.16]} s={[0.36, 0.2, 0.03]} c={look.apron} />
          {look.skirt && (
            // Bagian bawah celemek: busur melengkung yang menempel di depan rok.
            <mesh position={[0, 0.36, 0]} castShadow>
              <cylinderGeometry args={[0.232, 0.392, 0.62, 14, 1, true, -0.8, 1.6]} />
              <meshStandardMaterial color={look.apron} roughness={0.85} side={2} />
            </mesh>
          )}
          {look.nameTag && (
            <>
              <Box p={[-0.12, 0.83, 0.185]} s={[0.15, 0.06, 0.01]} c="#1c1917" />
              <Box p={[-0.12, 0.83, 0.19]} s={[0.12, 0.012, 0.005]} c="#d4a017" />
            </>
          )}
          <Ball p={[0.13, 0.85, 0.185]} rad={0.022} c="#d6d3d1" />
        </>
      ) : (
        <Ball p={[0, 0.86, 0.155]} rad={0.035} c={look.accent ?? "#ffffff"} />
      )}

      <group ref={armL} position={[-0.33, 1.06, 0]}>
        <Box p={[0, -0.14, 0]} s={[0.14, 0.3, 0.16]} c={look.top} />
        <Box p={[0, -0.4, 0]} s={[0.12, 0.22, 0.14]} c={sleeve} />
        <Ball p={[0, -0.53, 0]} rad={0.06} c={look.skin} />
      </group>
      <group ref={armR} position={[0.33, 1.06, 0]}>
        <Box p={[0, -0.14, 0]} s={[0.14, 0.3, 0.16]} c={look.top} />
        <Box p={[0, -0.4, 0]} s={[0.12, 0.22, 0.14]} c={sleeve} />
        <Ball p={[0, -0.53, 0]} rad={0.06} c={look.skin} />
      </group>
      {look.prop && <Prop kind={look.prop} />}

      {/* Kepala sedikit diperbesar supaya proporsinya chibi */}
      <group ref={head} position={[0, 1.44, 0]} scale={1.22}>
        {look.hijab ? (
          <Hijab color={look.hijab} clip={look.clip} />
        ) : (
          <Hair color={look.hair ?? "#292524"} long={look.longHair} clip={look.hat || look.bow ? undefined : look.clip} />
        )}
        {!look.hijab && look.bow && !look.hat && <Bow color={look.bow} />}
        {!look.hijab && look.hat && <Hat kind={look.hat} color={look.hatColor ?? "#be123c"} />}
        <Face skin={look.skin} style={faceStyle(look)} />
      </group>
    </group>
  );
}
