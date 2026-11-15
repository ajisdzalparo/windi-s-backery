"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { FOUNTAIN } from "@/lib/data";
import { Ball, Box, Cyl, turnToward } from "../scene/parts";

const FUR = "#fdba74";
const FUR_LIGHT = "#fff7ed";
const SPEED = 0.9;

/** Kucing oren yang jalan-jalan sendiri di taman (idle sambil goyang ekor, lalu walk ke titik baru). */
function wanderSpot(): [number, number] {
  for (;;) {
    const x = (Math.random() * 2 - 1) * 12;
    const z = 4 + Math.random() * 12;
    if (Math.hypot(x - FOUNTAIN[0], z - FOUNTAIN[1]) > 2.6) return [x, z];
  }
}

export function Cat() {
  const root = useRef<Group>(null!);
  const tail = useRef<Group>(null!);
  const legs = useRef<(Group | null)[]>([]);
  const brain = useRef({ target: null as [number, number] | null, restUntil: 3 });

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const t = clock.elapsedTime;
    const b = brain.current;
    let walking = false;
    if (!b.target && t > b.restUntil) b.target = wanderSpot();
    if (b.target) {
      const dx = b.target[0] - root.current.position.x;
      const dz = b.target[1] - root.current.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.06) {
        walking = true;
        const step = Math.min(dist, SPEED * dt);
        root.current.position.x += (dx / dist) * step;
        root.current.position.z += (dz / dist) * step;
        root.current.rotation.y = turnToward(root.current.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-8 * dt));
      } else {
        b.target = null;
        b.restUntil = t + 3 + Math.random() * 5;
      }
    }
    const swing = walking ? Math.sin(t * 12) * 0.6 : 0;
    legs.current.forEach((leg, i) => {
      if (leg) leg.rotation.x = i % 3 === 0 ? swing : -swing;
    });
    tail.current.rotation.z = Math.sin(t * (walking ? 6 : 2.2)) * 0.45;
  });

  return (
    <group ref={root} position={[-4, 0, 6]}>
      <Box p={[0, 0.3, 0]} s={[0.3, 0.26, 0.56]} c={FUR} />
      <Box p={[0, 0.24, 0.05]} s={[0.24, 0.14, 0.4]} c={FUR_LIGHT} />
      <Box p={[0, 0.5, 0.32]} s={[0.34, 0.28, 0.28]} c={FUR} />
      <Box p={[0, 0.44, 0.45]} s={[0.18, 0.1, 0.04]} c={FUR_LIGHT} />
      <Cyl p={[-0.11, 0.69, 0.3]} rt={0} rb={0.07} h={0.13} c={FUR} seg={4} />
      <Cyl p={[0.11, 0.69, 0.3]} rt={0} rb={0.07} h={0.13} c={FUR} seg={4} />
      <Ball p={[-0.08, 0.53, 0.46]} rad={0.028} c="#292524" />
      <Ball p={[0.08, 0.53, 0.46]} rad={0.028} c="#292524" />
      <Ball p={[0, 0.47, 0.475]} rad={0.02} c="#fb7185" />
      {[
        [-0.1, 0.2],
        [0.1, 0.2],
        [-0.1, -0.2],
        [0.1, -0.2],
      ].map(([x, z], i) => (
        <group
          key={i}
          ref={(g) => {
            legs.current[i] = g;
          }}
          position={[x, 0.2, z]}
        >
          <Box p={[0, -0.1, 0]} s={[0.09, 0.2, 0.09]} c={i < 2 ? FUR_LIGHT : FUR} />
        </group>
      ))}
      <group ref={tail} position={[0, 0.38, -0.28]}>
        <Box p={[0, 0.16, -0.04]} s={[0.07, 0.36, 0.07]} c={FUR} r={[-0.35, 0, 0]} />
      </group>
    </group>
  );
}
