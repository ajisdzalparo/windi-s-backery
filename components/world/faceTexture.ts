"use client";

// Wajah karakter dilukis sebagai tekstur anime (canvas 2D) lalu ditempel di kepala.
// Kalau ada gambar buatan sendiri di public/textures/faces/<nama>.png (mis. hasil GPT), gambar itu yang dipakai.
import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from "three";

export type FaceStyle = {
  key: string; // nama file opsional: public/textures/faces/<key>.png
  iris: string; // warna iris bawah (atas selalu gelap)
  lashes: boolean; // bulu mata lentik (perempuan)
  blush: number; // 0..1
  brow: string;
  lips: string;
  mole?: boolean;
  glasses?: boolean;
  smile?: "soft" | "open";
};

/** Ukuran kanvas mengikuti proporsi tambalan wajah di bola kepala (lebar 1.8 rad × tinggi 1.3 rad). */
export const FACE_W = 768;
export const FACE_H = 512;

// Posisi fitur dalam piksel kanvas (dihitung dari koordinat 3D kepala).
const EYE_X = 150;
const EYE_Y = 238;
const CX = FACE_W / 2;

function eye(g: CanvasRenderingContext2D, x: number, y: number, side: 1 | -1, s: FaceStyle) {
  const w = 62;
  const h = 74;
  g.save();
  // Putih mata berbentuk almond membulat
  g.beginPath();
  g.ellipse(x, y + 4, w, h, 0, 0, Math.PI * 2);
  g.fillStyle = "#ffffff";
  g.fill();

  // Iris besar dengan gradasi gelap → hangat
  g.beginPath();
  g.ellipse(x, y + 8, w * 0.82, h * 0.92, 0, 0, Math.PI * 2);
  const grad = g.createLinearGradient(0, y - h, 0, y + h);
  grad.addColorStop(0, "#1a0c07");
  grad.addColorStop(0.55, "#3b2014");
  grad.addColorStop(1, s.iris);
  g.fillStyle = grad;
  g.fill();

  // Pupil
  g.beginPath();
  g.ellipse(x, y + 6, w * 0.36, h * 0.42, 0, 0, Math.PI * 2);
  g.fillStyle = "#0b0503";
  g.fill();

  // Kilau: satu besar di kiri atas, satu kecil di kanan bawah, plus pantulan lembut di bawah
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.ellipse(x - 16, y - 22, 17, 21, -0.3, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(x + 18, y + 26, 8, 8, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 0.35;
  g.beginPath();
  g.ellipse(x, y + 40, 26, 10, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  // Garis kelopak atas tebal (eyeliner) dengan ujung luar yang lentik
  g.strokeStyle = "#1a0d08";
  g.lineCap = "round";
  g.lineWidth = s.lashes ? 13 : 9;
  g.beginPath();
  g.ellipse(x, y + 6, w + 4, h + 2, 0, Math.PI * 1.08, Math.PI * 1.92);
  g.stroke();
  if (s.lashes) {
    g.lineWidth = 8;
    const ox = x + side * (w + 2);
    g.beginPath();
    g.moveTo(ox - side * 6, y - 26);
    g.quadraticCurveTo(ox + side * 14, y - 36, ox + side * 22, y - 50);
    g.stroke();
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(ox - side * 18, y - 46);
    g.quadraticCurveTo(ox - side * 2, y - 60, ox + side * 6, y - 66);
    g.stroke();
  }
  // Garis bawah tipis
  g.lineWidth = 3;
  g.strokeStyle = "rgba(90,45,30,0.55)";
  g.beginPath();
  g.ellipse(x, y + 6, w - 6, h + 2, 0, Math.PI * 0.25, Math.PI * 0.75);
  g.stroke();
  g.restore();
}

export function drawFace(g: CanvasRenderingContext2D, s: FaceStyle) {
  g.clearRect(0, 0, FACE_W, FACE_H);

  // Rona pipi: gradasi lembut + garis-garis kecil khas anime
  if (s.blush > 0) {
    for (const side of [-1, 1] as const) {
      const bx = CX + side * 232;
      const by = 342;
      const rg = g.createRadialGradient(bx, by, 4, bx, by, 70);
      rg.addColorStop(0, `rgba(255,120,140,${0.55 * s.blush})`);
      rg.addColorStop(1, "rgba(255,120,140,0)");
      g.fillStyle = rg;
      g.beginPath();
      g.ellipse(bx, by, 78, 46, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = `rgba(230,90,110,${0.6 * s.blush})`;
      g.lineWidth = 4;
      g.lineCap = "round";
      for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.moveTo(bx + i * 20 - 6, by + 10);
        g.lineTo(bx + i * 20 + 6, by - 8);
        g.stroke();
      }
    }
  }

  eye(g, CX - EYE_X, EYE_Y, -1, s);
  eye(g, CX + EYE_X, EYE_Y, 1, s);

  // Alis tipis melengkung lembut
  g.strokeStyle = s.brow;
  g.lineWidth = 9;
  g.lineCap = "round";
  for (const side of [-1, 1]) {
    g.beginPath();
    g.moveTo(CX + side * (EYE_X - 52), 132);
    g.quadraticCurveTo(CX + side * EYE_X, 112, CX + side * (EYE_X + 52), 128);
    g.stroke();
  }

  // Hidung mungil
  g.strokeStyle = "rgba(170,90,60,0.55)";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(CX - 6, 330);
  g.quadraticCurveTo(CX, 338, CX + 6, 330);
  g.stroke();

  // Mulut
  if (s.smile === "open") {
    g.beginPath();
    g.moveTo(CX - 34, 392);
    g.quadraticCurveTo(CX, 440, CX + 34, 392);
    g.closePath();
    g.fillStyle = "#c2414f";
    g.fill();
    g.beginPath();
    g.ellipse(CX, 418, 16, 9, 0, 0, Math.PI * 2);
    g.fillStyle = "#ff8fa0";
    g.fill();
  } else {
    g.strokeStyle = s.lips;
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(CX - 30, 396);
    g.quadraticCurveTo(CX, 420, CX + 30, 396);
    g.stroke();
  }

  if (s.mole) {
    g.fillStyle = "rgba(90,55,40,0.8)";
    g.beginPath();
    g.arc(CX - 118, 438, 4.5, 0, Math.PI * 2);
    g.fill();
  }

  if (s.glasses) {
    g.strokeStyle = "#1c1917";
    g.lineWidth = 8;
    for (const side of [-1, 1]) {
      g.beginPath();
      g.ellipse(CX + side * EYE_X, EYE_Y + 6, 78, 72, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(CX - EYE_X + 78, EYE_Y);
    g.quadraticCurveTo(CX, EYE_Y - 18, CX + EYE_X - 78, EYE_Y);
    g.stroke();
  }
}

const cache = new Map<string, Texture>();
const missing = new Set<string>();

/** Tekstur wajah (di-cache per gaya). Mencoba gambar kustom dulu, lalu jatuh ke lukisan canvas. */
export function getFaceTexture(s: FaceStyle): Texture {
  const id = JSON.stringify(s);
  const hit = cache.get(id);
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = FACE_W;
  c.height = FACE_H;
  drawFace(c.getContext("2d")!, s);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(id, tex);

  if (!missing.has(s.key)) {
    new TextureLoader().load(
      `/textures/faces/${s.key}.png`,
      (img) => {
        // Ganti isi kanvas dengan gambar kustom supaya semua karakter yang memakai tekstur ini ikut berubah.
        const g = c.getContext("2d")!;
        g.clearRect(0, 0, FACE_W, FACE_H);
        g.drawImage(img.image as CanvasImageSource, 0, 0, FACE_W, FACE_H);
        tex.needsUpdate = true;
      },
      undefined,
      () => missing.add(s.key),
    );
  }
  return tex;
}
