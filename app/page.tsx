"use client";

import dynamic from "next/dynamic";

// Scene WebGL hanya bisa dirender di browser.
const Game = dynamic(() => import("@/components/Game"), { ssr: false });

export default function Page() {
  return <Game />;
}
