"use client";

import { TUTORIAL, type Highlight } from "@/lib/tutorial";
import { useGame } from "@/lib/store";
import { Cake, Hourglass } from "lucide-react";
import { Portrait } from "./Art";
import { stripEmoji } from "./Icons";

/** Cincin berdenyut di sekitar bagian layar yang sedang dijelaskan. */
function Ring({ where }: { where: Highlight }) {
  const pos: Record<Highlight, string> = {
    joystick: "bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 h-[152px] w-[152px] rounded-full",
    action: "bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 h-[112px] w-[112px] rounded-full",
    top: "top-[max(0.25rem,env(safe-area-inset-top))] inset-x-1 h-[86px] rounded-3xl",
    side: "top-[92px] right-1 h-[400px] w-[60px] rounded-3xl",
    tracker: "top-[78px] left-1 h-[76px] w-[188px] rounded-3xl",
  };
  return <div className={`pointer-events-none absolute border-4 border-amber-300 shadow-[0_0_0_6px_rgba(251,191,36,0.25)] animate-pulse ${pos[where]}`} />;
}

export function TutorialOverlay() {
  const stepIndex = useGame((s) => s.tutorialStep);
  const panel = useGame((s) => s.panel);
  if (stepIndex === null) return null;
  const step = TUTORIAL[stepIndex];
  const { nextTutorial, endTutorial } = useGame.getState();
  const waiting = step.until.kind !== "next";

  return (
    <>
      {step.highlight && !panel && <Ring where={step.highlight} />}
      {/* Saat ada panel terbuka, kartu tutorial mengecil supaya tidak menutupi */}
      <div
        className={`pointer-events-auto absolute inset-x-3 flex justify-center ${panel ? "top-2" : "top-[164px]"}`}
        style={{ zIndex: 30 }}
      >
        <div key={stepIndex} className="pop-in relative w-full max-w-sm rounded-3xl border-4 border-[#8a5530] bg-[#fff6e5] p-4 pl-16 shadow-2xl">
          <div className="absolute -top-3 -left-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-[#8a5530] bg-rose-100 text-3xl">
            <Portrait id="windi" fallback={<Cake size={30} className="text-rose-400" />} className="h-full w-full object-cover" />
          </div>
          <div className="mb-1 flex items-center justify-between">
            <p className="font-extrabold text-[#6b3f22]">{stripEmoji(step.title)}</p>
            <span className="text-[10px] font-bold text-[#a97c50]">
              {stepIndex + 1}/{TUTORIAL.length}
            </span>
          </div>
          {!panel && <p className="text-sm leading-snug text-[#5b3418]">{stripEmoji(step.text)}</p>}
          <div className="mt-2 flex items-center justify-between gap-2">
            <button className="text-xs font-bold text-[#a97c50] underline" onClick={endTutorial}>
              Lewati tutorial
            </button>
            {waiting ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                <Hourglass size={12} /> Lakukan dulu ya…
              </span>
            ) : (
              <button
                className="rounded-xl border-2 border-[#5b3418] bg-gradient-to-b from-[#c98a55] to-[#8a5530] px-4 py-1.5 text-sm font-extrabold text-[#fff3dc] shadow active:scale-95"
                onClick={nextTutorial}
              >
                {stepIndex + 1 === TUTORIAL.length ? "Mulai main!" : "Lanjut ▸"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
