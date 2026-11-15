// Sistem misi: rantai misi cerita (berurutan) + 3 misi harian yang berganti setiap hari game.
// Setiap aksi di game memanggil track("nama-event"), dan objektif yang event-nya cocok bertambah progresnya.

export type Objective = { event: string; target: number; label: string };

export type Reward = {
  coins?: number;
  items?: Record<string, number>;
  decor?: string;
  outfit?: string;
};

export type Quest = {
  id: string;
  title: string;
  desc: string;
  hint?: string; // ke mana harus pergi
  objectives: Objective[];
  reward: Reward;
};

/** Misi cerita, dikerjakan berurutan. */
export const STORY: Quest[] = [
  {
    id: "s1",
    title: "Hari Pertama",
    desc: "Ajis baru buka toko serba ada di taman kota. Mampir dulu yuk!",
    hint: "Toko Ajis di sisi timur taman",
    objectives: [{ event: "talk_ajis", target: 1, label: "Mampir ke Toko Ajis" }],
    reward: { coins: 20 },
  },
  {
    id: "s2",
    title: "Tangan Petani",
    desc: "Toko kue butuh gandum. Tanam benih di kebun belakang lalu siram.",
    hint: "Kebun di sebelah timur toko",
    objectives: [
      { event: "plant", target: 2, label: "Tanam benih" },
      { event: "water", target: 2, label: "Siram petak kebun" },
    ],
    reward: { coins: 15, items: { seed_wheat: 2 } },
  },
  {
    id: "s3",
    title: "Roti Pertama",
    desc: "Waktunya menyalakan oven! Panggang roti gandum pertamamu.",
    hint: "Oven di dapur toko",
    objectives: [{ event: "bake:bread", target: 1, label: "Panggang Roti Gandum" }],
    reward: { coins: 20 },
  },
  {
    id: "s4",
    title: "Buka Toko!",
    desc: "Pajang kue di etalase, buka toko, lalu tunggu pelanggan pertama.",
    hint: "Etalase di tengah toko (jam 08:00–20:00)",
    objectives: [
      { event: "display", target: 1, label: "Pajang kue di etalase" },
      { event: "sell", target: 1, label: "Jual kue ke pelanggan" },
    ],
    reward: { coins: 30 },
  },
  {
    id: "s5",
    title: "Kenalan Sama Tetangga",
    desc: "Kota ini ramah! Sapa warga-warga di sekitar taman.",
    hint: "Dekati warga lalu tekan 👋 Sapa",
    objectives: [{ event: "greet_new", target: 3, label: "Sapa warga berbeda" }],
    reward: { coins: 25 },
  },
  {
    id: "s6",
    title: "Petualang Kecil",
    desc: "Ada bahan liar yang tumbuh di sekitar kota. Cari yang berkilauan!",
    hint: "Semak, bunga, dan jamur di pinggir kota",
    objectives: [{ event: "forage", target: 4, label: "Kumpulkan bahan liar" }],
    reward: { coins: 30 },
  },
  {
    id: "s7",
    title: "Panen Raya",
    desc: "Rawat kebun sampai siap panen. Jangan lupa siram tiap hari!",
    hint: "Tidur untuk mempercepat hari",
    objectives: [{ event: "harvest", target: 1, label: "Panen tanaman" }],
    reward: { coins: 20, items: { seed_strawberry: 2 } },
  },
  {
    id: "s8",
    title: "Menu Baru",
    desc: "Pelanggan mulai bosan roti. Coba resep dari bahan liar!",
    hint: "Butuh beri liar & chamomile",
    objectives: [
      { event: "bake:berry_tart", target: 1, label: "Panggang Tart Beri Liar" },
      { event: "bake:chamomile_tea", target: 1, label: "Seduh Teh Chamomile" },
    ],
    reward: { coins: 40 },
  },
  {
    id: "r1",
    title: "Rumah untuk Ayam",
    desc: "Beli lahan peternakan, bangun kandang ayam, lalu pelihara ayam pertamamu!",
    hint: "Toko Ajis → Lahan, lalu Ternak",
    objectives: [
      { event: "buy:land_ranch", target: 1, label: "Beli Lahan Peternakan" },
      { event: "buy:coop", target: 1, label: "Bangun Kandang Ayam" },
      { event: "buy:chicken", target: 1, label: "Beli ayam" },
    ],
    reward: { coins: 80, items: { feed: 5 } },
  },
  {
    id: "r2",
    title: "Telur Pertama",
    desc: "Beri makan ayam setiap hari, elus biar sayang, lalu ambil telurnya besok pagi.",
    hint: "Peternakan di utara kebun",
    objectives: [
      { event: "feed_animal", target: 2, label: "Beri makan hewan" },
      { event: "collect:egg", target: 1, label: "Ambil telur" },
    ],
    reward: { coins: 50 },
  },
  {
    id: "r3",
    title: "Dapur Modern",
    desc: "Dengan kulkas, telur dan susu bisa jadi kue-kue baru. Coba bikin kue bolu!",
    hint: "Toko Ajis → Upgrade → Kulkas · Bolu = 2 gandum + 2 telur",
    objectives: [
      { event: "buy:fridge", target: 1, label: "Beli Kulkas" },
      { event: "bake:sponge_cake", target: 1, label: "Masak Kue Bolu" },
    ],
    reward: { coins: 100 },
  },
  {
    id: "s9",
    title: "Pedagang Andal",
    desc: "Kumpulkan Love Coins dari penjualan. Toko makin dikenal!",
    objectives: [{ event: "earn", target: 250, label: "Dapatkan koin dari penjualan" }],
    reward: { coins: 50, decor: "menu_board" },
  },
  {
    id: "s10",
    title: "Resep Rahasia",
    desc: "Ingat resep rahasia dari Ajis? Buat dan jual Kue Spesial Windi!",
    hint: "Gandum + stroberi + beri liar + chamomile",
    objectives: [
      { event: "bake:windi_special", target: 1, label: "Buat Kue Spesial Windi" },
      { event: "sell:windi_special", target: 1, label: "Jual Kue Spesial Windi" },
    ],
    reward: { coins: 100, outfit: "gown_10" },
  },
  {
    id: "s11",
    title: "Surat-Surat Kecil",
    desc: "Ada yang rajin menyelipkan surat di kota… Kumpulkan dan baca.",
    objectives: [{ event: "read_letter", target: 3, label: "Baca surat tersembunyi" }],
    reward: { coins: 60 },
  },
  {
    id: "s12",
    title: "Toko Kue Terkenal",
    desc: "Jadikan Windi's Sweet Bakery toko kue paling terkenal sekota!",
    objectives: [{ event: "sell", target: 30, label: "Jual kue" }],
    reward: { coins: 300, decor: "lanterns" },
  },
];

