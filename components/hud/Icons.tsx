"use client";

// Semua ikon UI memakai Lucide (SVG), bukan emoji.
import { ImageOr } from "./Art";
import {
  Armchair,
  Bean,
  Bed,
  Cake,
  CakeSlice,
  Cherry,
  Coffee,
  Cookie,
  CookingPot,
  Croissant,
  Dessert,
  Droplets,
  Egg,
  Flame,
  Flower2,
  Grape,
  Hand,
  Heart,
  IceCreamBowl,
  Leaf,
  type LucideIcon,
  Mail,
  MessageCircle,
  Milk,
  PawPrint,
  Radio,
  Signpost,
  Sprout,
  Store,
  Wheat,
} from "lucide-react";

type ItemLook = { Icon: LucideIcon; color: string; bg: string };

/** Ikon cadangan item (dipakai sebelum gambar dari GPT tersedia). */
export const ITEM_ICONS: Record<string, ItemLook> = {
  seed_wheat: { Icon: Bean, color: "#b45309", bg: "#fef3c7" },
  seed_strawberry: { Icon: Sprout, color: "#be123c", bg: "#ffe4e6" },
  feed: { Icon: Wheat, color: "#4d7c0f", bg: "#ecfccb" },
  wheat: { Icon: Wheat, color: "#ca8a04", bg: "#fef9c3" },
  strawberry: { Icon: Cherry, color: "#e11d48", bg: "#ffe4e6" },
  wild_berry: { Icon: Grape, color: "#4f46e5", bg: "#e0e7ff" },
  chamomile: { Icon: Flower2, color: "#ca8a04", bg: "#fefce8" },
  mushroom: { Icon: Leaf, color: "#b91c1c", bg: "#fee2e2" },
  egg: { Icon: Egg, color: "#a16207", bg: "#fffbeb" },
  milk: { Icon: Milk, color: "#0369a1", bg: "#e0f2fe" },
  bread: { Icon: Croissant, color: "#b45309", bg: "#fef3c7" },
  chamomile_tea: { Icon: Coffee, color: "#a16207", bg: "#fef9c3" },
  berry_tart: { Icon: Dessert, color: "#6d28d9", bg: "#ede9fe" },
  mushroom_pie: { Icon: CookingPot, color: "#9a3412", bg: "#ffedd5" },
  strawberry_cake: { Icon: CakeSlice, color: "#db2777", bg: "#fce7f3" },
  windi_special: { Icon: Cake, color: "#be185d", bg: "#fce7f3" },
  pancake: { Icon: Cookie, color: "#b45309", bg: "#fef3c7" },
  milk_pudding: { Icon: IceCreamBowl, color: "#a16207", bg: "#fefce8" },
  sponge_cake: { Icon: CakeSlice, color: "#ca8a04", bg: "#fef9c3" },
  cheesecake: { Icon: CakeSlice, color: "#e11d48", bg: "#ffe4e6" },
};

/** Ikon untuk tombol aksi, berdasarkan jenis interaksi. */
export function actionIcon(key: string, label: string): LucideIcon {
  const kind = key.split(":")[0];
  switch (kind) {
    case "bed":
      return Bed;
    case "oven":
      return Flame;
    case "case":
      return Store;
    case "radio":
      return Radio;
    case "ajis":
      return Store;
    case "bench":
      return Armchair;
    case "plant":
      return Sprout;
    case "water":
      return Droplets;
    case "harvest":
      return Wheat;
    case "forage":
      return Leaf;
    case "letter":
      return Mail;
    case "npc":
      return Hand;
    case "pet":
      return PawPrint;
    case "sign":
      return Signpost;
    case "animal":
      return label.startsWith("Perah") ? Milk : label.startsWith("Ambil") ? Egg : label.startsWith("Beri") ? Wheat : Heart;
    default:
      return Hand;
  }
}

/** Hapus emoji dari teks (untuk notifikasi). */
export const stripEmoji = (t: string) =>
  t
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();

/** Ikon untuk barang di katalog (lahan, upgrade, ternak, peliharaan, dekorasi). */
import {
  Bird,
  ChefHat,
  Dog,
  Fence,
  Flower,
  Footprints,
  Gem,
  Lamp,
  LandPlot,
  Rabbit,
  Refrigerator,
  Sofa,
  Warehouse,
  Cat,
  Beef,
} from "lucide-react";

export const SHOP_ICONS: Record<string, LucideIcon> = {
  land_farm2: LandPlot,
  land_ranch: Fence,
  coop: Warehouse,
  barn: Warehouse,
  fridge: Refrigerator,
  oven2: Flame,
  oven3: ChefHat,
  case_lux: Gem,
  big_case: Store,
  sprinkler: Droplets,
  bed: Bed,
  shoes: Footprints,
  chicken: Bird,
  cow: Beef,
  bunny: Rabbit,
  cat: Cat,
  dog: Dog,
  flowers: Flower,
  lanterns: Lamp,
  rug: Sofa,
  menu_board: Signpost,
};
import {
  BookOpen,
  Coffee as CoffeeIcon,
  Dumbbell,
  Glasses,
  Guitar,
  Laugh,
  Mailbox,
  Music,
  Music2,
  Package,
  PartyPopper,
  ShoppingBag,
  Smile,
  Sparkles,
  Star,
  Sun,
  Sunset,
} from "lucide-react";

/** Emote warga (di data masih berupa emoji) dipetakan ke ikon. */
export const EMOTE_ICONS: Record<string, LucideIcon> = {
  "🛍️": ShoppingBag,
  "😊": Smile,
  "☀️": Sun,
  "🕊️": Bird,
  "☕": CoffeeIcon,
  "😌": Smile,
  "😆": Laugh,
  "🏃": Footprints,
  "⭐": Star,
  "🎈": PartyPopper,
  "😄": Laugh,
  "💖": Heart,
  "💪": Dumbbell,
  "💦": Droplets,
  "🏃‍♀️": Footprints,
  "📖": BookOpen,
  "🤓": Glasses,
  "✨": Sparkles,
  "🌷": Flower2,
  "🌻": Flower,
  "🌹": Flower2,
  "🎶": Music,
  "🎸": Guitar,
  "🎵": Music2,
  "💕": Heart,
  "🌇": Sunset,
  "👋": Hand,
  "📮": Mailbox,
  "✉️": Mail,
  "📦": Package,
};

/** Ikon barang katalog berwarna. */
export function ShopIcon({ id, size = 24 }: { id: string; size?: number }) {
  const Icon = SHOP_ICONS[id] ?? Sparkles;
  // Gambar dari public/shop/<id>.png kalau sudah ada (hasil GPT), selain itu ikon Lucide.
  return (
    <ImageOr
      src={`/shop/${id}.webp`}
      alt={id}
      className="h-full w-full object-contain"
      fallback={<Icon size={size} className="text-[#8a5530]" strokeWidth={2.2} />}
    />
  );
}