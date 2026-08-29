// موتور تولید سؤال‌های جدول ضرب و ضرب فرآیندی — همه‌ی محاسبات برنامه‌نویسی شده و صددرصد درست

export type QType = "basic" | "process";

export interface Question {
  type: QType;
  /** a × b  (در فرآیندی: یک‌رقمی × دورقمی) */
  a: number;
  b: number;
  /** حاصل‌ضرب‌های جزئی در ضرب فرآیندی: a × دهگان و a × یکان */
  p1?: number; // a × (دهگان×۱۰)
  p2?: number; // a × یکان
  tens?: number; // بخش دهگان b
  ones?: number; // بخش یکان b
  answer: number;
  options: number[]; // ۴ گزینه (جابجاشده، شامل جواب درست)
  level: number; // 1 | 2 | 3
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** سه گزینه‌ی غلط ولی نزدیک به جواب درست می‌سازد */
const pickDistractors = (answer: number, pool: number[]): number[] => {
  const uniq = [...new Set(pool.filter((n) => Number.isFinite(n) && n > 0 && n !== answer))];
  const picked = shuffle(uniq).slice(0, 3);
  // اگر استخر کافی نبود، با اعداد تصادفی نزدیک پر کن
  let guard = 0;
  while (picked.length < 3 && guard < 50) {
    const n = answer + rand(1, 12) * (Math.random() < 0.5 ? -1 : 1);
    if (n > 0 && n !== answer && !picked.includes(n)) picked.push(n);
    guard++;
  }
  return picked;
};

/** سؤال جدول ضرب با زوج مشخص: یک‌رقمی × یک‌رقمی */
const makeBasicPair = (a: number, b: number, level: number): Question => {
  const answer = a * b;
  const pool = [
    answer + a,
    answer - a,
    answer + b,
    answer - b,
    answer + 10,
    answer - 10,
    (a + 1) * b,
    a * (b + 1),
    answer + 1,
    answer - 1,
  ];
  return {
    type: "basic",
    a,
    b,
    answer,
    options: shuffle([answer, ...pickDistractors(answer, pool)]),
    level,
  };
};

/** سؤال ضرب فرآیندی: یک‌رقمی × دورقمی با نمایش حاصل‌ضرب‌های جزئی و جای خالی برای جمع */
const makeProcess = (level: number, tensMax: number): Question => {
  const a = rand(4, 9);
  const tens = rand(3, tensMax);
  const ones = rand(3, 9);
  const b = tens * 10 + ones;
  const p1 = a * tens * 10; // a × دهگان
  const p2 = a * ones; // a × یکان
  const answer = a * b; // = p1 + p2  (مطمئن و درست)
  const pool = [
    p1 + ones, // اشتباه رایج: فراموش کردن ضرب یکان
    answer + 10,
    answer - 10,
    answer + a,
    answer - a,
    answer + 1,
    answer - 1,
    answer + 20,
  ];
  return {
    type: "process",
    a,
    b,
    p1,
    p2,
    tens,
    ones,
    answer,
    options: shuffle([answer, ...pickDistractors(answer, pool)]),
    level,
  };
};

/**
 * ساخت ۱۰ سؤال بر اساس لول انتخابی دانش‌آموز
 * - لول ۱ (آسان): ضرب‌های کوچک ۲ تا ۵ در ۲ تا ۹ — بدون زوج تکراری
 * - لول ۲ (متوسط): جدول ضرب کامل ۳ تا ۹ — بدون زوج تکراری
 * - لول ۳ (سخت): ضرب فرآیندی یک‌رقمی × دورقمی
 */
export const buildQuestions = (level: 1 | 2 | 3): Question[] => {
  const qs: Question[] = [];
  if (level === 1) {
    const pairs: [number, number][] = [];
    for (let a = 2; a <= 5; a++) for (let b = 2; b <= 9; b++) if (a <= b) pairs.push([a, b]);
    for (const [a, b] of shuffle(pairs).slice(0, 10)) qs.push(makeBasicPair(a, b, level));
  } else if (level === 2) {
    const pairs: [number, number][] = [];
    for (let a = 3; a <= 9; a++) for (let b = 3; b <= 9; b++) if (a <= b) pairs.push([a, b]);
    for (const [a, b] of shuffle(pairs).slice(0, 10)) qs.push(makeBasicPair(a, b, level));
  } else {
    const used = new Set<string>();
    let guard = 0;
    while (qs.length < 10 && guard < 500) {
      const q = makeProcess(level, 7);
      const key = `${q.a}x${q.b}`;
      if (!used.has(key)) {
        used.add(key);
        qs.push(q);
      }
      guard++;
    }
  }
  return shuffle(qs);
};

/* ---------- تبدیل اعداد به رقم فارسی ---------- */
const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export const toFa = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => FA[Number(d)]);
