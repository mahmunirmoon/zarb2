// مدیر صدا: موسیقی پس‌زمینه‌ی کودکانه (ملودی شاد و بلندتر با WebAudio) + افکت‌های صوتی
// تشویق (دست زدن)، بوق خطا، زنگ درست، فانفار

const C3 = 130.81, E3 = 164.81, F3 = 174.61, G3 = 196.0, A3 = 220.0;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.0, A4 = 440.0, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
const F2 = 87.31, G2 = 98.0, A2 = 110.0;

/** درجه‌های گام دو ماژور → فرکانس (۱ = دو۴) */
const DEG: Record<number, number> = {
  1: C4, 2: D4, 3: E4, 4: F4, 5: G4, 6: A4, 7: B4,
  8: C5, 9: D5, 10: E5, 11: F5, 12: G5,
};

/**
 * ملودی شاد کودکانه — ۸ عبارت ۱۶ ضربی (۱۲۸ هشتم ≈ ۳۳ ثانیه تا تکرار)
 * صفر = سکوت؛ بقیه درجه‌های گام
 */
const PHRASES: number[][] = [
  [3, 3, 5, 3, 8, 0, 5, 0, 3, 5, 8, 5, 3, 0, 0, 0],
  [4, 4, 6, 4, 9, 0, 6, 0, 4, 6, 9, 6, 5, 0, 0, 0],
  [5, 5, 7, 5, 10, 0, 7, 0, 5, 7, 10, 7, 8, 0, 0, 0],
  [8, 8, 10, 8, 12, 0, 10, 0, 9, 8, 6, 5, 3, 0, 0, 0],
  [12, 10, 8, 10, 9, 8, 6, 8, 6, 8, 9, 8, 5, 0, 0, 0],
  [3, 5, 6, 8, 9, 8, 6, 5, 6, 5, 4, 5, 3, 0, 0, 0],
  [8, 9, 10, 12, 10, 9, 8, 6, 8, 9, 8, 6, 5, 0, 0, 0],
  [6, 6, 8, 6, 5, 4, 3, 4, 5, 6, 5, 4, 3, 0, 0, 0],
];
const MELODY: (number | null)[] = [];
for (const p of PHRASES) for (const d of p) MELODY.push(d === 0 ? null : DEG[d]);

/** ریشه‌ی آکورد هر میزان (۳۲ میزان = ۱۲۸ هشتم) */
const CHORDS: number[] = [
  C3, C3, F2, F2, C3, C3, G2, G2,
  C3, C3, F2, F2, C3, G2, C3, C3,
  A2, A2, F2, F2, C3, C3, G2, G2,
  A2, A2, F2, F2, C3, G2, C3, C3,
];

const BPM = 118;
const EIGHTH = 60 / BPM / 2;

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  muted = false;
  private musicPlaying = false;

  /** باید داخل یک تعامل کاربر (کلیک) صدا زده شود */
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      // باس موسیقی بلندتر از قبل
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.42;
      this.musicBus.connect(this.master);
      // اکوی ملایم برای پرحجم‌تر شدن موسیقی
      const delay = this.ctx.createDelay(1);
      delay.delayTime.value = EIGHTH * 1.5;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.3;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.3;
      this.musicBus.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.9;
      this.sfxBus.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.02);
    }
  }

  private tone(
    freq: number,
    when: number,
    dur: number,
    opts: { type?: OscillatorType; gain?: number; bus?: GainNode | null; slideTo?: number } = {}
  ) {
    if (!this.ctx) return;
    const { type = "triangle", gain = 0.3, bus = this.sfxBus, slideTo } = opts;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), when + dur);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g);
    g.connect(bus ?? this.master!);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  private noise(when: number, dur: number, freq: number, gain: number, q = 1.2) {
    if (!this.ctx) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(bp).connect(g).connect(this.sfxBus!);
    src.start(when);
    src.stop(when + dur + 0.02);
  }

  /* ---------------- موسیقی پس‌زمینه ---------------- */
  startMusic() {
    this.ensure();
    if (this.musicPlaying || !this.ctx) return;
    this.musicPlaying = true;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 60);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private schedule() {
    if (!this.ctx || !this.musicPlaying) return;
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const idx = this.step % MELODY.length;
      const note = MELODY[idx];
      const t = this.nextTime;
      if (note !== null) {
        // ملودی اصلی + یک لایه‌ی اکتاو بالاتر برای درخشش بیشتر
        this.tone(note, t, EIGHTH * 0.95, { type: "triangle", gain: 0.55, bus: this.musicBus });
        this.tone(note * 2, t, EIGHTH * 0.6, { type: "sine", gain: 0.13, bus: this.musicBus });
      }
      // بیس: ریشه‌ی آکورد روی ضرب اول و پنجمِ هر میزان
      const bar = Math.floor(idx / 4);
      const root = CHORDS[bar % CHORDS.length];
      if (idx % 4 === 0) this.tone(root, t, EIGHTH * 3.6, { type: "sine", gain: 0.5, bus: this.musicBus });
      if (idx % 4 === 2) this.tone(root * 1.5, t, EIGHTH * 1.2, { type: "triangle", gain: 0.22, bus: this.musicBus });
      // شیکر سبک روی هشتم‌ها
      if (idx % 2 === 0) this.noise(t, 0.03, idx % 4 === 0 ? 6800 : 4800, 0.05, 2);
      this.nextTime += EIGHTH;
      this.step++;
    }
  }

  /* ---------------- افکت‌ها ---------------- */
  click() {
    this.ensure();
    if (!this.ctx) return;
    this.tone(700, this.ctx.currentTime, 0.07, { type: "square", gain: 0.12, slideTo: 950 });
  }

  correct() {
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [C5, E5, G5].forEach((f, i) => this.tone(f, t + i * 0.09, 0.22, { type: "triangle", gain: 0.32 }));
    this.noise(t + 0.02, 0.12, 5200, 0.06, 2);
  }

  wrong() {
    // بوق خطا
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(160, t, 0.4, { type: "sawtooth", gain: 0.28, slideTo: 70 });
    this.tone(155, t, 0.4, { type: "square", gain: 0.14, slideTo: 66 });
  }

  fanfare() {
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [C5, E5, G5, C5 * 2].forEach((f, i) =>
      this.tone(f, t + i * 0.13, 0.5, { type: "triangle", gain: 0.3 })
    );
    [C4, G4].forEach((f) => this.tone(f, t + 0.55, 1.1, { type: "triangle", gain: 0.22 }));
    this.tone(C5 * 2, t + 0.55, 1.0, { type: "triangle", gain: 0.2 });
    this.tone(F5, t + 0.72, 0.9, { type: "triangle", gain: 0.16 });
    void E3; void F3; void A3; // ثابت‌های رزرو گام
  }

  /** صدای دست زدن — چند dozen کف با نویز فیلترشده */
  applause(duration = 2.6) {
    this.ensure();
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + 0.05;
    const count = Math.floor(duration * 16);
    for (let i = 0; i < count; i++) {
      const t = t0 + Math.random() * duration;
      this.noise(t, 0.05 + Math.random() * 0.03, 1100 + Math.random() * 1600, 0.16 + Math.random() * 0.1, 0.9);
    }
    // موج دوم تشویق
    for (let i = 0; i < count / 2; i++) {
      const t = t0 + duration * 0.35 + Math.random() * duration * 0.75;
      this.noise(t, 0.05, 1400 + Math.random() * 1400, 0.12, 0.8);
    }
  }
}

export const audio = new AudioManager();
