"use client";

import { useState } from "react";
import { Circle, CircleCheck, Gift, MapPin, ScrollText, Trophy } from "lucide-react";
import { stripEmoji } from "./Icons";
import { DECOR_SHOP, OUTFITS, itemOf } from "@/lib/data";
import { STORY, claimableCount, dailyQuest, isDone, storyQuest, type Quest, type Reward } from "@/lib/quests";
import { useGame } from "@/lib/store";
import { Bar, Sheet, primaryBtn } from "./ui";

function rewardText(r: Reward) {
  return [
    r.coins ? `${r.coins} koin` : "",
    ...Object.entries(r.items ?? {}).map(([id, n]) => `${n} ${itemOf(id).name}`),
    r.decor ? `${DECOR_SHOP.find((d) => d.id === r.decor)?.name ?? ""}` : "",
    r.outfit ? `baju ${OUTFITS.find((o) => o.id === r.outfit)?.name ?? ""}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function QuestCard({ quest, progress, label, claimed, onClaim }: { quest: Quest; progress: number[]; label: string; claimed?: boolean; onClaim: () => void }) {
  const done = isDone(quest, progress);
  return (
    <div className={`rounded-2xl border-2 p-3 ${done && !claimed ? "border-amber-300 bg-amber-50" : "border-transparent bg-stone-50"}`}>
      <p className="text-[11px] font-extrabold tracking-wide text-rose-400 uppercase">{label}</p>
      <p className="font-extrabold">{quest.title}</p>
      <p className="mb-2 text-xs text-stone-500">{stripEmoji(quest.desc)}</p>
      <ul className="mb-2 flex flex-col gap-1.5">
        {quest.objectives.map((o, i) => {
          const p = Math.min(o.target, progress[i] ?? 0);
          return (
            <li key={i}>
              <div className="mb-0.5 flex justify-between text-xs font-bold">
                <span>
                  {p >= o.target ? <CircleCheck size={13} className="mr-1 inline text-lime-600" /> : <Circle size={13} className="mr-1 inline text-stone-300" />}
                  {o.label}
                </span>
                <span className="text-stone-500">
                  {p}/{o.target}
                </span>
              </div>
              <Bar value={p / o.target} color={p >= o.target ? "bg-lime-400" : "bg-rose-300"} />
            </li>
          );
        })}
      </ul>
      {quest.hint && !done && (
        <p className="mb-2 flex items-center gap-1 text-[11px] font-bold text-sky-600">
          <MapPin size={12} /> {stripEmoji(quest.hint)}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-xs font-bold text-stone-600">
          <Gift size={13} className="text-rose-400" /> {rewardText(quest.reward)}
        </p>
        {claimed ? (
          <span className="rounded-xl bg-lime-100 px-3 py-1.5 text-xs font-bold text-lime-700">Diklaim</span>
        ) : (
          <button className={`${primaryBtn} px-3 py-2 text-sm`} disabled={!done} onClick={onClaim}>
            Klaim
          </button>
        )}
      </div>
    </div>
  );
}

export function QuestPanel() {
  const q = useGame((s) => s.save.quests);
  const [tab, setTab] = useState<"story" | "daily">("story");
  const { claimQuest } = useGame.getState();
  const story = storyQuest(q);
  const dailyReady = q.daily.filter((d) => !d.claimed && isDone(dailyQuest(d.id)!, d.progress)).length;
  const storyReady = story && isDone(story, q.storyProgress) ? 1 : 0;

  return (
    <Sheet title="Misi" icon={ScrollText}>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1">
        {(
          [
            ["story", "Cerita", storyReady],
            ["daily", "Harian", dailyReady],
          ] as const
        ).map(([id, label, n]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative rounded-xl py-2 text-sm font-bold ${tab === id ? "bg-white text-rose-500 shadow" : "text-stone-500"}`}
          >
            {label}
            {n > 0 && <span className="ml-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{n}</span>}
          </button>
        ))}
      </div>

      {tab === "story" && (
        <>
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-xs font-bold text-stone-500">
              <span>Progres cerita</span>
              <span>
                {Math.min(q.storyIndex, STORY.length)}/{STORY.length} bab
              </span>
            </div>
            <Bar value={q.storyIndex / STORY.length} color="bg-rose-400" />
          </div>
          {story ? (
            <QuestCard quest={story} progress={q.storyProgress} label={`Bab ${q.storyIndex + 1}`} onClaim={() => claimQuest("story")} />
          ) : (
            <div className="rounded-2xl bg-rose-50 p-5 text-center">
              <Trophy size={40} className="mx-auto text-amber-500" />
              <p className="font-extrabold text-rose-500">Semua misi cerita selesai!</p>
              <p className="text-sm text-stone-500">Windi&apos;s Sweet Bakery resmi jadi toko kue terkenal. Terus kerjakan misi harian ya!</p>
            </div>
          )}
          {q.storyIndex > 0 && (
            <p className="mt-3 text-center text-xs text-stone-400">
              Selesai: {STORY.slice(0, q.storyIndex).map((s) => s.title).join(" · ")}
            </p>
          )}
        </>
      )}

      {tab === "daily" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-stone-500">Misi harian berganti setiap Windi tidur.</p>
          {q.daily.map((slot, i) => (
            <QuestCard
              key={slot.id}
              quest={dailyQuest(slot.id)!}
              progress={slot.progress}
              label={`Harian ${i + 1}`}
              claimed={slot.claimed}
              onClaim={() => claimQuest(i)}
            />
          ))}
        </div>
      )}
    </Sheet>
  );
}

