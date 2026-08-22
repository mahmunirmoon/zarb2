// مدیر صدا: موسیقی پس‌زمینه‌ی کودکانه (ملودی شاد با WebAudio) + افکت‌های صوتی
// تشویق (دست زدن)، بوق خطا، زنگ درست، فانفار

const C3 = 130.81, E3 = 164.81, F3 = 174.61, G3 = 196.0, A3 = 220.0;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.0, A4 = 440.0, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;

// ملودی شاد کودکانه (نت‌های هشتم؛ null = سکوت)
const MELODY: (number | null)[] = [
  C4, E4, G4, E4, C5, E4, G4, E4,
  A4, null, G4, null, E4, null, C4, null,
  D4, F4, A4, F4, D5, F4, A4, F4,
  G4, null, B4, null, D5, null, G4, null,
  C4, E4, G4, C5, B4, G4, E4, G4,
  A4, C5, A4, F4, E4, C4, E4, G4,
  F4, A4, G4, B4, C5, null, E5, null,
  G5, null, E5, null, C5, null, null, null,
];
const BASS: number[] = [C3, A3, F3, G3, C3, F3, G3, C3];
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
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.16;
      this.musicBus.connect(this.master);
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
        this.tone(note, t, EIGHTH * 0.92, { type: "triangle", gain: 0.5, bus: this.musicBus });
        this.tone(note * 2, t, EIGHTH * 0.6, { type: "sine", gain: 0.08, bus: this.musicBus });
      }
      // بیس روی ضرب‌ها
      if (idx % 4 === 0) {
        const bass = BASS[Math.floor(idx / 8) % BASS.length];
        this.tone(bass, t, EIGHTH * 3.4, { type: "sine", gain: 0.42, bus: this.musicBus });
      }
      // تیک شاد (پرکاشن سبک)
      this.noise(t, 0.03, idx % 2 === 0 ? 6500 : 4800, 0.05, 2);
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

  levelUp() {
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [G4, C5, E5, G5, C5 * 2].forEach((f, i) =>
      this.tone(f, t + i * 0.1, 0.25, { type: "triangle", gain: 0.3 })
    );
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
