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

/** سؤال جدول ضرب: یک‌رقمی × یک‌رقمی */
const makeBasic = (level: number): Question => {
  const a = rand(3, 9);
  const b = rand(3, 9);
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
  const a = level === 3 ? rand(4, 9) : rand(2, 7);
  const tens = rand(level === 3 ? 3 : 1, tensMax);
  const ones = rand(level === 3 ? 3 : 2, 9);
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

const shuffleLevel = (qs: Question[]): Question[] => {
  // جابجایی سؤال‌ها فقط داخل هر مرحله تا سختی پلکانی حفظ شود
  const groups = new Map<number, Question[]>();
  qs.forEach((q) => {
    const g = groups.get(q.level) ?? [];
    g.push(q);
    groups.set(q.level, g);
  });
  const out: Question[] = [];
  [...groups.keys()].sort((x, y) => x - y).forEach((lv) => out.push(...shuffle(groups.get(lv)!)));
  return out;
};

/** ۱۰ سؤال: ۴ تا جدول ضرب، ۳ تا فرآیندی، ۳ تا چالش فرآیندی سخت‌تر */
export const buildQuestions = (): Question[] => {
  const qs: Question[] = [];
  for (let i = 0; i < 4; i++) qs.push(makeBasic(1));
  for (let i = 0; i < 3; i++) qs.push(makeProcess(2, 5));
  for (let i = 0; i < 3; i++) qs.push(makeProcess(3, 7));
  return shuffleLevel(qs);
};

/* ---------- تبدیل اعداد به رقم فارسی ---------- */
const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export const toFa = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => FA[Number(d)]);
