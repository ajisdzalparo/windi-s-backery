"use client";

import { useEffect, useState } from "react";
import { CakeSlice, ChefHat, Croissant, Droplets, Heart, type LucideIcon, SkipForward, Store, Users, Wheat } from "lucide-react";
import { stripEmoji } from "./Icons";

// Cutscene pembuka 4 adegan. Simpan video hasil generate di public/video/intro-1.mp4 … intro-4.mp4.
// Kalau videonya belum ada, adegan ditampilkan sebagai ilustrasi animasi + teks.
const SCENES = [
  { video: "/video/intro-1.mp4", art: [Store, Croissant] as LucideIcon[], bg: "from-amber-200 via-orange-100 to-rose-100", text: "Di sebuah kota kecil yang hangat, ada toko kue mungil…" },
  { video: "/video/intro-2.mp4", art: [ChefHat, CakeSlice] as LucideIcon[], bg: "from-orange-200 via-amber-100 to-yellow-50", text: "…milik Windi, yang selalu memanggang dengan senyuman." },
  { video: "/video/intro-3.mp4", art: [Wheat, Droplets] as LucideIcon[], bg: "from-sky-200 via-lime-100 to-amber-100", text: "Bahan-bahannya ditanam sendiri, kadang dibantu Ajis." },
  { video: "/video/intro-4.mp4", art: [Users, Heart] as LucideIcon[], bg: "from-orange-300 via-rose-200 to-purple-200", text: "Selamat datang di Windi's Sweet Bakery! 💕" },
];
const FALLBACK_MS = 4200;

export function IntroCutscene({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [videoOk, setVideoOk] = useState(true);
  const scene = SCENES[i];
  const next = () => {
    if (i + 1 >= SCENES.length) onDone();
    else {
      setVideoOk(true);
      setI(i + 1);
    }
  };

  // Tanpa video: pindah adegan otomatis setelah beberapa detik.
  useEffect(() => {
    if (videoOk) return;
    const id = setTimeout(next, FALLBACK_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, videoOk]);

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-black" onClick={next}>
      {videoOk ? (
        <video
          key={scene.video}
          src={scene.video}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          onEnded={next}
          onError={() => setVideoOk(false)}
        />
      ) : (
        <div key={i} className={`pop-in flex h-full w-full flex-col items-center justify-center bg-gradient-to-b ${scene.bg}`}>
          <div className="flex animate-bounce gap-4 text-[#8a5530] drop-shadow-xl">
            {scene.art.map((A, k) => (
              <A key={k} size={96} strokeWidth={1.6} />
            ))}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <p key={i} className="pop-in text-center text-xl leading-snug font-extrabold text-white drop-shadow-lg">
          {stripEmoji(scene.text)}
        </p>
        <div className="mt-3 flex justify-center gap-1.5">
          {SCENES.map((_, k) => (
            <span key={k} className={`h-1.5 rounded-full ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
          ))}
        </div>
      </div>
      <button
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 rounded-full bg-black/40 px-4 py-2 text-sm font-bold text-white backdrop-blur active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
      >
        <span className="flex items-center gap-1">
          Lewati <SkipForward size={14} />
        </span>
      </button>
    </div>
  );
}