/** Kumpulan misi harian; tiap hari dipilih 3 secara acak (tetap untuk hari yang sama). */
export const DAILY_POOL: Quest[] = [
  { id: "d_water", title: "Kebun Segar", desc: "Siram petak kebun hari ini.", objectives: [{ event: "water", target: 3, label: "Siram petak" }], reward: { coins: 20 } },
  { id: "d_sell", title: "Hari Ramai", desc: "Layani pelanggan di toko.", objectives: [{ event: "sell", target: 3, label: "Jual kue" }], reward: { coins: 35 } },
  { id: "d_bake", title: "Koki Rajin", desc: "Panggang kue di dapur.", objectives: [{ event: "bake", target: 2, label: "Masak kue/minuman" }], reward: { coins: 25 } },
  { id: "d_forage", title: "Jalan-Jalan Pagi", desc: "Kumpulkan bahan liar di kota.", objectives: [{ event: "forage", target: 3, label: "Ambil bahan liar" }], reward: { coins: 20 } },
  { id: "d_greet", title: "Tetangga Ramah", desc: "Sapa warga kota.", objectives: [{ event: "greet", target: 3, label: "Sapa warga" }], reward: { coins: 15 } },
  { id: "d_sit", title: "Me Time", desc: "Duduk santai di bangku taman.", objectives: [{ event: "sit", target: 1, label: "Duduk di bangku" }], reward: { coins: 10 } },
  { id: "d_earn", title: "Target Harian", desc: "Kumpulkan koin dari penjualan.", objectives: [{ event: "earn", target: 120, label: "Dapatkan koin" }], reward: { coins: 40 } },
  { id: "d_harvest", title: "Petik Hasil", desc: "Panen dari kebun.", objectives: [{ event: "harvest", target: 1, label: "Panen" }], reward: { coins: 20 } },
  { id: "d_eat", title: "Jangan Lupa Makan", desc: "Makan kue biar semangat.", objectives: [{ event: "eat", target: 1, label: "Makan kue" }], reward: { coins: 10 } },
  { id: "d_ajis", title: "Ngopi Bareng", desc: "Mampir ngobrol sama Ajis.", objectives: [{ event: "talk_ajis", target: 1, label: "Ngobrol dengan Ajis" }], reward: { coins: 15 } },
];

