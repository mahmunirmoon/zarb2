export function StudentCredit() {
  return (
    <>
      {/* Hide the two older duplicated credit lines inside App.tsx.
          This keeps only the unified card below. */}
      <style>{`
        p.font-display.mt-6.flex.items-center {
          display: none !important;
        }

        p.relative.z-10.mx-auto.mt-8.mb-3 {
          display: none !important;
        }
      `}</style>

      <div
        dir="rtl"
        className="relative z-20 mx-auto mb-5 mt-3 w-fit max-w-[94vw] rounded-2xl border-[3px] border-ink bg-white/95 px-5 py-3 text-center text-sm font-black leading-7 text-ink-soft shadow-[3px_4px_0_rgba(51,48,107,0.18)] sm:px-7 sm:py-4"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
          <span className="text-candy">💗</span>
          <span>این اولین برنامه</span>
          <span className="font-display text-lg text-candy">آوینا، ۸ ساله از دبی</span>
          <span>است که در کلاس</span>
          <span className="font-display text-lg text-grape">خانم دکتر ماه منیر آقایی</span>
          <span>ساخته شده است.</span>
        </div>

        <div className="mt-1.5">
          شماره تماس استاد:{" "}
          <a
            href="tel:00971551544988"
            dir="ltr"
            className="font-black text-grape underline decoration-grape/40 underline-offset-4"
          >
            00971551544988
          </a>
        </div>
      </div>
    </>
  );
}
