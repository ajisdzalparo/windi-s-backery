// Tutorial terpandu untuk pemain baru. Tiap langkah selesai dengan: tombol Lanjut, berjalan,
// mendekati sesuatu, atau melakukan aksi (event yang sama dengan sistem misi).
import { AJIS_BENCH, SPOTS, plotPos } from "./data";

export type Highlight = "joystick" | "action" | "top" | "side" | "tracker";

export type TutorialStep = {
  title: string;
  text: string;
  highlight?: Highlight;
  target?: [number, number]; // panah 3D menunjuk ke sini
  until: { kind: "next" } | { kind: "move"; meters: number } | { kind: "near"; prefix: string[] } | { kind: "event"; event: string };
};

export const TUTORIAL: TutorialStep[] = [
  {
    title: "Halo, Windi! 👋",
    text: "Selamat datang di Windi's Sweet Bakery! Di sini kamu mengurus toko kue, berkebun, beternak, dan jalan-jalan di kota kecil. Yuk belajar sebentar!",
    until: { kind: "next" },
  },
  {
    title: "Berjalan",
    text: "Geser joystick kayu di kiri bawah, atau ketuk tanah ke mana pun kamu mau pergi. (Di laptop bisa klik, atau pakai W A S D.) Coba jalan sedikit!",
    highlight: "joystick",
    until: { kind: "move", meters: 3 },
  },
  {
    title: "Koin vs Energi",
    text: "Kiri atas: hari & jam (1 hari = 10 menit). Kanan atas: 🪙 KOIN = uang untuk belanja, ⚡ ENERGI = tenaga yang berkurang saat bekerja. Pulihkan energi dengan makan kue, duduk di bangku, atau tidur.",
    highlight: "top",
    until: { kind: "next" },
  },
  {
    title: "Ke Kebun",
    text: "Ikuti panah ke kebun di sebelah timur toko.",
    target: plotPos(0),
    until: { kind: "near", prefix: ["plant:", "water:", "harvest:"] },
  },
  {
    title: "Tombol Aksi",
    text: "Tombol bulat di kanan bawah berubah sesuai benda di dekatmu. Tekan 🌱 Tanam!",
    highlight: "action",
    until: { kind: "event", event: "plant" },
  },
  {
    title: "Menyiram",
    text: "Sekarang siram 💧 petaknya. Tanaman tumbuh setiap pagi kalau kemarin disiram.",
    highlight: "action",
    until: { kind: "event", event: "water" },
  },
  {
    title: "Ke Dapur",
    text: "Mantap! Sekarang masuk ke toko. Ikuti panah ke oven di dapur.",
    target: SPOTS.oven,
    until: { kind: "near", prefix: ["oven"] },
  },
  {
    title: "Memasak",
    text: "Tekan 🔥 Masak lalu pilih Roti Gandum. Tunggu sebentar sampai matang.",
    highlight: "action",
    until: { kind: "event", event: "bake" },
  },
  {
    title: "Berjualan",
    text: "Roti jadi! Pergi ke etalase, pajang rotinya, lalu tekan Buka. Pelanggan datang jam 08:00–20:00 dan membayar dengan koin.",
    target: SPOTS.case,
    until: { kind: "event", event: "display" },
  },
  {
    title: "Misi",
    text: "Kiri atas ada pelacak misi. Tombol 📜 Misi berisi misi cerita & misi harian. Selesaikan, lalu tekan Klaim untuk hadiah koin & barang.",
    highlight: "tracker",
    until: { kind: "next" },
  },
  {
    title: "Toko Ajis",
    text: "Semua belanja ada di Toko Ajis di sisi timur taman: benih & pakan, hewan ternak, peliharaan, lahan baru, upgrade (kulkas, oven, penyiram otomatis…), dekorasi, dan baju. Ikuti panah ke tokonya!",
    target: [AJIS_BENCH.pos[0] - 1.1, AJIS_BENCH.pos[1]],
    until: { kind: "near", prefix: ["ajis"] },
  },
  {
    title: "Lemari",
    text: "Baju yang sudah dibeli bisa diganti kapan saja lewat tombol Lemari di menu samping.",
    highlight: "side",
    until: { kind: "next" },
  },
  {
    title: "Selesai! 💕",
    text: "Terakhir: kalau capek atau sudah malam, tidur di kasur 🛏️ untuk ganti hari dan menyimpan game. Selamat bersenang-senang!",
    until: { kind: "next" },
  },
];
