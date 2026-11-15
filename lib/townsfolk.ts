// Warga kota: penampilan, rutinitas, jam muncul, dan kalimat sapaan. Bebas diubah/ditambah.
import type { Look } from "@/components/world/Person";

export type Behavior =
  | { kind: "patrol"; points: [number, number][]; speed: number }
  | { kind: "circle"; center: [number, number]; radius: number; speed: number; phase: number }
  | { kind: "sit"; pos: [number, number]; rot: number }
  | { kind: "stand"; pos: [number, number]; rot: number };

export type Townsperson = {
  id: string;
  name: string;
  look: Look;
  scale?: number;
  behavior: Behavior;
  hours: [number, number]; // menit game kapan warga ada di kota
  lines: string[];
  emotes: string[];
};

const DAY: [number, number] = [6 * 60 + 30, 21 * 60];

export const NPC_BENCH = { pos: [6, 12] as [number, number], rot: -Math.PI / 2 };
export const FLOWER_STALL: [number, number] = [-8.6, -1.6];

export const TOWNSFOLK: Townsperson[] = [
  {
    id: "sari",
    name: "Bu Sari",
    look: { skin: "#e3ad88", top: "#65a30d", bottom: "#3f3f46", skirt: true, hijab: "#fef3c7", prop: "bag" },
    behavior: { kind: "patrol", points: [[-16, 2.2], [16, 2.2]], speed: 1.1 },
    hours: DAY,
    lines: ["Kuenya kemarin enak banget, Nak Windi!", "Pagi-pagi udah semangat ya. Ibu mau ke pasar dulu.", "Besok ibu pesen roti gandum dua ya."],
    emotes: ["🛍️", "😊", "☀️"],
  },
  {
    id: "budi",
    name: "Pak Budi",
    look: { skin: "#d9a07a", top: "#e7e5e4", bottom: "#57534e", hair: "#d6d3d1", glasses: true },
    behavior: { kind: "sit", pos: NPC_BENCH.pos, rot: NPC_BENCH.rot },
    hours: [7 * 60, 19 * 60],
    lines: ["Burung-burung ini teman saya tiap pagi.", "Dulu di sini belum ada toko kue. Sekarang kota jadi wangi roti.", "Duduk sini, Nak. Santai dulu."],
    emotes: ["🕊️", "☕", "😌"],
  },
  {
    id: "dimas",
    name: "Dimas",
    scale: 0.72,
    look: { skin: "#e8b48f", top: "#38bdf8", bottom: "#1e3a8a", hair: "#1c1917", smileOpen: true },
    behavior: { kind: "circle", center: [0, 9], radius: 2.75, speed: 0.9, phase: 0 },
    hours: [8 * 60, 18 * 60],
    lines: ["Kak Windi! Main kejar-kejaran yuk!", "Aku pengen kue stroberi!!", "Rara larinya cepet banget 😆"],
    emotes: ["😆", "🏃", "⭐"],
  },
  {
    id: "rara",
    name: "Rara",
    scale: 0.7,
    look: { skin: "#f0c4a1", top: "#f472b6", bottom: "#fde68a", skirt: true, hair: "#3f2a1d", longHair: true, smileOpen: true },
    behavior: { kind: "circle", center: [0, 9], radius: 2.75, speed: 0.9, phase: 1.1 },
    hours: [8 * 60, 18 * 60],
    lines: ["Hihi, Dimas nggak bisa nangkep aku!", "Kak Windi cantik deh pakai hijab itu.", "Nanti sore aku beli roti ya, Kak!"],
    emotes: ["🎈", "😄", "💖"],
  },
  {
    id: "lia",
    name: "Mbak Lia",
    look: { skin: "#ecbb97", top: "#22d3ee", bottom: "#1f2937", hijab: "#0f172a" },
    behavior: { kind: "patrol", points: [[-14, 2.8], [15.4, 2.8], [15.4, 16.6], [-14, 16.6]], speed: 2.7 },
    hours: [6 * 60 + 30, 10 * 60],
    lines: ["Lari pagi dulu biar kuat makan kue!", "Hah… hah… lima putaran lagi!"],
    emotes: ["💪", "💦", "🏃‍♀️"],
  },
  {
    id: "nadia",
    name: "Kak Nadia",
    look: { skin: "#e9b48f", top: "#c4b5fd", bottom: "#4c1d95", skirt: true, hijab: "#ede9fe", prop: "book" },
    behavior: { kind: "stand", pos: [-11.4, 16.1], rot: 0.3 },
    hours: [9 * 60, 20 * 60],
    lines: ["Buku ini bagus banget, tentang toko roti di Paris.", "Pojok baca ini tempat favoritku.", "Kamu suka baca juga, Windi?"],
    emotes: ["📖", "🤓", "✨"],
  },
  {
    id: "andi",
    name: "Mas Andi",
    look: { skin: "#d29a72", top: "#f97316", bottom: "#44403c", hair: "#1c1917", prop: "flowers" },
    behavior: { kind: "stand", pos: [FLOWER_STALL[0], FLOWER_STALL[1] + 0.9], rot: 0 },
    hours: [7 * 60, 18 * 60],
    lines: ["Bunga segar, bunga segar! Buat Mbak Windi gratis senyumnya.", "Katanya Mas Ajis sering beli bunga di sini lho 👀", "Mawar pink lagi bagus-bagusnya."],
    emotes: ["🌷", "🌻", "🌹"],
  },
  {
    id: "bayu",
    name: "Mas Bayu",
    look: { skin: "#e3ad88", top: "#1f2937", bottom: "#78716c", hair: "#292524", prop: "guitar" },
    behavior: { kind: "stand", pos: [3.4, 15.6], rot: -0.2 },
    hours: [15 * 60, 21 * 60 + 30],
    lines: ["Lagu ini buat yang punya toko kue paling manis 🎶", "Request lagu? Bayarnya pakai roti ya, hehe."],
    emotes: ["🎶", "🎸", "🎵"],
  },
  {
    id: "rina",
    name: "Rina",
    look: { skin: "#f0c4a1", top: "#fda4af", bottom: "#f5f5f4", skirt: true, hijab: "#fb7185" },
    behavior: { kind: "circle", center: [0, 9], radius: 5.45, speed: -0.2, phase: 2.5 },
    hours: [16 * 60, 21 * 60],
    lines: ["Sore-sore jalan di taman enak ya.", "Kata Fajar kue spesialmu juara!"],
    emotes: ["💕", "🌇", "😊"],
  },
  {
    id: "fajar",
    name: "Fajar",
    look: { skin: "#d9a07a", top: "#93c5fd", bottom: "#1e3a8a", hair: "#1c1917" },
    behavior: { kind: "circle", center: [0, 9], radius: 6.05, speed: -0.2, phase: 2.5 },
    hours: [16 * 60, 21 * 60],
    lines: ["Halo Windi! Titip salam buat Ajis ya.", "Besok kami mampir ke toko!"],
    emotes: ["😄", "💕", "👋"],
  },
  {
    id: "pos",
    name: "Pak Pos",
    look: { skin: "#d29a72", top: "#ea580c", bottom: "#1e3a8a", hair: "#1c1917", prop: "bag" },
    behavior: { kind: "patrol", points: [[16, 1.4], [6, 1.4], [6, -1.2], [-6, -1.2], [-6, 1.4], [-16, 1.4]], speed: 1.5 },
    hours: [8 * 60, 15 * 60],
    lines: ["Pos! Ada surat buat Windi? Coba cari di sekitar kota 😉", "Hari ini paketnya banyak banget."],
    emotes: ["📮", "✉️", "📦"],
  },
];

export const townsfolkById = (id: string) => TOWNSFOLK.find((t) => t.id === id);
