"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useRapier, type RapierCollider, type RapierRigidBody } from "@react-three/rapier";
import type { Group } from "three";
import { getOutfit, rescueFromLockedLand, walkBoost } from "@/lib/data";
import { findNearby } from "@/lib/interactions";
import { runtime } from "@/lib/runtime";
import { useGame } from "@/lib/store";
import { turnToward } from "../scene/parts";
import { Person, type Motion } from "./Person";

const SPEED = 3.4;
const SKIN = "#efc09c"; // warna kulit hangat seperti di foto

/** Windi: dikendalikan joystick/keyboard, ditahan tembok lewat character controller Rapier. */
export function Player() {
  const { world } = useRapier();
  const body = useRef<RapierRigidBody>(null!);
  const collider = useRef<RapierCollider>(null!);
  const visual = useRef<Group>(null!);
  const motion = useRef<Motion>({ walking: false, sitting: false });
  const nearbyTimer = useRef(0);
  const stuck = useRef(0);
  // Saat mencoba baju di butik, yang dipakai adalah baju pratinjau.
  const outfit = getOutfit(useGame((s) => s.previewOutfit ?? s.save.outfitId));

  const controller = useMemo(() => {
    const c = world.createCharacterController(0.02);
    c.setSlideEnabled(true);
    return c;
  }, [world]);
  useEffect(() => () => world.removeCharacterController(controller), [world, controller]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = useGame.getState();
    s.tick(dt);
    if (!body.current || !collider.current) return;

    const sitting = s.sittingAt !== null;
    const frozen = s.menu || s.photo || s.panel !== null || s.openLetterId !== null;
    let { x: ix, z: iz } = runtime.input;
    let mag = Math.min(1, Math.hypot(ix, iz));

    // Ketuk-untuk-jalan: kalau tidak ada input keyboard, berjalan menuju titik yang diketuk.
    const target = runtime.moveTarget;
    if (mag > 0.1) {
      runtime.moveTarget = null; // keyboard mengambil alih
    } else if (target && !frozen) {
      const dx = target.x - runtime.player.x;
      const dz = target.z - runtime.player.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.15) {
        runtime.moveTarget = null;
      } else {
        ix = dx / dist;
        iz = dz / dist;
        mag = Math.min(1, dist * 2); // melambat sedikit menjelang tujuan
      }
    }
    if (sitting && mag > 0.3 && !frozen) s.standUp();

    let walking = false;
    if (!frozen && !sitting && mag > 0.1) {
      // Kamera menghadap utara, jadi arah layar = arah dunia (atas = -z).
      const k = (SPEED * walkBoost(s.save.upgrades) * dt * mag) / Math.hypot(ix, iz);
      controller.computeColliderMovement(collider.current, { x: ix * k, y: 0, z: iz * k });
      const m = controller.computedMovement();
      runtime.player.x += m.x;
      runtime.player.z += m.z;
      runtime.player.rot = turnToward(runtime.player.rot, Math.atan2(ix, iz), 1 - Math.exp(-14 * dt));
      walking = Math.hypot(m.x, m.z) > 0.0005;
      // Tertahan tembok/benda saat ketuk-untuk-jalan → berhenti, jangan mendorong terus.
      if (runtime.moveTarget) {
        const want = SPEED * walkBoost(s.save.upgrades) * dt * mag;
        stuck.current = Math.hypot(m.x, m.z) < want * 0.2 ? stuck.current + dt : 0;
        if (stuck.current > 0.35) {
          runtime.moveTarget = null;
          stuck.current = 0;
        }
      }
    }
    if (s.menu || s.panel === "boutique" || s.photo) {
      // Berpose menghadap kamera saat di menu, butik, atau mode foto.
      runtime.player.rot = turnToward(runtime.player.rot, 0, 1 - Math.exp(-6 * dt));
    }
    body.current.setNextKinematicTranslation({ x: runtime.player.x, y: 0, z: runtime.player.z });
    visual.current.position.set(runtime.player.x, 0, runtime.player.z);
    visual.current.rotation.y = runtime.player.rot;
    motion.current.walking = walking;
    motion.current.sitting = sitting;

    nearbyTimer.current -= dt;
    if (nearbyTimer.current <= 0) {
      nearbyTimer.current = 0.15;
      // Pengaman: kalau sampai berada di dalam lahan yang pagarnya masih tertutup, keluarkan ke depan gerbang.
      if (!s.menu) {
        const safe = rescueFromLockedLand(runtime.player.x, runtime.player.z, s.save.upgrades);
        if (safe) {
          [runtime.player.x, runtime.player.z] = safe;
          s.say("Lahan ini belum dibeli. Beli di Toko Ajis ya");
        }
      }
      s.setNearby(sitting ? null : findNearby(s.save, s.letters, runtime.player.x, runtime.player.z));
    }
  });

  return (
    <>
      <RigidBody
        ref={body}
        type="kinematicPosition"
        colliders={false}
        position={[runtime.player.x, 0, runtime.player.z]}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider ref={collider} args={[0.35, 0.3]} position={[0, 0.66, 0]} />
      </RigidBody>
      {/* Model visual terpisah dari body agar ikut posisi runtime tanpa jeda satu langkah fisika. */}
      <group ref={visual}>
        <Person
          motion={motion}
          look={{
            skin: SKIN,
            top: outfit.top,
            bottom: outfit.bottom,
            skirt: outfit.skirt,
            accent: outfit.accent,
            hair: "#2b1b17",
            longHair: true,
            apron: outfit.apron,
            nameTag: outfit.id === "apron_06",
            bow: outfit.bow,
            hat: outfit.hat,
            hatColor: outfit.hatColor,
            lashes: true,
            clip: "#f9a8d4",
            lips: "#c4626e",
          }}
        />
      </group>
    </>
  );
}
