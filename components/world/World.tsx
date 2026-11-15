"use client";

import { Physics } from "@react-three/rapier";
import { Cat } from "./Cat";
import { Customers } from "./Customers";
import { CameraRig, CaptureBridge, DayNight } from "./Environment";
import { Forage, Letters } from "./Pickups";
import { Player } from "./Player";
import { Shop } from "./Shop";
import { Town } from "./Town";
import { Townsfolk } from "./Townsfolk";
import { Farmland } from "./Farmland";
import { Critters } from "./Critters";
import { TutorialArrow } from "./TutorialArrow";
import { TapMarker, TapToMove } from "./TapToMove";

export function World() {
  return (
    <>
      <DayNight />
      {/* Semua benda dunia bisa diketuk untuk berjalan ke sana. */}
      <TapToMove>
        {/* timeStep "vary": satu langkah fisika per frame, selaras dengan character controller. */}
        <Physics timeStep="vary" gravity={[0, 0, 0]}>
          <Town />
          <Shop />
          <Player />
          <Townsfolk />
          <Farmland />
        </Physics>
        <Critters />
        <Forage />
        <Letters />
        <Customers />
        <Cat />
      </TapToMove>
      <TapMarker />
      <TutorialArrow />
      <CameraRig />
      <CaptureBridge />
    </>
  );
}
