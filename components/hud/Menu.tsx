"use client";

import { useEffect, useState } from "react";
import {
  Cake,
  CakeSlice,
  Check,
  Clapperboard,
  Coins,
  Cookie,
  Croissant,
  Download,
  GraduationCap,
  Heart,
  Info,
  type LucideIcon,
  Mail,
  Shirt,
  Sparkles,
  Volume2,
  VolumeX,
  Wheat,
} from "lucide-react";
import { stripEmoji } from "./Icons";
import { OUTFITS, getOutfit } from "@/lib/data";
import { isMuted, setMuted } from "@/lib/sfx";
import { useGame } from "@/lib/store";
import { ImageOr } from "./Art";
import { IntroCutscene } from "./Intro";
import { Popup, Sheet, primaryBtn } from "./ui";

/** Butik baju: ketuk baju untuk mencoba langsung di Windi, lalu beli atau pakai. */
export function BoutiquePanel() {
  const save = useGame((s) => s.save);
  const preview = useGame((s) => s.previewOutfit);
  // Di Toko Ajis bisa beli; di tempat lain hanya lemari untuk ganti baju yang sudah dimiliki.
  const atShop = useGame((s) => s.atShop);
  const { setPreview, buy, wear } = useGame.getState();
  const selected = getOutfit(preview ?? save.outfitId);
  const owned = save.ownedOutfits.includes(selected.id);
  const worn = save.outfitId === selected.id;

  return (
    <Sheet title={atShop ? "Baju di Toko Ajis" : "Lemari Baju"} icon={Shirt} short>
      <div className="-mx-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-1">
        {OUTFITS.map((o) => {
          const isSel = o.id === selected.id;
          const has = save.ownedOutfits.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => setPreview(o.id)}
              className={`flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl border-2 p-2 active:scale-95 ${isSel ? "border-rose-400 bg-rose-50" : "border-transparent bg-stone-50"}`}
            >
              {/* Gambar baju dari public/outfits/<id>.png kalau sudah ada; kalau belum, swatch warna */}
              <ImageOr
                src={`/outfits/${o.id}.webp`}
                alt={o.name}
                className="h-14 w-14 object-contain"
                fallback={
                  <span className="relative flex h-12 w-10 flex-col overflow-hidden rounded-lg shadow-inner">
                    <span className="flex-1" style={{ background: o.top }} />
                    {o.apron && <span className="h-2" style={{ background: o.apron }} />}
                    <span className="flex-1" style={{ background: o.bottom }} />
                    {(o.bow || o.hat) && <Sparkles size={12} className="absolute -top-1 -right-1 text-rose-500" />}
                  </span>
                }
              />
              <span className="w-full truncate text-center text-[11px] font-bold">{o.name}</span>
              <span className="text-[10px] text-stone-500">{save.outfitId === o.id ? "Dipakai" : has ? "Punya" : `${o.price} koin`}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3">
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">{selected.name}</p>
          <p className="truncate text-xs text-stone-500">{stripEmoji(selected.note ?? "")}</p>
          <p className="text-xs font-bold text-rose-500">Saldo {save.coins} koin</p>
        </div>
        {worn ? (
          <span className="flex items-center gap-1 rounded-2xl bg-lime-100 px-4 py-3 text-sm font-bold text-lime-700">
            <Check size={16} /> Dipakai
          </span>
        ) : owned ? (
          <button
            className={primaryBtn}
            onClick={() => {
              wear(selected.id);
              setPreview(null);
            }}
          >
            Pakai
          </button>
        ) : !atShop ? (
          <span className="max-w-32 rounded-2xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-700">
            Beli di Toko Ajis ({selected.price} koin)
          </span>
        ) : (
          <button
            className={primaryBtn}
            disabled={save.coins < selected.price}
            onClick={() => {
              buy("outfit", selected.id);
              setPreview(null);
            }}
          >
            Beli · {selected.price} koin
          </button>
        )}
      </div>
    </Sheet>
  );
}

function About({ onClose }: { onClose: () => void }) {
  return (
    <Popup onClose={onClose}>
      <div>
        <ImageOr src="/ui/logo.webp" alt="Windi's Sweet Bakery" className="mx-auto mb-3 h-28 object-contain" fallback={<Cake size={44} className="mx-auto mb-2 text-[#a86b3c]" />} />
        <p className="mb-4 text-sm leading-relaxed text-[#5b3418]">
          Dunia kecil ini dibuat khusus buat Windi. Rawat kebun, panggang kue, sapa warga kota, dan jangan lupa cari surat yang tersembunyi
          setiap hari.
        </p>
        <p className="mb-5 flex items-center justify-center gap-1 text-sm font-extrabold text-[#c9677f]">
          <Heart size={14} className="fill-[#f29bb0]" /> Dibuat dengan sayang oleh Ajis
        </p>
        <button className={`${primaryBtn} w-full`} onClick={onClose}>
          Tutup
        </button>
      </div>
    </Popup>
  );
}

/** Tombol papan kayu dengan lencana ikon bulat di kiri, seperti referensi. */
function WoodButton({ icon: Icon, label, onClick, badge, big }: { icon: LucideIcon; label: string; onClick: () => void; badge?: number; big?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-2 rounded-2xl border-[3px] border-[#5b3418] bg-linear-to-b from-[#c98a55] via-[#a86b3c] to-[#8a5530] pr-3 pl-1.5 font-extrabold tracking-wide text-[#fff3dc] uppercase shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_4px_0_#5b3418,0_8px_14px_rgba(0,0,0,0.25)] [text-shadow:0_2px_0_#5b3418] active:translate-y-0.5 ${big ? "py-2 text-base" : "py-1.5 text-sm"}`}
    >
      <span className={`flex shrink-0 items-center justify-center rounded-full border-2 border-[#5b3418] bg-[#fff3dc] text-[#8a5530] shadow-inner ${big ? "h-10 w-10" : "h-8 w-8"}`}>
        <Icon size={big ? 20 : 16} strokeWidth={2.6} />
      </span>
      <span className="flex-1 text-center">{label}</span>
      {!!badge && (
        <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[11px] text-white text-shadow-none">
          {badge}
        </span>
      )}
    </button>
  );
}

/** Tombol PLAY besar berbentuk roti di atas talenan kayu. */
function BreadPlay({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative mx-auto block w-full max-w-85 active:translate-y-1">
      {/* talenan */}
      <span className="absolute inset-x-[-6%] top-[18%] bottom-[-12%] rounded-[2.2rem] border-[3px] border-[#5b3418] bg-linear-to-b from-[#b07a45] to-[#8a5530] shadow-[0_8px_18px_rgba(0,0,0,0.3)]" />
      <span className="absolute top-[42%] right-[-9%] h-5 w-9 rounded-full border-[3px] border-[#5b3418] bg-[#a86b3c]" />
      {/* roti */}
      <span className="relative block rounded-[50%/60%] border-[3px] border-[#7a4520] bg-linear-to-b from-[#f8c47c] via-[#eba352] to-[#c97a33] px-6 pt-3 pb-4 text-center shadow-[inset_0_6px_0_rgba(255,255,255,0.45),inset_0_-6px_0_rgba(122,69,32,0.25)]">
        <span className="pointer-events-none absolute inset-x-[18%] top-2 flex justify-between">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-2 w-6 rotate-[-20deg] rounded-full bg-[#fff1d6]/70" />
          ))}
        </span>
        <span className="block text-4xl leading-none font-black tracking-widest text-[#5b3418] [text-shadow:0_2px_0_rgba(255,255,255,0.6)]">{label}</span>
        <span className="mt-1 block text-[11px] font-extrabold text-[#7a4520]">{sub}</span>
      </span>
    </button>
  );
}

/** Logo hasil generate (public/ui/logo.webp); cadangannya lencana teks. */
function Logo({ className }: { className: string }) {
  return (
    <ImageOr
      src="/ui/logo.webp"
      alt="Windi's Sweet Bakery"
      className={`mx-auto object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)] ${className}`}
      fallback={
        <div className="mx-auto w-fit rounded-[2.5rem] border-[5px] border-[#6b3f22] bg-[#fff6e5] px-8 pt-3 pb-4 text-center">
          <p className="text-4xl leading-none font-black text-[#6b3f22]">Windi&apos;s</p>
          <p className="text-5xl leading-tight font-black text-[#f29bb0]">Sweet</p>
          <p className="text-4xl leading-none font-black text-[#6b3f22]">Bakery</p>
        </div>
      }
    />
  );
}

/** Bingkai krem dengan hiasan roti & kue di sudut, seperti referensi. */
function Frame() {
  const corner = "absolute h-12 w-12 drop-shadow md:h-14 md:w-14";
  const icon = (id: string, cls: string) => (
    <ImageOr src={`/icons/${id}.webp`} alt="" className={`${corner} ${cls}`} fallback={null} />
  );
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-2 rounded-[1.75rem] border-[3px] border-[#fff3dc]/80 shadow-[inset_0_0_0_2px_rgba(138,85,48,0.35)] md:inset-3" />
      {icon("bread", "top-0 left-0")}
      {icon("strawberry_cake", "top-0 right-0")}
      {icon("pancake", "bottom-0 left-0")}
      {icon("sponge_cake", "right-0 bottom-0")}
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function InstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <Popup onClose={onClose}>
      <div>
        <Download size={40} className="mx-auto mb-2 text-[#a86b3c]" />
        <p className="mb-2 text-base font-extrabold text-[#5b3418]">Pasang Aplikasi di HP</p>
        <p className="mb-3 text-sm leading-relaxed text-[#5b3418]">
          Supaya bisa dimainkan <b>layar penuh (fullscreen)</b> seperti game asli dan tetap jalan walau tanpa sinyal:
        </p>
        <div className="mb-4 rounded-2xl bg-[#fff3dc] p-3 text-left text-xs leading-relaxed text-[#5b3418]">
          <p className="mb-1.5">
            <b>📱 iPhone / iPad (Safari):</b> Ketuk tombol <b>Bagikan (Share)</b> di bawah layar, lalu pilih <b>Tambahkan ke Layar Utama (Add to Home Screen)</b>.
          </p>
          <p>
            <b>🤖 Android (Chrome):</b> Ketuk menu <b>⋮</b> di pojok kanan atas browser, lalu pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.
          </p>
        </div>
        <button className={`${primaryBtn} w-full`} onClick={onClose}>
          Mengerti
        </button>
      </div>
    </Popup>
  );
}

/** Menu utama bergaya ilustrasi toko roti: tata letak lebar di laptop/landscape, bertumpuk di HP. */
export function MainMenu() {
  const day = useGame((s) => s.save.inGameDay);
  const coins = useGame((s) => s.save.coins);
  const fresh = useGame((s) => !s.save.tutorialDone && s.save.inGameDay === 1);
  const unread = useGame((s) => s.letters.filter((l) => !l.readAt).length);
  const [muted, setMutedState] = useState(isMuted);
  const [about, setAbout] = useState(false);
  const [intro, setIntro] = useState(false);
  const [installGuide, setInstallGuide] = useState(false);
  const [installed, setInstalled] = useState(isStandalonePwa);
  const [, setPromptTick] = useState(0);
  const { setMenu, setPanel, startTutorial } = useGame.getState();

  useEffect(() => {
    setInstalled(isStandalonePwa());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredInstallPrompt = e as BeforeInstallPromptEvent;
      setPromptTick((n) => n + 1);
    };
    const onInstalled = () => {
      deferredInstallPrompt = null;
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const installPwa = async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") {
        deferredInstallPrompt = null;
        setInstalled(true);
      }
    } else {
      setInstallGuide(true);
    }
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    const s = useGame.getState();
    if (s.music.on === next) s.toggleMusic();
  };

  // Pemain baru menonton intro dulu, lalu tutorial dimulai otomatis.
  const enterFullscreen = () => {
    if (typeof document === "undefined") return;
    const doc = document as Document & { webkitFullscreenElement?: Element };
    if (doc.fullscreenElement || doc.webkitFullscreenElement) return;
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      if (el.requestFullscreen) {
        void el.requestFullscreen().catch(() => undefined);
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch {
      // Abaikan jika browser menolak fullscreen
    }
  };

  const play = () => {
    enterFullscreen();
    if (fresh) setIntro(true);
    else setMenu(false);
  };
  const buttons = (
    <>
      <WoodButton icon={Shirt} label="Lemari" onClick={() => setPanel("boutique")} />
      <WoodButton icon={Mail} label="Surat" onClick={() => setPanel("archive")} badge={unread} />
      <WoodButton
        icon={GraduationCap}
        label="Tutorial"
        onClick={() => {
          enterFullscreen();
          startTutorial();
        }}
      />
      <WoodButton icon={Clapperboard} label="Intro" onClick={() => setIntro(true)} />
      <WoodButton icon={muted ? VolumeX : Volume2} label={muted ? "Suara mati" : "Suara"} onClick={toggleSound} />
      <WoodButton icon={Info} label="Tentang" onClick={() => setAbout(true)} />
      {!installed && (
        <div className="col-span-2">
          <WoodButton icon={Download} label="Pasang Aplikasi (Layar Penuh)" onClick={() => void installPwa()} />
        </div>
      )}
    </>
  );
  const playBtn = <BreadPlay label={fresh ? "MULAI" : "LANJUT"} sub={`Hari ${day} · ${coins} koin`} onClick={play} />;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f3dfc2]">
      {/* Latar: versi blur memenuhi layar + ilustrasi tajam di kiri (lebar) / penuh (HP) */}
      <ImageOr src="/ui/menu-bg.jpg" alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-md brightness-105" fallback={null} />
      <ImageOr
        src="/ui/menu-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover landscape:right-auto landscape:w-auto landscape:max-w-[62%] landscape:mask-[linear-gradient(to_right,black_75%,transparent)]"
        fallback={null}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(120,70,30,0.35)_100%)]" />
      <Frame />

      {/* Tata letak HP (potret) */}
      <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-between gap-6 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] landscape:hidden">
        <div className="pop-in w-full">
          <Logo className="max-h-[24vh] w-full max-w-75" />
        </div>
        <div className="pop-in flex w-full max-w-sm flex-col gap-4">
          {playBtn}
          <div className="mt-2 grid grid-cols-2 gap-2.5">{buttons}</div>
        </div>
      </div>

      {/* Tata letak lebar (laptop / HP miring) */}
      <div className="pointer-events-auto absolute inset-0 hidden grid-cols-[1fr_minmax(300px,38%)_1fr] items-center gap-4 px-8 py-6 landscape:grid">
        <div />
        <div className="pop-in flex h-full flex-col items-center justify-center gap-[2.5vh]">
          <Logo className="max-h-[36vh] w-full max-w-105" />
          <div className="grid w-full max-w-105 grid-cols-2 gap-3">{buttons}</div>
          <div className="mt-[1vh] w-full max-w-85">{playBtn}</div>
        </div>
        <div />
      </div>

      {about && <About onClose={() => setAbout(false)} />}
      {installGuide && <InstallGuide onClose={() => setInstallGuide(false)} />}
      {intro && (
        <IntroCutscene
          onDone={() => {
            setIntro(false);
            if (fresh) setMenu(false);
          }}
        />
      )}
    </div>
  );
}
