"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { precacheAssets } from "@/lib/offlineAssets";
import { runtime } from "@/lib/runtime";
import { isMuted, startAmbience } from "@/lib/sfx";
import { saveNow, useGame } from "@/lib/store";
import { Hud } from "./hud/Hud";
import { World } from "./world/World";

export default function Game() {
  const status = useGame((s) => s.status);
  const menu = useGame((s) => s.menu);

  useEffect(() => {
    void useGame.getState().load();
    if (process.env.NODE_ENV !== "production") {
      // Pegangan debug untuk pengujian di browser (hanya mode development).
      (window as unknown as Record<string, unknown>).__windi = { useGame, runtime };
    }
    // Simpan saat tab ditutup/disembunyikan (HP sering mematikan tab di background) dan tiap 30 detik.
    const onHide = () => {
      if (document.visibilityState === "hidden") void saveNow(true);
    };
    document.addEventListener("visibilitychange", onHide);
    // Backsound lo-fi + ambience dimulai pada sentuhan pertama (browser melarang audio otomatis).
    const startAudio = () => {
      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("keydown", startAudio);
      if (isMuted()) return;
      startAmbience();
      const s = useGame.getState();
      if (s.status === "ready" && !s.music.on) s.toggleMusic();
    };
    window.addEventListener("pointerdown", startAudio);
    window.addEventListener("keydown", startAudio);
    const id = setInterval(() => void saveNow(), 30_000);

    // Offline-first: begitu koneksi kembali, kirim progres yang tersimpan di HP ke server.
    const onOnline = () => {
      const s = useGame.getState();
      if (s.status === "error") void s.load();
      else void s.syncNow();
    };
    window.addEventListener("online", onOnline);
    const onOffline = () => useGame.setState({ offline: true });
    window.addEventListener("offline", onOffline);

    // Service worker + simpan semua aset di HP (hanya build produksi; mode dev memakai hot-reload).
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => precacheAssets())
        .catch(() => undefined);
    }
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      clearInterval(id);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (status !== "ready") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-rose-100 p-8 text-center">
        <div className="text-5xl">{status === "loading" ? "🧁" : "🌧️"}</div>
        {status === "loading" ? (
          <p className="font-bold text-rose-400">Menyiapkan toko kue…</p>
        ) : (
          <>
            <p className="font-bold text-rose-500">Tokonya belum bisa dibuka</p>
            <p className="max-w-xs text-sm text-stone-500">Server atau database sedang tidak tersambung.</p>
            <button
              onClick={() => void useGame.getState().load()}
              className="rounded-full bg-rose-400 px-6 py-3 font-bold text-white shadow active:scale-95"
            >
              Coba lagi
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 select-none">
      {/* Saat menu utama terbuka scene tertutup penuh, jadi render dihentikan untuk menghemat baterai. */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={menu ? "never" : "always"}
        gl={{ powerPreference: "high-performance" }}
        camera={{ position: [0, 14, 12], fov: 40, near: 0.5, far: 150 }}
      >
        <World />
      </Canvas>
      <Hud />
    </div>
  );
}
