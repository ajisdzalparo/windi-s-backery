"use client";

import { useEffect, useState } from "react";
import {
  Bird,
  ChevronRight,
  Coins,
  Flame,
  Lamp,
  LandPlot,
  Lock,
  Mail,
  MessageCircle,
  Moon,
  Pause,
  PawPrint,
  Play,
  Refrigerator,
  ScrollText,
  ShoppingBasket,
  SkipBack,
  SkipForward,
  Shirt,
  Sprout,
  Store,
  Wrench,
} from "lucide-react";
import { ShopIcon, stripEmoji } from "./Icons";
import { ANIMAL_SHOP, DECOR_SHOP, FEED_SHOP, LAND_SHOP, PET_SHOP, RECIPES, SEED_SHOP, UPGRADE_SHOP, bakeEnergy, bakeSeconds, bakeYield, itemOf } from "@/lib/data";
import { trackTitle } from "@/lib/music";
import { useGame, type BuyKind, type CatalogTab } from "@/lib/store";
import { ItemIcon, Portrait } from "./Art";
import { Bar, Sheet, paperCard, primaryBtn, softBtn } from "./ui";

function ItemChip({ id, qty }: { id: string; qty?: number }) {
  const it = itemOf(id);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold">
      <ItemIcon id={id} size={18} /> {it.name}
      {qty !== undefined && <span className="text-stone-500">×{qty}</span>}
    </span>
  );
}

