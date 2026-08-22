import type { Question } from "../game/questions";
import { toFa } from "../game/questions";
import { PinDot, Tape } from "./Icons";

interface Props {
  q: Question;
}

/** کارت سؤال به سبک پین‌های پینترست؛ در ضرب فرآیندی، جواب جمع مرحله‌ی آخر نوشته نمی‌شود تا خود دانش‌آموز پیدا کند */
export default function QuestionCard({ q }: Props) {
  return (
    <div key={`${q.a}x${q.b}`} className="card-pop relative rounded-3xl border-[3.5px] border-ink bg-paper px-5 py-6 shadow-[8px_10px_0_rgba(51,48,107,0.18)] sm:px-8">
      <PinDot color={q.type === "basic" ? "#4cc9f0" : "#ff5d8f"} />
      <Tape color="#3ddc97" className="-left-5 -top-2 -rotate-12" />
      <Tape color="#ffc53d" className="-right-5 -bottom-2 -rotate-6" />

      {q.type === "basic" ? (
        <div className="flex flex-col items-center gap-2 pt-2">
          <span className="text-sm font-bold text-ink-soft">حاصل ضرب چند می‌شود؟</span>
          <div dir="ltr" className="font-display text-6xl leading-tight text-ink sm:text-7xl">
            {toFa(q.a)} <span className="text-candy">×</span> {toFa(q.b)} <span className="text-ocean">=</span>{" "}
            <span className="inline-block min-w-[1.4em] rounded-2xl border-4 border-dashed border-grape bg-white px-2 text-center text-grape">؟</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-1">
          <span className="mb-1 text-sm font-bold text-ink-soft">ضرب فرآیندی — اول خرد کن، بعد جمع کن!</span>

          {/* بالای درخت */}
          <div dir="ltr" className="font-display rounded-2xl border-[3px] border-ink bg-lemon px-6 py-1.5 text-3xl text-ink shadow-[3px_4px_0_rgba(51,48,107,0.9)] sm:text-4xl">
            {toFa(q.a)} × {toFa(q.b)}
          </div>

          {/* شاخه‌ها */}
          <svg viewBox="0 0 400 70" className="w-full max-w-[420px]" aria-hidden>
            <path d="M200 0 C200 30, 105 25, 105 70" fill="none" stroke="#33306b" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" />
            <path d="M200 0 C200 30, 295 25, 295 70" fill="none" stroke="#33306b" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" />
          </svg>

          {/* حاصل‌ضرب‌های جزئی (ضرب‌ها نمایش داده می‌شوند) */}
          <div dir="ltr" className="flex w-full max-w-[440px] items-stretch justify-between gap-3 px-1">
            <div className="flex-1 rounded-2xl border-[3px] border-ink bg-ocean/90 px-3 py-2 text-center shadow-[3px_4px_0_rgba(51,48,107,0.85)]">
              <div className="font-display text-xl text-white sm:text-2xl">{toFa(q.a)} × {toFa(q.tens! * 10)}</div>
              <div className="font-display text-2xl text-lemon sm:text-3xl">= {toFa(q.p1!)}</div>
            </div>
            <div className="flex-1 rounded-2xl border-[3px] border-ink bg-candy px-3 py-2 text-center shadow-[3px_4px_0_rgba(51,48,107,0.85)]">
              <div className="font-display text-xl text-white sm:text-2xl">{toFa(q.a)} × {toFa(q.ones!)}</div>
              <div className="font-display text-2xl text-lemon sm:text-3xl">= {toFa(q.p2!)}</div>
            </div>
          </div>

          {/* مرحله‌ی جمع: جواب نوشته نمی‌شود؛ خود دانش‌آموز پیدا می‌کند */}
          <svg viewBox="0 0 400 46" className="w-full max-w-[420px]" aria-hidden>
            <path d="M105 0 C105 34, 200 16, 200 46" fill="none" stroke="#33306b" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" />
            <path d="M295 0 C295 34, 200 16, 200 46" fill="none" stroke="#33306b" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" />
          </svg>

          <div dir="ltr" className="flex items-center gap-2 rounded-2xl border-4 border-dashed border-grape bg-white px-5 py-2 shadow-[0_4px_0_rgba(155,93,229,0.35)]">
            <span className="font-display text-2xl text-ink sm:text-3xl">{toFa(q.p1!)}</span>
            <span className="font-display text-2xl text-candy sm:text-3xl">+</span>
            <span className="font-display text-2xl text-ink sm:text-3xl">{toFa(q.p2!)}</span>
            <span className="font-display text-2xl text-ocean sm:text-3xl">=</span>
            <span className="font-display inline-block min-w-[1.6em] rounded-xl bg-grape px-2 text-center text-2xl text-white sm:text-3xl">؟</span>
          </div>
        </div>
      )}
    </div>
  );
}
