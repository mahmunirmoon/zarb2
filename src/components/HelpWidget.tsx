import { useEffect, useState } from "react";

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.7 9.2a2.6 2.6 0 0 1 5 .9c0 2.1-2.7 2.3-2.7 4.1" />
    <circle cx="12" cy="17.3" r=".8" fill="currentColor" stroke="none" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const Step = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-grape text-xs font-black text-white">
      {n}
    </span>
    <span className="pt-0.5 text-sm font-bold leading-7 text-ink-soft">{children}</span>
  </li>
);

export function HelpWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-[90] inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-sm font-black text-ink shadow-[3px_4px_0_rgba(51,48,107,0.18)] transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:left-5 sm:top-5"
        aria-label="باز کردن راهنمای بازی"
        title="راهنمای بازی"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-grape text-white">
          <HelpIcon />
        </span>
        <span>راهنما</span>
        <span className="hidden text-[10px] font-black text-grape sm:inline">HELP</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-ink/45 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zarb-help-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <section className="mx-auto my-3 w-full max-w-2xl overflow-hidden rounded-[28px] border-[4px] border-ink bg-paper shadow-[8px_10px_0_rgba(51,48,107,0.2)] sm:my-8">
            <header className="relative border-b-[3px] border-ink bg-[#fff7d6] p-5 sm:p-7">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute left-3 top-3 grid h-11 w-11 place-items-center rounded-full border-[3px] border-ink bg-white text-ink"
                aria-label="بستن راهنما"
              >
                <CloseIcon />
              </button>

              <div className="pe-12 text-center">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-grape px-3 py-1.5 text-xs font-black text-white">
                  <HelpIcon />
                  راهنمای بازی
                </div>
                <h2 id="zarb-help-title" className="font-display text-3xl text-ink sm:text-4xl">
                  این برنامه چه کار می‌کند؟
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-7 text-ink-soft">
                  این برنامه یک بازی آموزشی جدول ضرب است که با سؤال‌های چندگزینه‌ای،
                  زمان‌سنج، امتیاز، صدا و مراحل مختلف به تمرین ضرب کمک می‌کند.
                </p>
              </div>
            </header>

            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
              <article className="rounded-2xl border-[3px] border-ink bg-white p-4">
                <h3 className="font-display text-xl text-candy">ورودی برنامه چیست؟</h3>
                <ul className="mt-3 space-y-2 text-sm font-bold leading-7 text-ink-soft">
                  <li>• نام بازیکن</li>
                  <li>• انتخاب سطح بازی: آسان، متوسط یا سخت</li>
                  <li>• در هر سؤال، انتخاب یکی از ۴ پاسخ</li>
                </ul>
              </article>

              <article className="rounded-2xl border-[3px] border-ink bg-white p-4">
                <h3 className="font-display text-xl text-grape">روش استفاده</h3>
                <ol className="mt-3 space-y-2">
                  <Step n="۱">نامت را وارد کن و وارد بخش انتخاب مرحله شو.</Step>
                  <Step n="۲">یکی از سه سطح آسان، متوسط یا سخت را انتخاب کن.</Step>
                  <Step n="۳">برای هر سؤال قبل از تمام شدن زمان، پاسخ درست را بزن.</Step>
                  <Step n="۴">در پایان، امتیاز و نتیجهٔ بازی را ببین و دوباره تمرین کن.</Step>
                </ol>
              </article>

              <article className="rounded-2xl border-[3px] border-ink bg-[#eefaff] p-4 sm:col-span-2">
                <h3 className="font-display text-xl text-ocean">در هر سطح چه چیزی تمرین می‌شود؟</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-3 text-center">
                    <div className="font-display text-lg text-mint">آسان</div>
                    <div className="mt-1 text-xs font-bold leading-6 text-ink-soft">ضرب‌های ۲ تا ۵</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center">
                    <div className="font-display text-lg text-tang">متوسط</div>
                    <div className="mt-1 text-xs font-bold leading-6 text-ink-soft">ضرب‌های ۳ تا ۹</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center">
                    <div className="font-display text-lg text-grape">سخت</div>
                    <div className="mt-1 text-xs font-bold leading-6 text-ink-soft">یک‌رقمی × دورقمی</div>
                  </div>
                </div>
              </article>
            </div>

            <footer className="border-t-[3px] border-ink bg-[#fff7d6] px-4 py-4 text-center text-xs font-bold leading-6 text-ink-soft">
              هر مرحله ۱۰ سؤال دارد. پاسخ درست امتیاز اضافه می‌کند و پاسخ اشتباه از امتیاز کم می‌کند.
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