export function BagPanel() {
  const inv = useGame((s) => s.save.inventory);
  const entries = Object.entries(inv).sort(([a], [b]) => a.localeCompare(b));
  const groups: [string, string[]][] = [
    ["Benih & Pakan", ["seed", "supply"]],
    ["Bahan & Hasil Ternak", ["crop", "wild", "farm"]],
    ["Kue & minuman", ["product"]],
  ];
  return (
    <Sheet title="Tas">
      {entries.length === 0 && <p className="py-6 text-center text-sm text-stone-500">Tasnya kosong.</p>}
      {groups.map(([label, kinds]) => {
        const rows = entries.filter(([id]) => kinds.includes(itemOf(id).kind));
        if (!rows.length) return null;
        return (
          <section key={label} className="mb-4">
            <h3 className="mb-2 text-xs font-extrabold tracking-wide text-stone-400 uppercase">{label}</h3>
            <ul className="grid grid-cols-2 gap-2">
              {rows.map(([id, q]) => {
                const it = itemOf(id);
                return (
                  <li key={id} className="flex items-center gap-2 rounded-2xl bg-stone-50 p-2">
                    <ItemIcon id={id} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{it.name}</span>
                      <span className="text-xs text-stone-500">×{q}</span>
                    </span>
                    {it.energy && (
                      <button className={softBtn} onClick={() => useGame.getState().eat(id)}>
                        Makan
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </Sheet>
  );
}

function BakeProgress() {
  const bake = useGame((s) => s.bake);
  const secs = useGame((s) => bakeSeconds(s.save.upgrades));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);
  if (!bake) return null;
  const left = Math.max(0, bake.endsAt - now);
  return (
    <div className="mb-4 rounded-2xl bg-orange-50 p-3">
      <p className="mb-2 flex items-center gap-1 text-sm font-bold text-orange-700">
        <Flame size={15} /> Memanggang {itemOf(bake.recipeId).name}…</p>
      <Bar value={1 - left / (secs * 1000)} color="bg-orange-400" />
    </div>
  );
}

export function KitchenPanel() {
  const inv = useGame((s) => s.save.inventory);
  const unlocked = useGame((s) => s.save.unlockedRecipes);
  const baking = useGame((s) => s.bake !== null);
  const energy = useGame((s) => s.save.energy);
  const upgrades = useGame((s) => s.save.upgrades);
  const cost = bakeEnergy(upgrades);
  const fridge = upgrades.includes("fridge");
  return (
    <Sheet title="Dapur">
      <BakeProgress />
      <ul className="flex flex-col gap-2">
        {RECIPES.map((r) => {
          const locked = r.secret && !unlocked.includes(r.id);
          const needFridge = r.fridge && !fridge;
          const result = itemOf(r.result);
          const ready = Object.entries(r.needs).every(([id, n]) => (inv[id] ?? 0) >= n);
          return (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3">
              {locked ? <Lock size={30} className="mx-1 text-stone-400" /> : <ItemIcon id={r.result} size={40} />}
              <div className="min-w-0 flex-1">
                <p className="font-bold">{locked ? "Resep rahasia" : result.name}</p>
                {locked ? (
                  <p className="text-xs text-stone-500">Coba ngobrol sama Ajis di taman…</p>
                ) : (
                  <>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(r.needs).map(([id, n]) => (
                        <span
                          key={id}
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${(inv[id] ?? 0) >= n ? "bg-lime-100 text-lime-700" : "bg-rose-100 text-rose-600"}`}
                        >
                          <ItemIcon id={id} size={16} /> {inv[id] ?? 0}/{n}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-stone-500">Jual {result.price} koin · pulihkan {result.energy} energi</p>
                    {needFridge && (
                      <p className="flex items-center gap-1 text-[11px] font-bold text-sky-600">
                        <Refrigerator size={12} /> Butuh Kulkas (Katalog → Upgrade)
                      </p>
                    )}
                  </>
                )}
              </div>
              {!locked && (
                <button
                  className={softBtn}
                  disabled={!ready || baking || energy < cost || needFridge}
                  onClick={() => useGame.getState().startBake(r.id)}
                >
                  Masak
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-center text-xs text-stone-400">
        Memasak memakai {cost} energi · {bakeSeconds(upgrades)} detik{bakeYield(upgrades) > 1 ? " · hasil 2×" : ""}
      </p>
    </Sheet>
  );
}

export function CasePanel() {
  const save = useGame((s) => s.save);
  const minute = useGame((s) => s.minute);
  const { placeInCase, takeFromCase, toggleShop } = useGame.getState();
  const products = Object.entries(save.inventory).filter(([id]) => itemOf(id).kind === "product");
  const hours = minute >= 480 && minute < 1200;
  return (
    <Sheet title="Etalase">
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-stone-50 p-3">
        <div>
          <p className="font-bold"><span className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${save.shopOpen ? "bg-green-500" : "bg-red-500"}`} />
            {save.shopOpen ? "Toko buka" : "Toko tutup"}</p>
          <p className="text-xs text-stone-500">
            {save.shopOpen && !hours ? "Pelanggan datang jam 08:00–20:00" : "Pelanggan datang jam 08:00–20:00 kalau etalase berisi"}
          </p>
        </div>
        <button className={primaryBtn} onClick={toggleShop}>
          {save.shopOpen ? "Tutup" : "Buka"}
        </button>
      </div>

      <h3 className="mb-2 text-xs font-extrabold tracking-wide text-stone-400 uppercase">
        Dipajang ({save.caseItems.length}/{save.caseSlots}) — ketuk untuk ambil
      </h3>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {Array.from({ length: save.caseSlots }, (_, i) => {
          const id = save.caseItems[i];
          return (
            <button
              key={i}
              disabled={!id}
              onClick={() => takeFromCase(i)}
              className="flex h-20 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 active:scale-95"
            >
              {id ? (
                <>
                  <ItemIcon id={id} size={38} />
                  <span className="text-[11px] font-bold">{itemOf(id).price} koin</span>
                </>
              ) : (
                <span className="text-xs text-rose-300">kosong</span>
              )}
            </button>
          );
        })}
      </div>

      <h3 className="mb-2 text-xs font-extrabold tracking-wide text-stone-400 uppercase">Dari tas</h3>
      {products.length === 0 ? (
        <p className="text-sm text-stone-500">Belum ada kue. Masak dulu di oven dapur.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {products.map(([id, q]) => (
            <li key={id} className="flex items-center justify-between rounded-2xl bg-stone-50 p-2 pl-3">
              <ItemChip id={id} qty={q} />
              <button className={softBtn} disabled={save.caseItems.length >= save.caseSlots} onClick={() => placeInCase(id)}>
                Pajang
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

type Row = { id: string; name: string; icon: string; price: number; note: string; requires?: string; requiresName?: string };

/** Katalog belanja: semua dibeli dengan koin (bukan energi). */
export function CatalogPanel() {
  const tab = useGame((s) => s.catalogTab);
  const greeting = useGame((s) => s.shopGreeting);
  const save = useGame((s) => s.save);
  const { buy, setActivePet } = useGame.getState();
  const owned = [...save.upgrades, ...save.decorations];
  const tabs: [CatalogTab, string, typeof Sprout][] = [
    ["seed", "Benih", Sprout],
    ["animal", "Ternak", Bird],
    ["pet", "Hewan", PawPrint],
    ["land", "Lahan", LandPlot],
    ["upgrade", "Upgrade", Wrench],
    ["decor", "Dekor", Lamp],
  ];

  const row = (e: Row, kind: BuyKind, status: { owned?: boolean; label?: string; extra?: React.ReactNode }) => {
    const locked = !!e.requires && !owned.includes(e.requires);
    return (
      <li key={e.id} className={`flex items-center gap-3 rounded-2xl p-3 ${status.owned ? "bg-lime-50" : "bg-stone-50"}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-inner">
          {kind === "seed" ? <ItemIcon id={e.id} size={34} /> : <ShopIcon id={e.id} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight">{e.name}</p>
          <p className="text-xs text-stone-500">{e.note}</p>
          {locked && (
            <p className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Lock size={11} /> Butuh {e.requiresName}
            </p>
          )}
          {status.extra}
        </div>
        {status.owned ? (
          <span className="rounded-xl bg-lime-100 px-3 py-2 text-xs font-bold text-lime-700">{status.label ?? "Dimiliki"}</span>
        ) : (
          <button className={`${softBtn} whitespace-nowrap`} disabled={locked || save.coins < e.price} onClick={() => buy(kind, e.id)}>
            <span className="flex items-center gap-1">
              <Coins size={13} /> {e.price}
            </span>
          </button>
        )}
      </li>
    );
  };

  return (
    <Sheet title="Toko Ajis" icon={Store}>
      {greeting && (
        <div className="mb-3 flex items-start gap-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#8a5530] bg-sky-100">
            <Portrait id="ajis" fallback={<Store size={20} className="text-[#8a5530]" />} className="h-full w-full object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="rounded-2xl rounded-tl-none bg-sky-50 px-3 py-2 text-sm text-sky-900">
              <b>Ajis:</b> {stripEmoji(greeting)}
            </p>
            <button
              onClick={() => useGame.getState().chatAjis()}
              className="mt-1.5 flex items-center gap-1 rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700 active:scale-95"
            >
              <MessageCircle size={14} /> Ngobrol sama Ajis
            </button>
          </div>
        </div>
      )}
      <p className="mb-3 flex items-center gap-2 text-sm font-bold">
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-800">
          <Coins size={14} /> {save.coins} koin
        </span>
        <span className="text-xs font-normal text-stone-500">Koin didapat dari jualan kue & hadiah misi</span>
      </p>
      <div className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-stone-100 p-1">
        {tabs.map(([id, label, TabIcon]) => (
          <button
            key={id}
            onClick={() => useGame.setState({ catalogTab: id })}
            className={`flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold ${tab === id ? "bg-white text-rose-500 shadow" : "text-stone-500"}`}
          >
            <TabIcon size={14} />
            {label}
          </button>
        ))}
        <button
          onClick={() => useGame.getState().setPanel("boutique")}
          className="flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold text-stone-500"
        >
          <Shirt size={14} />
          Baju
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {tab === "seed" &&
          [...SEED_SHOP, ...FEED_SHOP].map((e) => row(e, "seed", { extra: <p className="text-[11px] text-stone-400">Punya {save.inventory[e.id] ?? 0}</p> }))}

        {/* Pakan ayam & sapi juga dijual di tab Ternak supaya gampang ditemukan */}
        {tab === "animal" &&
          FEED_SHOP.map((e) =>
            row(e, "seed", { extra: <p className="text-[11px] text-stone-400">Punya {save.inventory[e.id] ?? 0} pakan</p> }),
          )}
        {tab === "animal" &&
          ANIMAL_SHOP.map((e) => {
            const count = save.animals.filter((a) => a.kind === e.kind).length;
            return row(e, "animal", {
              owned: count >= e.max,
              label: "Kandang penuh",
              extra: <p className="text-[11px] text-stone-400">Di kandang: {count}/{e.max}</p>,
            });
          })}
        {tab === "animal" && (
          <li className="rounded-2xl bg-sky-50 p-3 text-xs text-sky-700">
            Cara beternak: beli lahan & kandang di tab Lahan, beli hewan di sini, beri <b>Pakan Ayam</b> atau <b>Pakan Sapi</b> (dijual di atas)
            sesuai hewannya tiap hari, elus biar sayang, lalu ambil telur/susu besok paginya.
          </li>
        )}

        {tab === "pet" &&
          PET_SHOP.map((e) => {
            const has = save.pets.includes(e.id);
            const active = save.activePet === e.id;
            return has ? (
              <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-lime-50 p-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-inner">
                  <ShopIcon id={e.id} />
                </span>
                <div className="flex-1">
                  <p className="font-bold">{e.name}</p>
                  <p className="text-xs text-stone-500">{active ? "Sedang ikut Windi" : "Di rumah"}</p>
                </div>
                <button className={softBtn} onClick={() => setActivePet(active ? null : e.id)}>
                  {active ? "Tinggal" : "Ajak"}
                </button>
              </li>
            ) : (
              row(e, "pet", {})
            );
          })}

        {tab === "land" && LAND_SHOP.map((e) => row(e, "land", { owned: save.upgrades.includes(e.id) }))}
        {tab === "upgrade" && UPGRADE_SHOP.map((e) => row(e, "upgrade", { owned: save.upgrades.includes(e.id) }))}
        {tab === "decor" && DECOR_SHOP.map((e) => row(e, "decor", { owned: save.decorations.includes(e.id) }))}
      </ul>
    </Sheet>
  );
}

export function SeedPanel() {
  const inv = useGame((s) => s.save.inventory);
  const plot = useGame((s) => s.seedPlot);
  return (
    <Sheet title="Tanam apa?">
      <div className="grid grid-cols-2 gap-2">
        {SEED_SHOP.map((e) => (
          <button
            key={e.id}
            disabled={(inv[e.id] ?? 0) < 1 || plot === null}
            onClick={() => plot !== null && useGame.getState().plant(plot, e.id)}
            className="flex flex-col items-center gap-1 rounded-2xl bg-stone-50 p-4 active:scale-95 disabled:opacity-40"
          >
            <ItemIcon id={e.id} size={38} />
            <span className="font-bold">{e.name}</span>
            <span className="text-xs text-stone-500">punya {inv[e.id] ?? 0}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function SleepPanel() {
  const day = useGame((s) => s.save.inGameDay);
  return (
    <Sheet title="Tidur?">
      <p className="mb-4 text-sm text-stone-600">
        Tidur sampai pagi hari ke-{day + 1}. Energi pulih penuh, kebun yang disiram akan tumbuh, dan game tersimpan.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-2xl bg-stone-100 py-3 font-bold active:scale-95" onClick={() => useGame.getState().setPanel(null)}>
          Nanti dulu
        </button>
        <button className={primaryBtn} onClick={() => useGame.getState().sleep()}>
          <span className="flex items-center justify-center gap-1.5">
            <Moon size={16} /> Tidur
          </span>
        </button>
      </div>
    </Sheet>
  );
}

export function MusicPanel() {
  const music = useGame((s) => s.music);
  const { toggleMusic, skipTrack } = useGame.getState();
  const round = "h-12 w-12 rounded-full bg-rose-50 text-xl text-rose-500 active:scale-90";
  return (
    <Sheet title="Radio">
      <p className="text-center text-sm text-stone-500">{music.on ? "Sedang diputar" : "Berhenti"}</p>
      <p className="mb-4 text-center text-lg font-extrabold">{trackTitle(music.index)}</p>
      <div className="flex items-center justify-center gap-5">
        <button className={round} aria-label="Lagu sebelumnya" onClick={() => skipTrack(-1)}>
          <SkipBack size={20} className="mx-auto" />
        </button>
        <button
          className="h-16 w-16 rounded-full bg-rose-400 text-2xl text-white shadow active:scale-90"
          aria-label={music.on ? "Jeda" : "Putar"}
          onClick={toggleMusic}
        >
          {music.on ? <Pause size={26} className="mx-auto" /> : <Play size={26} className="mx-auto" />}
        </button>
        <button className={round} aria-label="Lagu berikutnya" onClick={() => skipTrack(1)}>
          <SkipForward size={20} className="mx-auto" />
        </button>
      </div>
    </Sheet>
  );
}

export function ArchivePanel() {
  const letters = useGame((s) => s.letters);
  const read = letters.filter((l) => l.readAt).sort((a, b) => (a.readAt! < b.readAt! ? 1 : -1));
  const unread = letters.length - read.length;
  return (
    <Sheet title="Arsip surat">
      {unread > 0 && (
        <p className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">
          Ada {unread} surat yang masih tersembunyi di kota. Cari kilauan pink!
        </p>
      )}
      {read.length === 0 ? (
        <p className="py-6 text-center text-sm text-stone-500">Belum ada surat yang dibaca.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {read.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => useGame.getState().openLetter(l.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-rose-50 p-3 text-left active:scale-[0.98]"
              >
                <Mail size={24} className="text-rose-400" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{l.title}</span>
                  <span className="block text-xs text-stone-500">
                    Dibaca {new Date(l.readAt!).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

export function AjisDialog() {
  const ajis = useGame((s) => s.ajis);
  const line = ajis.lines[ajis.index];
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#3b2414]/35 to-transparent p-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={() => useGame.getState().nextAjisLine()}
    >
      {/* Kotak dialog bergaya kartu tutorial: potret di kiri, papan nama di atas, ketuk untuk lanjut */}
      <div key={`${ajis.name}${ajis.index}`} className={`pop-in relative mt-10 w-full max-w-md p-4 pt-6 pl-[92px] ${paperCard}`}>
        <div className="absolute -top-8 left-2 flex h-[84px] w-[84px] items-end justify-center overflow-hidden rounded-full border-4 border-[#8a5530] bg-[#fde7ef] shadow-md">
          <Portrait id={ajis.portrait} fallback={<MessageCircle size={34} className="mb-5 text-[#8a5530]" />} className="h-full w-full object-cover object-top" />
        </div>
        <span className="absolute -top-4 left-[96px] rounded-xl border-2 border-[#5b3418] bg-gradient-to-b from-[#c98a55] to-[#8a5530] px-3 py-0.5 text-sm font-extrabold text-[#fff3dc] shadow-[0_2px_0_#5b3418] [text-shadow:0_1px_0_#5b3418]">
          {ajis.name}
        </span>
        <p className="min-h-12 text-[15px] leading-relaxed text-[#5b3418]">{stripEmoji(line ?? "")}</p>
        <div className="mt-2 flex justify-end">
          <span className="flex items-center gap-1 rounded-xl border-2 border-[#5b3418] bg-gradient-to-b from-[#c98a55] to-[#8a5530] px-3 py-1 text-xs font-extrabold text-[#fff3dc] shadow-[0_2px_0_#5b3418] [text-shadow:0_1px_0_#5b3418]">
            {ajis.index + 1 < ajis.lines.length ? "Lanjut" : "Tutup"} <ChevronRight size={14} strokeWidth={3} />
          </span>
        </div>
      </div>
    </div>
  );
}

export function LetterModal() {
  const letter = useGame((s) => s.letters.find((l) => l.id === s.openLetterId));
  if (!letter) return null;
  const close = () => useGame.getState().closeLetter();
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-[#3b2414]/40 p-5 backdrop-blur-sm" onClick={close}>
      <article className={`pop-in flex max-h-[82dvh] w-full max-w-sm flex-col ${paperCard}`} onClick={(e) => e.stopPropagation()}>
        <div className="overflow-y-auto p-6">
          <Mail size={36} className="mx-auto mb-1 text-rose-400" />
          <h2 className="mb-4 text-center text-xl font-extrabold text-rose-500">{letter.title}</h2>
          {letter.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={letter.photoUrl} alt="" className="mb-4 w-full rounded-2xl border-4 border-white shadow" />
          )}
          <p className="whitespace-pre-line leading-relaxed">{letter.body}</p>
          <p className="mt-5 text-right text-sm font-bold text-rose-400">— Ajis</p>
        </div>
        <div className="p-4 pt-0">
          <button className={`${primaryBtn} w-full`} onClick={close}>
            Simpan ke arsip
          </button>
        </div>
      </article>
    </div>
  );
}
