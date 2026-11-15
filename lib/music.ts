// Pemutar musik. Isi PLAYLIST dengan lagu milikmu (taruh file di public/music).
// Selama playlist kosong, yang diputar adalah loop lo-fi sederhana buatan WebAudio.

export type Track = { title: string; src: string };

export const PLAYLIST: Track[] = [
  { title: "Lo-fi Toko Kue (Higgsfield)", src: "/music/lofi-bakery.m4a" },
  // { title: "Lagu kita", src: "/music/lagu-kita.mp3" },
];

export const trackCount = () => Math.max(1, PLAYLIST.length);
export const trackTitle = (i: number) => PLAYLIST[i]?.title ?? "Lo-fi santai (bawaan)";

let audio: HTMLAudioElement | null = null;
let onEnded: (() => void) | null = null;

let ctx: AudioContext | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

// Cmaj7 – Am7 – Fmaj7 – G7
const CHORDS = [
  [130.81, 164.81, 196.0, 246.94],
  [110.0, 130.81, 164.81, 196.0],
  [87.31, 130.81, 164.81, 220.0],
  [98.0, 146.83, 174.61, 246.94],
];
const CHORD_SECONDS = 4;

function startSynth() {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const c = new AC();
  ctx = c;
  const master = c.createGain();
  master.gain.value = 0.16;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.connect(master).connect(c.destination);

  let step = 0;
  const playChord = () => {
    const t = c.currentTime + 0.05;
    for (const freq of CHORDS[step % CHORDS.length]) {
      const osc = c.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq * 2;
      osc.detune.value = (Math.random() - 0.5) * 14; // sedikit fals biar hangat
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.6);
      g.gain.linearRampToValueAtTime(0, t + CHORD_SECONDS + 0.4);
      osc.connect(g).connect(filter);
      osc.start(t);
      osc.stop(t + CHORD_SECONDS + 0.5);
    }
    step++;
  };
  playChord();
  timer = setInterval(playChord, CHORD_SECONDS * 1000);
}

export function stopMusic() {
  if (audio) {
    audio.pause();
    audio = null;
  }
  if (timer) clearInterval(timer);
  timer = null;
  if (ctx) void ctx.close();
  ctx = null;
}

/** Harus dipanggil langsung dari handler klik (aturan autoplay browser). */
export function playMusic(index: number, handleEnded: () => void) {
  stopMusic();
  onEnded = handleEnded;
  const track = PLAYLIST[index];
  if (!track) return startSynth();
  audio = new Audio(track.src);
  audio.volume = 0.4; // backsound pelan supaya efek suara tetap terdengar
  audio.addEventListener("ended", () => onEnded?.());
  void audio.play().catch(() => {});
}