export const DAILY_COUNT = 3;

export type QuestSlot = { id: string; progress: number[]; claimed: boolean };

export type QuestState = {
  storyIndex: number; // indeks misi cerita yang sedang aktif (== STORY.length artinya tamat)
  storyProgress: number[];
  dailyDay: number;
  daily: QuestSlot[];
  greeted: string[]; // warga yang sudah disapa hari ini (untuk "greet_new")
};

export const storyQuest = (q: QuestState) => STORY[q.storyIndex] ?? null;
export const dailyQuest = (id: string) => DAILY_POOL.find((d) => d.id === id) ?? null;

function pickDaily(day: number): QuestSlot[] {
  // Acak tapi tetap untuk hari yang sama.
  let seed = day * 7919 + 13;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const ids = DAILY_POOL.map((d) => d.id).sort(() => rand() - 0.5).slice(0, DAILY_COUNT);
  return ids.map((id) => ({ id, progress: dailyQuest(id)!.objectives.map(() => 0), claimed: false }));
}

const nums = (v: unknown, len: number) =>
  Array.from({ length: len }, (_, i) => (Array.isArray(v) && typeof v[i] === "number" && Number.isFinite(v[i]) ? Math.max(0, Math.floor(v[i])) : 0));

/** Membersihkan data misi dari database/client menjadi bentuk yang valid; misi harian diperbarui kalau harinya berganti. */
export function normalizeQuests(raw: unknown, day: number): QuestState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const storyIndex = typeof r.storyIndex === "number" ? Math.max(0, Math.min(STORY.length, Math.floor(r.storyIndex))) : 0;
  const story = STORY[storyIndex];
  const storyProgress = story ? nums(r.storyProgress, story.objectives.length) : [];

  let daily: QuestSlot[] = [];
  if (r.dailyDay === day && Array.isArray(r.daily)) {
    daily = (r.daily as unknown[])
      .map((s) => {
        const o = (s ?? {}) as Record<string, unknown>;
        const q = typeof o.id === "string" ? dailyQuest(o.id) : null;
        return q ? { id: q.id, progress: nums(o.progress, q.objectives.length), claimed: o.claimed === true } : null;
      })
      .filter((x): x is QuestSlot => x !== null)
      .slice(0, DAILY_COUNT);
  }
  if (daily.length === 0) daily = pickDaily(day);
  const greeted = r.dailyDay === day && Array.isArray(r.greeted) ? r.greeted.filter((x): x is string => typeof x === "string").slice(0, 50) : [];
  return { storyIndex, storyProgress, dailyDay: day, daily, greeted };
}

export const isDone = (quest: Quest, progress: number[]) => quest.objectives.every((o, i) => (progress[i] ?? 0) >= o.target);

/** Menambah progres semua misi aktif yang punya objektif dengan event ini. Mengembalikan misi yang baru saja selesai. */
export function applyEvent(q: QuestState, event: string, amount: number): { next: QuestState; finished: Quest[] } {
  const finished: Quest[] = [];
  const bump = (quest: Quest, progress: number[]) => {
    const before = isDone(quest, progress);
    const out = progress.map((p, i) => (quest.objectives[i].event === event ? Math.min(quest.objectives[i].target, p + amount) : p));
    if (!before && isDone(quest, out)) finished.push(quest);
    return out;
  };
  const story = storyQuest(q);
  const storyProgress = story ? bump(story, q.storyProgress) : q.storyProgress;
  const daily = q.daily.map((s) => (s.claimed ? s : { ...s, progress: bump(dailyQuest(s.id)!, s.progress) }));
  return { next: { ...q, storyProgress, daily }, finished };
}

export function claimableCount(q: QuestState) {
  const story = storyQuest(q);
  let n = story && isDone(story, q.storyProgress) ? 1 : 0;
  for (const s of q.daily) if (!s.claimed && isDone(dailyQuest(s.id)!, s.progress)) n++;
  return n;
}
