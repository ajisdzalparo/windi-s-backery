"use client";

import { BUSINESS_HOURS, formatClock, itemOf, maxEnergy } from "@/lib/data";
import {
  Backpack,
  Bell,
  BellOff,
  Camera,
  CloudOff,
  Coins,
  Flame,
  House,
  Mail,
  Moon,
  PersonStanding,
  ScrollText,
  Shirt,
  Sun,
  Sunrise,
  Sunset,
  X,
  Zap,
} from "lucide-react";
import { ImageOr } from "./Art";
import { actionIcon, stripEmoji } from "./Icons";
import { BoutiquePanel, MainMenu } from "./Menu";
import { TutorialOverlay } from "./Tutorial";
import { QuestBanner, QuestPanel, QuestTracker, useClaimable } from "./Quests";
import { runtime } from "@/lib/runtime";
import { useGame } from "@/lib/store";
import { Joystick, KeyboardControls, TapHint } from "./Controls";
import {
  AjisDialog,
  ArchivePanel,
  BagPanel,
  CasePanel,
  CatalogPanel,
  KitchenPanel,
  LetterModal,
  MusicPanel,
  SeedPanel,
  SleepPanel,
} from "./Panels";
import { Bar } from "./ui";

const pill = "pointer-events-auto rounded-2xl border-2 border-[#8a5530] bg-[#fff6e5]/95 px-3 py-2 text-[#5b3418] shadow-[0_3px_0_#8a5530]";

function TimeIcon({ m }: { m: number }) {
  const Icon = m < 420 ? Sunrise : m < 1050 ? Sun : m < 1170 ? Sunset : Moon;
  return <Icon size={16} className={m < 1170 ? "text-amber-500" : "text-indigo-500"} strokeWidth={2.4} />;
}

/** Tanda kecil saat tidak tersambung ke server: progres tetap aman di HP dan dikirim nanti. */
function OfflineBadge() {
  const offline = useGame((s) => s.offline);
  if (!offline) return null;
  return (
    <p className="pointer-events-auto mt-2 flex w-fit items-center gap-1 rounded-full border-2 border-[#8a5530] bg-[#fff6e5]/95 px-2.5 py-1 text-[10px] font-extrabold text-[#8a5530] shadow">
      <CloudOff size={12} /> Offline · tersimpan di HP
    </p>
  );
}

