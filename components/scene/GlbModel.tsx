"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Mesh, Vector3 } from "three";

/**
 * Memuat GLB hasil generate lalu menormalkannya: diputar `turn` radian,
 * diskalakan agar muat di tapak `size` = [lebar X, panjang Z] meter, diletakkan di lantai dan di tengah.
 */
export function GlbModel({ url, size, turn = 0 }: { url: string; size: [number, number]; turn?: number }) {
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.rotation.y = turn;
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (o instanceof Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new Box3().setFromObject(root);
    const dim = box.getSize(new Vector3());
    const scale = Math.min(size[0] / dim.x, size[1] / dim.z);
    const center = box.getCenter(new Vector3());
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return root;
  }, [scene, size, turn]);

  return <primitive object={model} />;
}
