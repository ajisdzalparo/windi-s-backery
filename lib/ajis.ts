// Dialog NPC Ajis. Silakan ganti kalimat-kalimatnya dengan inside joke kalian sendiri.
// Satu baris "harian" dipilih berdasarkan hari game; baris pertama kali ngobrol membuka resep rahasia.

export const AJIS_FIRST_TALK = [
  "Eh, ada Bu Bos toko kue! Aku nunggu di sini dari tadi lho 😆",
  "Aku punya rahasia: campur gandum, stroberi, beri liar, sama chamomile. Jadinya… Kue Spesial Windi! 🎂",
  "Resepnya udah aku tulis di buku resep di dapur ya. Jangan dijual murah-murah, itu kue paling enak sekota.",
];

export const AJIS_DAILY = [
  "Kalau capek, duduk dulu di bangku taman. Energinya balik pelan-pelan kok.",
  "Katanya jamur paling sering tumbuh di pinggir kota yang teduh.",
  "Teh chamomile cocok buat pelanggan sore-sore. Laris tuh.",
  "Jangan lupa siram kebunnya tiap hari, nanti gandumnya ngambek.",
  "Hari ini kamu cantik banget. Eh, aku cuma bilang fakta.",
  "Udah cek surat hari ini belum? Katanya ada yang nyelipin surat di kota…",
  "Stroberi panennya 4 hari. Sabar ya, kayak aku nunggu kamu bales chat.",
  "Kalau koinnya udah banyak, beli etalase besar. Biar kuenya muat banyak.",
];

/** Obrolan santai lewat tombol "Ngobrol" di toko: dua kalimat acak. */
export const AJIS_CHAT = [
  "Gimana tokonya hari ini? Pelanggan rame?",
  "Aku seneng banget lihat kamu semangat gini.",
  "Kalau capek jangan dipaksain ya. Istirahat dulu di bangku taman.",
  "Tadi Bu Sari cerita roti kamu enak banget. Aku ikut bangga, hehe.",
  "Nanti sore jalan-jalan keliling taman yuk?",
  "Jangan lupa makan juga, jangan cuma bikin kue buat orang lain.",
  "Kamu tahu nggak? Kamu itu bagian terbaik dari kota ini.",
  "Kalau butuh apa-apa buat toko, bilang aja ke aku ya.",
  "Aku lagi nyari bibit bunga baru buat dijual. Ada request?",
  "Senyum kamu tuh bikin hari aku langsung cerah.",
];

export function ajisChat() {
  const a = Math.floor(Math.random() * AJIS_CHAT.length);
  const b = (a + 1 + Math.floor(Math.random() * (AJIS_CHAT.length - 1))) % AJIS_CHAT.length;
  return [AJIS_CHAT[a], AJIS_CHAT[b]];
}

export function ajisLines(day: number, firstTime: boolean) {
  if (firstTime) return AJIS_FIRST_TALK;
  return [AJIS_DAILY[(day - 1) % AJIS_DAILY.length]];
}
