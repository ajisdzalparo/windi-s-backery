"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type DirectionalLight, type HemisphereLight, Object3D, type PointLight, Vector3 } from "three";
import { runtime } from "@/lib/runtime";
import { useGame } from "@/lib/store";
import { lampState } from "./Town";

type Key = { m: number; sky: string; sun: string; sunI: number; hemi: number };

// Suasana per jam: subuh → pagi → siang → sore → senja → malam.
const KEYS: Key[] = [
  { m: 0, sky: "#1b2244", sun: "#9fb4ff", sunI: 0.25, hemi: 0.35 },
  { m: 330, sky: "#2a3561", sun: "#9fb4ff", sunI: 0.3, hemi: 0.4 },
  { m: 390, sky: "#f7c6a3", sun: "#ffb27a", sunI: 1.0, hemi: 0.65 },
  { m: 480, sky: "#c4e6f7", sun: "#fff0d6", sunI: 1.8, hemi: 0.9 },
  { m: 720, sky: "#a9dcf6", sun: "#ffffff", sunI: 2.0, hemi: 1.0 },
  { m: 1000, sky: "#cfe3ee", sun: "#ffe2bd", sunI: 1.7, hemi: 0.9 },
  { m: 1080, sky: "#f6b98f", sun: "#ff9f66", sunI: 1.2, hemi: 0.7 },
  { m: 1150, sky: "#8a6fa8", sun: "#ff8a6a", sunI: 0.55, hemi: 0.5 },
  { m: 1230, sky: "#2a3561", sun: "#9fb4ff", sunI: 0.3, hemi: 0.4 },
  { m: 1440, sky: "#1b2244", sun: "#9fb4ff", sunI: 0.25, hemi: 0.35 },
];

const ca = new Color();
const cb = new Color();

function sample(m: number) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].m <= m) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = Math.min(1, Math.max(0, (m - a.m) / (b.m - a.m)));
  return {
    sky: ca.set(a.sky).lerp(cb.set(b.sky), t).getHex(),
    sun: ca.set(a.sun).lerp(cb.set(b.sun), t).getHex(),
    sunI: a.sunI + (b.sunI - a.sunI) * t,
    hemi: a.hemi + (b.hemi - a.hemi) * t,
  };
}

/** Siklus siang/malam: warna langit, matahari yang bergerak, dan lampu jalan menyala malam hari. */
export function DayNight() {
  const scene = useThree((s) => s.scene);
  const sun = useRef<DirectionalLight>(null!);
  const hemi = useRef<HemisphereLight>(null!);
  const target = useRef(new Object3D());
  const bg = useRef(new Color("#a9dcf6"));
  const fill = useRef<PointLight>(null!);

  useEffect(() => {
    scene.background = bg.current;
    scene.add(target.current);
    sun.current.target = target.current;
    const t = target.current;
    return () => {
      scene.remove(t);
    };
  }, [scene]);

  useFrame(() => {
    const m = runtime.clock;
    const k = sample(m);
    bg.current.setHex(k.sky);
    sun.current.color.setHex(k.sun);
    sun.current.intensity = k.sunI;
    hemi.current.intensity = k.hemi;
    // Matahari berputar dari timur (pagi) ke barat (sore); bayangan mengikuti Windi.
    const a = ((m - 360) / 720) * Math.PI;
    const px = runtime.player.x;
    const pz = runtime.player.z;
    sun.current.position.set(px + Math.cos(a) * 14, 18, pz + 9);
    target.current.position.set(px, 0, pz);
    // Lampu isi lembut di depan Windi supaya wajahnya selalu terang, juga saat di bawah bayangan.
    fill.current.position.set(px, 1.9, pz + 1.8);
    lampState.on = m >= 1110 || m < 380 ? 1 : 0;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#fff7ed", "#7fb36a", 0.9]} />
      <pointLight ref={fill} color="#ffe8dc" intensity={2.2} distance={4.5} decay={1.5} />
      <directionalLight
        ref={sun}
        castShadow
        intensity={1.8}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
      />
    </>
  );
}

const OFFSET = { y: 10, z: 11 };

/** Kamera mengikuti Windi dari arah selatan; di layar portrait kamera mundur supaya pandangan lebih luas. */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const zoom = Math.min(1.75, Math.max(1, 0.8 / aspect));

  const look = useRef(new Vector3());
  useFrame(({ clock }, dt) => {
    const k = 1 - Math.exp(-6 * Math.min(dt, 0.1));
    const tx = runtime.player.x;
    const tz = runtime.player.z;
    const s = useGame.getState();
    let ox = 0;
    let oy = OFFSET.y * zoom;
    let oz = OFFSET.z * zoom;
    let ly = 0.8;
    if (s.menu) {
      // Menu utama: kamera berputar pelan mengelilingi Windi; target agak rendah supaya Windi tampil di atas tombol menu.
      // Berayun pelan di depan Windi (tidak sampai ke belakang) supaya wajahnya selalu terlihat.
      const a = Math.sin(clock.elapsedTime * 0.25) * 0.5;
      ox = Math.sin(a) * 6.2;
      oz = Math.cos(a) * 6.2;
      oy = 2.1;
      ly = 0.55;
    } else if (s.panel === "boutique") {
      ox = 0;
      oy = 1.9;
      oz = 5.6;
      ly = 0.15;
    } else if (s.photo) {
      oy = 1.6;
      oz = 3.4;
      ly = 1.15;
    }
    camera.position.x += (tx + ox - camera.position.x) * k;
    camera.position.y += (oy - camera.position.y) * k;
    camera.position.z += (tz + oz - camera.position.z) * k;
    look.current.lerp(new Vector3(tx, ly, tz), k);
    camera.lookAt(look.current);
  });

  return null;
}

/** Photo Mode: render frame saat ini lalu unduh sebagai PNG. */
export function CaptureBridge() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    runtime.capture = () => {
      gl.render(scene, camera);
      gl.domElement.toBlob((blob) => {
        if (!blob) return useGame.getState().say("Gagal mengambil foto");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `windi-sweet-bakery-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        useGame.getState().say("Foto tersimpan 📸");
      }, "image/png");
    };
    return () => {
      runtime.capture = null;
    };
  }, [gl, scene, camera]);
  return null;
}