/** Pelacak misi aktif di bawah jam; ketuk untuk membuka daftar misi. */
export function QuestTracker() {
  const q = useGame((s) => s.save.quests);
  const story = storyQuest(q);
  const ready = claimableCount(q);
  const open = () => useGame.getState().setPanel("quests");

  if (!story) {
    return ready > 0 ? (
      <button onClick={open} className="pointer-events-auto mt-2 rounded-2xl bg-amber-100/95 px-3 py-2 text-left text-xs font-extrabold text-amber-700 shadow">
        <Gift size={13} className="mr-1 inline" />
        {ready} hadiah misi siap diklaim
      </button>
    ) : null;
  }
  const idx = quest_firstUnfinished(story, q.storyProgress);
  const o = story.objectives[idx];
  const done = isDone(story, q.storyProgress);
  return (
    <button
      onClick={open}
      className={`pointer-events-auto mt-2 block w-44 rounded-2xl px-3 py-2 text-left shadow-md backdrop-blur ${done ? "bg-amber-100/95" : "bg-white/85"}`}
    >
      <p className="truncate text-[10px] font-extrabold tracking-wide text-rose-400 uppercase">
        Bab {q.storyIndex + 1} · {story.title}
      </p>
      {done ? (
        <p className="flex items-center gap-1 text-xs font-extrabold text-amber-700">
          <Gift size={13} /> Selesai! Ketuk untuk klaim
        </p>
      ) : (
        <p className="text-xs leading-tight font-bold">
          {o.label}{" "}
          <span className="text-stone-500">
            {Math.min(o.target, q.storyProgress[idx] ?? 0)}/{o.target}
          </span>
        </p>
      )}
      {ready > (done ? 1 : 0) && <p className="mt-0.5 text-[10px] font-bold text-amber-600">+ hadiah harian siap diklaim</p>}
    </button>
  );
}

function quest_firstUnfinished(quest: Quest, progress: number[]) {
  const i = quest.objectives.findIndex((o, k) => (progress[k] ?? 0) < o.target);
  return i < 0 ? 0 : i;
}

/** Pita besar "Misi Selesai!" saat sebuah misi tuntas. */
export function QuestBanner() {
  const banner = useGame((s) => s.questBanner);
  if (!banner) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center px-6">
      <div key={banner.id} className="pop-in rounded-3xl border-4 border-white bg-gradient-to-r from-amber-300 to-rose-400 px-6 py-3 text-center shadow-2xl">
        <p className="text-xs font-extrabold tracking-[0.25em] text-white/90 uppercase">Misi Selesai</p>
        <p className="text-xl font-extrabold text-white drop-shadow">{banner.title}</p>
        <p className="text-xs font-bold text-white/90">Buka menu Misi untuk klaim hadiah</p>
      </div>
    </div>
  );
}

export function useClaimable() {
  return useGame((s) => claimableCount(s.save.quests));
}
