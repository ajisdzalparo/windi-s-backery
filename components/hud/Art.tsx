"use client";

// Gambar opsional dari folder public (hasil generate GPT). Kalau filenya belum ada, tampilkan cadangan (ikon/teks).
import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { itemOf } from "@/lib/data";
import { ITEM_ICONS } from "./Icons";

const failed = new Set<string>();

export function ImageOr({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback: React.ReactNode }) {
  const [bad, setBad] = useState(() => failed.has(src));
  if (bad) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => {
        failed.add(src);
        setBad(true);
      }}
    />
  );
}

/** Ikon item: public/icons/<itemId>.png, atau ikon Lucide berwarna kalau gambarnya belum ada. */
export function ItemIcon({ id, size = 28 }: { id: string; size?: number }) {
  const look = ITEM_ICONS[id];
  const Icon = look?.Icon ?? CircleHelp;
  return (
    <span className="inline-flex shrink-0 items-center justify-center align-middle" style={{ width: size, height: size }}>
      <ImageOr
        src={`/icons/${id}.webp`}
        alt={itemOf(id).name}
        className="h-full w-full object-contain"
        fallback={
          <span
            className="inline-flex h-full w-full items-center justify-center rounded-[30%]"
            style={{ background: look?.bg ?? "#f5f5f4", color: look?.color ?? "#78716c" }}
          >
            <Icon size={Math.round(size * 0.66)} strokeWidth={2.2} />
          </span>
        }
      />
    </span>
  );
}

/** Potret karakter untuk dialog: public/portraits/<id>.png. */
export function Portrait({ id, fallback, className }: { id: string; fallback: React.ReactNode; className?: string }) {
  return <ImageOr src={`/portraits/${id}.webp`} alt={id} className={className} fallback={fallback} />;
}