function TopBar() {
  const day = useGame((s) => s.save.inGameDay);
  const minute = useGame((s) => s.minute);
  const coins = useGame((s) => s.save.coins);
  const energy = useGame((s) => s.save.energy);
  const cap = useGame((s) => maxEnergy(s.save.upgrades));
  const open = useGame((s) => s.save.shopOpen);
  const busy = open && minute >= BUSINESS_HOURS[0] && minute < BUSINESS_HOURS[1];
  return (
    <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div>
        <div className={pill}>
          <p className="flex items-center gap-1.5 text-sm font-extrabold">
            <TimeIcon m={minute} /> Hari {day} · {formatClock(minute)}
          </p>
          <p className={`flex items-center gap-1 text-[11px] font-bold ${open ? "text-green-600" : "text-stone-400"}`}>
            {open ? <Bell size={11} /> : <BellOff size={11} />}
            {open ? (busy ? "Toko buka" : "Toko buka (sepi)") : "Toko tutup"}
          </p>
        </div>
        <QuestTracker />
        <OfflineBadge />
      </div>
      {/* Uang (koin) dan tenaga (energi) dibuat terpisah dan jelas */}
      <div className="flex flex-col items-end gap-1.5">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border-2 border-[#8a5530] bg-[#fff6e5]/95 px-3 py-1.5 shadow-[0_3px_0_#8a5530]">
          <ImageOr src="/ui/coin.png" alt="koin" className="h-5 w-5" fallback={<Coins size={18} className="text-amber-600" strokeWidth={2.4} />} />
          <span className="text-sm font-extrabold text-amber-900">{coins}</span>
          <span className="text-[10px] font-bold text-amber-700">koin</span>
        </div>
        <div className="pointer-events-auto w-36 rounded-2xl border-2 border-[#8a5530] bg-[#fff6e5]/95 px-3 py-1.5 shadow-[0_3px_0_#8a5530]">
          <div className="mb-0.5 flex items-center justify-between text-[10px] font-extrabold text-stone-600">
            <span className="flex items-center gap-0.5">
              <Zap size={11} className="fill-lime-400 text-lime-600" /> Energi
            </span>
            <span className={energy <= 20 ? "text-rose-500" : ""}>
              {energy}/{cap}
            </span>
          </div>
          <Bar value={energy / cap} color={energy > 30 ? "bg-lime-400" : "bg-rose-500"} />
        </div>
      </div>
    </header>
  );
}

function SideMenu() {
  const unread = useGame((s) => s.letters.filter((l) => !l.readAt).length);
  const claimable = useClaimable();
  const { setPanel, setPhoto, setMenu } = useGame.getState();
  const items = [
    { Icon: ScrollText, label: "Misi", onClick: () => setPanel("quests"), badge: claimable },
    { Icon: Backpack, label: "Tas", onClick: () => setPanel("bag") },
    { Icon: Shirt, label: "Lemari", onClick: () => setPanel("boutique") },
    { Icon: Mail, label: "Surat", onClick: () => setPanel("archive"), badge: unread },
    { Icon: Camera, label: "Foto", onClick: () => setPhoto(true) },
    { Icon: House, label: "Menu", onClick: () => setMenu(true) },
  ];
  return (
    <nav className="pointer-events-auto absolute top-24 right-3 flex flex-col gap-1.5">
      {items.map((it) => (
        <button
          key={it.label}
          onClick={it.onClick}
          className="relative flex h-[52px] w-[52px] flex-col items-center justify-center rounded-2xl border-[3px] border-[#5b3418] bg-gradient-to-b from-[#c98a55] via-[#a86b3c] to-[#8a5530] shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_4px_0_#5b3418,0_8px_14px_rgba(0,0,0,0.25)] active:translate-y-0.5"
        >
          <it.Icon size={20} className="text-[#fff3dc] drop-shadow-[0_2px_0_#5b3418]" strokeWidth={2.4} />
          <span className="text-[9px] font-extrabold tracking-wide text-[#fff3dc] uppercase [text-shadow:0_1px_0_#5b3418]">{it.label}</span>
          {!!it.badge && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
              {it.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

/** Tombol aksi bulat dari kayu dengan lencana ikon krem dan pita label di bawahnya. */
function ActionShell({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="pop-in pointer-events-auto relative flex flex-col items-center active:translate-y-0.5">
      <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-[#5b3418] bg-gradient-to-b from-[#c98a55] via-[#a86b3c] to-[#8a5530] shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_4px_0_#5b3418,0_8px_14px_rgba(0,0,0,0.25)]">
        <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-[3px] border-[#5b3418] bg-[#fff3dc] text-[#8a5530] shadow-inner">
          {children}
        </span>
      </span>
      <span className="-mt-3 max-w-[120px] truncate rounded-xl border-2 border-[#5b3418] bg-[#f29bb0] px-3 py-0.5 text-xs font-extrabold text-white shadow [text-shadow:0_1px_0_#b25466]">
        {label}
      </span>
    </button>
  );
}

function ActionButton() {
  const nearby = useGame((s) => s.nearby);
  const sitting = useGame((s) => s.sittingAt !== null);
  if (sitting) {
    return (
      <ActionShell label="Berdiri" onClick={() => useGame.getState().standUp()}>
        <PersonStanding size={34} strokeWidth={2.4} />
      </ActionShell>
    );
  }
  if (!nearby) return <div className="h-[100px] w-[100px]" />;
  const ActionIcon = actionIcon(nearby.key, nearby.label);
  return (
    <ActionShell key={nearby.key} label={nearby.label} onClick={() => useGame.getState().interact()}>
      <ActionIcon size={34} strokeWidth={2.4} />
    </ActionShell>
  );
}

function StatusChips() {
  const bake = useGame((s) => s.bake);
  const sitting = useGame((s) => s.sittingAt !== null);
  const toast = useGame((s) => s.toast);
  const portrait = useGame((s) => s.toastPortrait);
  const sales = useGame((s) => s.sales);
  return (
    <div className="absolute inset-x-0 top-20 flex flex-col items-center gap-2 px-20">
      {toast && (
        <div key={toast} className="pop-in flex items-center gap-2 rounded-2xl border-2 border-[#5b3418] bg-gradient-to-b from-[#a86b3c] to-[#8a5530] py-1.5 pr-4 pl-1.5 text-sm font-bold text-[#fff3dc] shadow-[0_3px_0_#5b3418] [text-shadow:0_1px_0_#5b3418]">
          {portrait && (
            <ImageOr src={`/portraits/${portrait}.webp`} alt="" className="h-10 w-10 shrink-0 rounded-full bg-white object-cover object-top" fallback={null} />
          )}
          <p className={portrait ? "text-left" : "px-2 text-center"}>{stripEmoji(toast)}</p>
        </div>
      )}
      {bake && (
        <p className="flex items-center gap-1 rounded-full bg-orange-100/95 px-3 py-1 text-xs font-bold text-orange-700 shadow">
          <Flame size={13} /> Memanggang {itemOf(bake.recipeId).name}…
        </p>
      )}
      {sitting && <p className="rounded-full bg-sky-100/95 px-3 py-1 text-xs font-bold text-sky-700 shadow">Bersantai… energi pulih pelan-pelan</p>}
      {sales.map((s) => (
        <p key={s.id} className="float-up flex items-center gap-1 text-2xl font-extrabold text-amber-500 drop-shadow">
          <Coins size={22} strokeWidth={2.6} /> {stripEmoji(s.text)}
        </p>
      ))}
    </div>
  );
}

function PhotoBar() {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <button
        aria-label="Keluar dari mode foto"
        className="h-11 w-11 rounded-full bg-white/80 font-bold shadow active:scale-90"
        onClick={() => useGame.getState().setPhoto(false)}
      >
        <X size={20} className="mx-auto" />
      </button>
      <button
        aria-label="Ambil foto"
        className="h-[72px] w-[72px] rounded-full border-4 border-white bg-rose-400 shadow-lg active:scale-90"
        onClick={() => runtime.capture?.()}
      />
      <span className="w-11" />
    </div>
  );
}

export function Hud() {
  const photo = useGame((s) => s.photo);
  const panel = useGame((s) => s.panel);
  const menu = useGame((s) => s.menu);

  if (menu) {
    return (
      <div className="pointer-events-none absolute inset-0">
        {panel === null && <MainMenu />}
        {panel === "boutique" && <BoutiquePanel />}
        {panel === "archive" && <ArchivePanel />}
        <LetterModal />
      </div>
    );
  }

  if (photo) {
    return (
      <div className="pointer-events-none absolute inset-0">
        <PhotoBar />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <TopBar />
      <SideMenu />
      <StatusChips />
      <footer className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <KeyboardControls />
        <div className="flex flex-col items-start gap-2">
          <TapHint />
          <Joystick />
        </div>
        <ActionButton />
      </footer>

      {panel === "bag" && <BagPanel />}
      {panel === "kitchen" && <KitchenPanel />}
      {panel === "case" && <CasePanel />}
      {panel === "catalog" && <CatalogPanel />}
      {panel === "boutique" && <BoutiquePanel />}
      {panel === "quests" && <QuestPanel />}
      <QuestBanner />
      <TutorialOverlay />
      {panel === "seeds" && <SeedPanel />}
      {panel === "sleep" && <SleepPanel />}
      {panel === "music" && <MusicPanel />}
      {panel === "archive" && <ArchivePanel />}
      {panel === "ajis" && <AjisDialog />}
      <LetterModal />
    </div>
  );
}
