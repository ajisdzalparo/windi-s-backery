"use client";

// Komponen UI bersama bertema toko roti: kertas krem dengan bingkai kayu cokelat.
import { X, type LucideIcon } from "lucide-react";
import { useGame } from "@/lib/store";
import { stripEmoji } from "./Icons";

/** Tombol utama: papan kayu. */
export const primaryBtn =
  "rounded-2xl border-[3px] border-[#5b3418] bg-gradient-to-b from-[#c98a55] via-[#a86b3c] to-[#8a5530] px-4 py-2.5 font-extrabold text-[#fff3dc] shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_3px_0_#5b3418] [text-shadow:0_1px_0_#5b3418] active:translate-y-0.5 disabled:border-stone-300 disabled:from-stone-200 disabled:via-stone-200 disabled:to-stone-200 disabled:text-stone-400 disabled:shadow-none disabled:[text-shadow:none]";

/** Tombol kecil: krem dengan garis cokelat. */
export const softBtn =
  "rounded-xl border-2 border-[#a86b3c] bg-[#fff3dc] px-3 py-1.5 text-sm font-extrabold text-[#8a5530] shadow-[0_2px_0_#a86b3c] active:translate-y-0.5 disabled:border-stone-300 disabled:text-stone-400 disabled:shadow-none";

/** Kartu kertas krem berbingkai kayu (dipakai popup, surat, dialog). */
export const paperCard = "rounded-3xl border-4 border-[#8a5530] bg-[#fff6e5] shadow-[0_6px_0_#5b3418,0_14px_30px_rgba(60,30,10,0.35)]";

/** Panel bawah (tas, dapur, toko, misi, dll.). */
export function Sheet({ title, children, short, icon: Icon }: { title: string; children: React.ReactNode; short?: boolean; icon?: LucideIcon }) {
  const close = () => useGame.getState().setPanel(null);
  return (
    <div className={`pointer-events-auto absolute inset-0 flex items-end justify-center ${short ? "" : "bg-[#3b2414]/20"}`} onClick={close}>
      <div
        className={`pop-in ${short ? "max-h-[48dvh]" : "max-h-[72dvh]"} w-full max-w-md overflow-y-auto rounded-t-[2rem] border-x-4 border-t-4 border-[#8a5530] bg-[#fff6e5] p-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(60,30,10,0.3)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#d9b48a]" />
        <div className="mb-4 flex items-center justify-between">
          {/* Papan nama kayu */}
          <h2 className="flex items-center gap-2 rounded-xl border-2 border-[#5b3418] bg-gradient-to-b from-[#c98a55] to-[#8a5530] px-3 py-1 text-base font-extrabold text-[#fff3dc] shadow-[0_2px_0_#5b3418] [text-shadow:0_1px_0_#5b3418]">
            {Icon && <Icon size={18} strokeWidth={2.5} />}
            {stripEmoji(title)}
          </h2>
          <button
            onClick={close}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#a86b3c] bg-[#fff3dc] text-[#8a5530] active:scale-90"
          >
            <X size={18} strokeWidth={2.6} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Popup di tengah layar (Tentang, konfirmasi, dll.). */
export function Popup({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[#3b2414]/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className={`pop-in w-full max-w-sm p-6 text-center ${paperCard}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#d9b48a] bg-[#f3e3cc]">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
    </div>
  );
}
