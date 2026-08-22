import { useEffect, useRef } from "react";

export const CANDY = ["#ff5d8f", "#ffc53d", "#3ddc97", "#4cc9f0", "#ff9f45", "#9b5de5", "#ffffff"];

/* ---------------- باس رویداد ذرات ---------------- */
type FxEvent =
  | { kind: "burst"; x: number; y: number; colors: string[]; count: number; power: number }
  | { kind: "confetti"; count: number };

type Listener = (e: FxEvent) => void;
const listeners = new Set<Listener>();

export const fx = {
  on(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  burst(x: number, y: number, colors = CANDY, count = 26, power = 7) {
    listeners.forEach((l) => l({ kind: "burst", x, y, colors, count, power }));
  },
  confetti(count = 160) {
    listeners.forEach((l) => l({ kind: "confetti", count }));
  },
};

interface Particle {
  x: number; y: number; vx: number; vy: number;
  g: number; life: number; ttl: number;
  size: number; color: string; shape: 0 | 1; rot: number; vr: number;
}

/* ---------------- لایه‌ی ذرات و بارش کاغذرنگی ---------------- */
export function FxCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const off = fx.on((e) => {
      if (e.kind === "burst") {
        for (let i = 0; i < e.count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const sp = (0.35 + Math.random()) * e.power;
          parts.current.push({
            x: e.x, y: e.y,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2.5,
            g: 0.22, life: 0, ttl: 46 + Math.random() * 26,
            size: 4 + Math.random() * 6,
            color: e.colors[Math.floor(Math.random() * e.colors.length)],
            shape: Math.random() < 0.5 ? 0 : 1,
            rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
          });
        }
      } else {
        const w = window.innerWidth;
        for (let i = 0; i < e.count; i++) {
          parts.current.push({
            x: Math.random() * w, y: -30 - Math.random() * window.innerHeight * 0.5,
            vx: (Math.random() - 0.5) * 2.2, vy: 2 + Math.random() * 3.4,
            g: 0.03, life: 0, ttl: 220 + Math.random() * 90,
            size: 6 + Math.random() * 7,
            color: CANDY[Math.floor(Math.random() * CANDY.length)],
            shape: Math.random() < 0.6 ? 1 : 0,
            rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25,
          });
        }
      }
    });

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const arr = parts.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life++;
        if (p.life > p.ttl || p.y > window.innerHeight + 40) {
          arr.splice(i, 1);
          continue;
        }
        p.vy += p.g;
        p.vx *= 0.985;
        p.x += p.vx + Math.sin((p.life + p.rot * 10) * 0.12) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        const alpha = 1 - p.life / p.ttl;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        }
        ctx.restore();
      }
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      off();
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-40" aria-hidden />;
}

/* ---------------- پس‌زمینه‌ی محیطی: شکل‌های شناور ---------------- */
interface Float {
  x: number; y: number; r: number; vx: number; vy: number;
  color: string; shape: number; rot: number; vr: number; alpha: number;
}

export function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const resize = () => {
      canvas.width = W() * dpr;
      canvas.height = H() * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const items: Float[] = [];
    const n = 34;
    for (let i = 0; i < n; i++) {
      items.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        r: i < 5 ? 90 + Math.random() * 70 : 7 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(0.12 + Math.random() * 0.4),
        color: CANDY[Math.floor(Math.random() * (CANDY.length - 1))],
        shape: Math.floor(Math.random() * 4),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.012,
        alpha: i < 5 ? 0.1 : 0.28 + Math.random() * 0.22,
      });
    }

    const star = (x: number, y: number, r: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? r : r * 0.45;
        const a = rot + (i * Math.PI) / 5;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, W(), H());
      for (const it of items) {
        it.x += it.vx;
        it.y += it.vy;
        it.rot += it.vr;
        if (it.y < -it.r - 20) { it.y = H() + it.r + 10; it.x = Math.random() * W(); }
        if (it.x < -it.r - 20) it.x = W() + it.r;
        if (it.x > W() + it.r + 20) it.x = -it.r;
        ctx.save();
        ctx.globalAlpha = it.alpha;
        ctx.fillStyle = it.color;
        if (it.shape === 0) {
          ctx.beginPath();
          ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (it.shape === 1) {
          star(it.x, it.y, it.r * 1.3, it.rot);
        } else if (it.shape === 2) {
          ctx.translate(it.x, it.y);
          ctx.rotate(it.rot);
          ctx.fillRect(-it.r / 1.6, -it.r / 1.6, it.r * 1.25, it.r * 1.25);
        } else {
          ctx.translate(it.x, it.y);
          ctx.rotate(it.rot);
          ctx.beginPath();
          ctx.moveTo(0, -it.r);
          ctx.lineTo(it.r, it.r);
          ctx.lineTo(-it.r, it.r);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}
