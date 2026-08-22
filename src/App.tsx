import { useEffect, useRef, useState } from "react";
import QuestionCard from "./components/QuestionCard";
import { AmbientCanvas, FxCanvas, fx, CANDY } from "./components/Canvases";
import {
  StarIcon, CheckIcon, XIcon, PauseIcon, PlayIcon, SoundOnIcon, SoundOffIcon,
  TrophyIcon, RefreshIcon, ClockIcon, MusicIcon, PencilIcon, HeartIcon, PinDot, Tape,
} from "./components/Icons";
import { audio } from "./game/audio";
import { buildQuestions, toFa, type Question } from "./game/questions";

type Phase = "start" | "playing" | "interlude" | "result";
interface Feedback { chosen: number | null; ok: boolean; timedOut?: boolean }
interface Popup { id: number; text: string; x: number; y: number; kind: "good" | "bad" | "warn" }

const LEVELS = [
  { id: 1, name: "جدول ضرب", desc: "ضرب‌های یک‌رقمی را حساب کن!", time: 35, color: "#4cc9f0", count: 4 },
  { id: 2, name: "ضرب فرآیندی", desc: "خرد کن، ضرب کن، خودش جمع کن!", time: 55, color: "#ff5d8f", count: 3 },
  { id: 3, name: "چالش ستاره‌ها", desc: "فرآیندیِ سخت‌تر برای قهرمان‌ها!", time: 45, color: "#9b5de5", count: 3 },
];
const TOTAL = 10;
const BONUS = 50;
const levelOf = (i: number) => (i < 4 ? 0 : i < 7 ? 1 : 2);
const fmtScore = (n: number) => (n < 0 ? `−${toFa(Math.abs(n))}` : toFa(n));

const CHOICE_STYLE = [
  { bg: "bg-ocean", text: "text-white" },
  { bg: "bg-candy", text: "text-white" },
  { bg: "bg-mint", text: "text-ink" },
  { bg: "bg-tang", text: "text-white" },
];
const CHOICE_LABEL = ["الف", "ب", "ج", "د"];

export default function App() {
  const [phase, setPhase] = useState<Phase>("start");
  const [inputName, setInputName] = useState(() => localStorage.getItem("zarb-name") ?? "");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [shakeOn, setShakeOn] = useState(false);

  const feedbackRef = useRef<Feedback | null>(null);
  const timeRef = useRef(LEVELS[0].time);
  const advanceRef = useRef<number | null>(null);
  const shakeRef = useRef<number | null>(null);
  const popupId = useRef(0);

  const level = levelOf(qIndex);
  const q = questions[qIndex];

  /* ---------- ابزارها ---------- */
  const addPopup = (text: string, x: number, y: number, kind: Popup["kind"]) => {
    const id = ++popupId.current;
    setPopups((p) => [...p, { id, text, x, y, kind }]);
    window.setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), 1000);
  };

  const doShake = () => {
    setShakeOn(true);
    if (shakeRef.current) window.clearTimeout(shakeRef.current);
    shakeRef.current = window.setTimeout(() => setShakeOn(false), 550);
  };

  const resetTimer = (lv: number) => {
    timeRef.current = LEVELS[lv].time;
    setTimeLeft(LEVELS[lv].time);
  };

  /* ---------- شروع بازی ---------- */
  const startGame = (nm: string) => {
    audio.ensure();
    audio.startMusic();
    audio.click();
    localStorage.setItem("zarb-name", nm);
    setName(nm);
    setQuestions(buildQuestions());
    setQIndex(0);
    setScore(0);
    setBonus(0);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setPaused(false);
    feedbackRef.current = null;
    setFeedback(null);
    resetTimer(0);
    setPhase("playing");
  };

  const handleStart = () => {
    const nm = inputName.trim();
    if (!nm) {
      setNameError(true);
      audio.ensure();
      audio.wrong();
      window.setTimeout(() => setNameError(false), 700);
      return;
    }
    startGame(nm);
  };

  /* ---------- جلو رفتن ---------- */
  const scheduleNext = (fromIndex: number, newResults: boolean[]) => {
    advanceRef.current = window.setTimeout(() => {
      feedbackRef.current = null;
      setFeedback(null);
      if (fromIndex >= TOTAL - 1) {
        const all = newResults.length === TOTAL && newResults.every(Boolean);
        setPhase("result");
        if (all) {
          setBonus(BONUS);
          setScore((s) => s + BONUS);
        }
      } else if (levelOf(fromIndex + 1) !== levelOf(fromIndex)) {
        setPhase("interlude");
        audio.levelUp();
      } else {
        const ni = fromIndex + 1;
        setQIndex(ni);
        resetTimer(levelOf(ni));
      }
    }, 1800);
  };

  const answer = (idx: number, px: number, py: number) => {
    if (feedbackRef.current || paused || phase !== "playing" || !q) return;
    const ok = q.options[idx] === q.answer;
    const fb: Feedback = { chosen: idx, ok };
    feedbackRef.current = fb;
    setFeedback(fb);
    const newResults = [...results, ok];
    setResults(newResults);

    if (ok) {
      audio.correct();
      fx.burst(px, py, CANDY, 28, 7.5);
      addPopup("+۱۰", px, py, "good");
      setScore((s) => s + 10);
      setStreak((st) => {
        const ns = st + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      audio.wrong();
      doShake();
      addPopup("−۵", px, py, "bad");
      setScore((s) => s - 5);
      setStreak(0);
    }
    scheduleNext(qIndex, newResults);
  };

  const handleTimeout = () => {
    if (feedbackRef.current || phase !== "playing") return;
    const fb: Feedback = { chosen: null, ok: false, timedOut: true };
    feedbackRef.current = fb;
    setFeedback(fb);
    const newResults = [...results, false];
    setResults(newResults);
    audio.wrong();
    doShake();
    setScore((s) => s - 5);
    setStreak(0);
    addPopup("وقت تمام شد!", window.innerWidth / 2, window.innerHeight * 0.32, "warn");
    scheduleNext(qIndex, newResults);
  };

  const continueInterlude = () => {
    audio.click();
    const ni = qIndex + 1;
    setQIndex(ni);
    resetTimer(levelOf(ni));
    setPhase("playing");
  };

  /* ---------- تایمر سؤال ---------- */
  useEffect(() => {
    if (phase !== "playing" || paused || feedback) return;
    const iv = window.setInterval(() => {
      const t = timeRef.current - 0.1;
      if (t <= 0) {
        timeRef.current = 0;
        setTimeLeft(0);
        handleTimeout();
      } else {
        timeRef.current = t;
        setTimeLeft(t);
      }
    }, 100);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, feedback, qIndex]);

  /* ---------- کیبورد: کلیدهای ۱ تا ۴ ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "playing" || paused || feedbackRef.current) return;
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, "۱": 0, "۲": 1, "۳": 2, "۴": 3 };
      if (e.key in map) {
        const i = map[e.key];
        answer(i, window.innerWidth / 2, window.innerHeight / 2);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, qIndex, questions]);

  /* ---------- پایان بازی: تشویق و فانفار ---------- */
  useEffect(() => {
    if (phase !== "result") return;
    const perfect = results.length === TOTAL && results.every(Boolean);
    audio.fanfare();
    if (perfect) {
      audio.applause(3);
      fx.confetti(240);
      window.setTimeout(() => fx.confetti(160), 900);
    } else {
      fx.confetti(70);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- پاک‌سازی تایمرها ---------- */
  useEffect(
    () => () => {
      if (advanceRef.current) window.clearTimeout(advanceRef.current);
      if (shakeRef.current) window.clearTimeout(shakeRef.current);
    },
    []
  );

  const toggleMute = () => {
    audio.ensure();
    const m = !muted;
    setMuted(m);
    audio.setMuted(m);
    audio.click();
  };

  const correctCount = results.filter(Boolean).length;
  const timerMax = LEVELS[level].time;
  const timerPct = Math.max(0, (timeLeft / timerMax) * 100);
  const timerColor = timerPct > 50 ? "#3ddc97" : timerPct > 25 ? "#ffc53d" : "#ff5d8f";

  /* ================================================================ */
  return (
    <div className={`relative min-h-screen overflow-hidden ${shakeOn ? "shake" : ""}`}>
      <AmbientCanvas />
      <div className="dots-layer pointer-events-none fixed inset-0 z-0" />
      <FxCanvas />

      {/* ---------- پاپ‌آپ‌های امتیاز ---------- */}
      {popups.map((p) => (
        <div
          key={p.id}
          dir="ltr"
          className={`float-up pointer-events-none fixed z-50 rounded-2xl border-[3px] border-ink px-4 py-1 font-display text-2xl shadow-[3px_4px_0_rgba(51,48,107,0.85)] ${
            p.kind === "good" ? "bg-mint text-white" : p.kind === "bad" ? "bg-candy text-white" : "bg-tang text-white"
          }`}
          style={{ left: p.x, top: p.y, transform: "translate(-50%,0)" }}
        >
          {p.text}
        </div>
      ))}

      {/* ================= صفحه‌ی ورود و نام ================= */}
      {phase === "start" && (
        <StartScreen
          inputName={inputName}
          setInputName={setInputName}
          nameError={nameError}
          onStart={handleStart}
          muted={muted}
          onMute={toggleMute}
        />
      )}

      {/* ================= بازی ================= */}
      {phase === "playing" && q && (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-3 pb-10 pt-3 sm:px-5">
          {/* هاد */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded-2xl border-[3px] border-ink bg-paper px-3 py-1.5 shadow-[3px_4px_0_rgba(51,48,107,0.8)]">
              <span className="grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-ink bg-candy font-display text-xl text-white">
                {name.trim().charAt(0) || "؟"}
              </span>
              <div className="leading-tight">
                <div className="font-display text-lg text-ink">{name}</div>
                <div className="text-[11px] font-bold text-ink-soft">
                  مرحله {toFa(LEVELS[level].id)}: {LEVELS[level].name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-lemon px-4 py-1.5 shadow-[3px_4px_0_rgba(51,48,107,0.8)]">
              <StarIcon size={22} className="text-candy" />
              <span className="font-display min-w-[3ch] text-center text-2xl text-ink" dir="ltr">{fmtScore(score)}</span>
              {streak >= 2 && (
                <span className="mr-1 rounded-full bg-candy px-2 py-0.5 text-[11px] font-black text-white">
                  {toFa(streak)} پشت‌سرهم!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="btn-candy grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-ink bg-paper text-ink shadow-[3px_4px_0_rgba(51,48,107,0.8)]"
                title="صدا"
              >
                {muted ? <SoundOffIcon size={20} /> : <SoundOnIcon size={20} />}
              </button>
              <button
                onClick={() => { audio.click(); setPaused(true); }}
                className="btn-candy grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-ink bg-paper text-ink shadow-[3px_4px_0_rgba(51,48,107,0.8)]"
                title="توقف"
              >
                <PauseIcon size={20} />
              </button>
            </div>
          </div>

          {/* نوار زمان */}
          <div className="mt-3 flex items-center gap-2">
            <ClockIcon size={20} className="shrink-0 text-ink" />
            <div className="h-5 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-white/70">
              <div className="bar-shrink h-full rounded-full" style={{ width: `${timerPct}%`, background: timerColor }} />
            </div>
            <span className="font-display w-10 text-center text-xl text-ink" dir="ltr">{toFa(Math.ceil(timeLeft))}</span>
          </div>

          {/* نقطه‌های پیشرفت */}
          <div className="mt-3 flex items-center justify-center gap-1.5" dir="ltr">
            {Array.from({ length: TOTAL }).map((_, i) => {
              const done = i < results.length;
              const cur = i === qIndex && !done;
              return (
                <span
                  key={i}
                  className={`h-3.5 w-3.5 rounded-full border-2 border-ink transition-all ${
                    done
                      ? results[i] ? "bg-mint scale-100" : "bg-candy scale-100"
                      : cur ? "bg-lemon scale-125 pulse-ring" : "bg-white/80"
                  }`}
                />
              );
            })}
          </div>

          {/* سؤال */}
          <div className="mt-4">
            <QuestionCard key={qIndex} q={q} />
          </div>

          {/* گزینه‌ها */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
            {q.options.map((opt, i) => {
              const st = CHOICE_STYLE[i];
              const isCorrectOpt = opt === q.answer;
              const isChosen = feedback?.chosen === i;
              let extra = "";
              if (feedback) {
                if (isCorrectOpt) extra = "bg-mint text-white border-ink pulse-ring scale-105";
                else if (isChosen) extra = "bg-candy text-white border-ink shake opacity-90";
                else extra = `${st.bg} ${st.text} opacity-35 saturate-50`;
              } else {
                extra = `${st.bg} ${st.text}`;
              }
              return (
                <button
                  key={`${qIndex}-${i}`}
                  disabled={!!feedback}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    answer(i, r.left + r.width / 2, r.top + r.height / 2);
                  }}
                  className={`btn-candy relative flex items-center justify-center gap-3 rounded-3xl border-[3.5px] border-ink px-4 py-4 font-display text-3xl shadow-[5px_6px_0_rgba(51,48,107,0.85)] sm:py-5 sm:text-4xl ${extra} ${!feedback ? "" : "cursor-default"}`}
                >
                  <span className="absolute right-3 top-1.5 text-xs font-black opacity-70">{CHOICE_LABEL[i]}</span>
                  <span dir="ltr">{toFa(opt)}</span>
                  {feedback && isCorrectOpt && <CheckIcon size={26} className="text-white" />}
                  {feedback && isChosen && !isCorrectOpt && <XIcon size={26} className="text-white" />}
                </button>
              );
            })}
          </div>

          {/* پیام بازخورد */}
          <div className="mt-4 flex h-8 items-center justify-center">
            {feedback && (
              <span
                className={`card-pop font-display text-2xl ${feedback.ok ? "text-mint" : "text-candy"}`}
                style={{ textShadow: "0 2px 0 rgba(51,48,107,0.35)" }}
              >
                {feedback.ok ? (streak >= 3 ? "دمت گرم! چه پشت‌سرهمی!" : "آفرین! درست بود!") : feedback.timedOut ? "ای وای! وقت تمام شد — جواب درست سبز شد" : "اشکالی نداره! جواب درست سبز شد — ۵ امتیاز کم شد"}
              </span>
            )}
            {!feedback && (
              <span className="text-sm font-bold text-ink-soft">
                کلیدهای ۱ تا ۴ هم کار می‌کنند • درست: <b dir="ltr">+۱۰</b> • غلط: <b dir="ltr">−۵</b>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ================= میان‌پرده‌ی مرحله ================= */}
      {phase === "interlude" && q && (
        <Interlude
          doneLevel={LEVELS[levelOf(qIndex)]}
          nextLevel={LEVELS[levelOf(qIndex + 1)]}
          correctInLevel={results.slice(qIndex - LEVELS[levelOf(qIndex)].count + 1, qIndex + 1).filter(Boolean).length}
          levelCount={LEVELS[levelOf(qIndex)].count}
          onContinue={continueInterlude}
          name={name}
        />
      )}

      {/* ================= نتیجه ================= */}
      {phase === "result" && (
        <ResultScreen
          name={name}
          score={score}
          bonus={bonus}
          correct={correctCount}
          bestStreak={bestStreak}
          onReplay={() => startGame(name)}
          onRename={() => { audio.click(); setPhase("start"); }}
        />
      )}

      {/* ================= توقف ================= */}
      {paused && phase === "playing" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-[2px]">
          <div className="card-pop relative w-full max-w-sm rounded-3xl border-[4px] border-ink bg-paper p-6 text-center shadow-[10px_12px_0_rgba(20,18,60,0.5)]">
            <PinDot color="#9b5de5" size={30} />
            <PauseIcon size={38} className="mx-auto text-grape" />
            <h2 className="font-display mt-2 text-4xl text-ink">توقف بازی</h2>
            <p className="mt-1 text-sm font-bold text-ink-soft">یه نفسی تازه کن، {name} جان!</p>
            <div className="mt-5 flex flex-col gap-3">
              <button onClick={() => { audio.click(); setPaused(false); }} className="btn-candy font-display flex items-center justify-center gap-2 rounded-2xl border-[3px] border-ink bg-mint px-5 py-3 text-2xl text-white shadow-[4px_5px_0_rgba(51,48,107,0.85)]">
                <PlayIcon size={20} /> ادامه بازی
              </button>
              <button onClick={() => startGame(name)} className="btn-candy font-display flex items-center justify-center gap-2 rounded-2xl border-[3px] border-ink bg-ocean px-5 py-2.5 text-xl text-white shadow-[4px_5px_0_rgba(51,48,107,0.85)]">
                <RefreshIcon size={20} /> شروع دوباره
              </button>
              <button onClick={() => { audio.click(); setPaused(false); setPhase("start"); }} className="btn-candy font-display rounded-2xl border-[3px] border-ink bg-paper px-5 py-2.5 text-xl text-ink shadow-[4px_5px_0_rgba(51,48,107,0.85)]">
                بازگشت به خانه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= صفحه‌ی شروع ================= */
function StartScreen({
  inputName, setInputName, nameError, onStart, muted, onMute,
}: {
  inputName: string;
  setInputName: (s: string) => void;
  nameError: boolean;
  onStart: () => void;
  muted: boolean;
  onMute: () => void;
}) {
  const facts = [
    { a: 7, b: 8, x: "6%", y: "16%", tilt: -8, color: "#4cc9f0", delay: "0s" },
    { a: 6, b: 9, x: "82%", y: "12%", tilt: 7, color: "#ff5d8f", delay: "0.5s" },
    { a: 4, b: 7, x: "10%", y: "66%", tilt: 6, color: "#3ddc97", delay: "0.9s" },
    { a: 9, b: 5, x: "84%", y: "60%", tilt: -6, color: "#ff9f45", delay: "1.3s" },
    { a: 3, b: 8, x: "70%", y: "82%", tilt: 4, color: "#9b5de5", delay: "0.7s" },
  ];
  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-4 py-8">
      <button onClick={onMute} className="btn-candy absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-ink bg-paper text-ink shadow-[3px_4px_0_rgba(51,48,107,0.8)]" title="صدا">
        {muted ? <SoundOffIcon size={20} /> : <SoundOnIcon size={20} />}
      </button>

      {/* پین‌های تزئینی جدول ضرب */}
      {facts.map((f, i) => (
        <div
          key={i}
          className="bob pointer-events-none absolute hidden md:block"
          style={{ left: f.x, top: f.y, animationDelay: f.delay, ["--tilt" as string]: `${f.tilt}deg` }}
        >
          <div className="relative rounded-2xl border-[3px] border-ink bg-paper px-4 py-2 shadow-[5px_6px_0_rgba(51,48,107,0.25)]">
            <PinDot color={f.color} size={22} />
            <div className="font-display text-xl text-ink" dir="ltr">
              {toFa(f.a)} × {toFa(f.b)} = <span style={{ color: f.color }}>{toFa(f.a * f.b)}</span>
            </div>
          </div>
        </div>
      ))}

      {/* عنوان */}
      <div className="mt-4 text-center">
        <div className="font-display mb-1 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-grape px-4 py-1 text-lg text-white shadow-[3px_4px_0_rgba(51,48,107,0.8)]">
          <MusicIcon size={18} /> ریاضی پایه‌ی سوم • ضرب فرآیندی
        </div>
        <h1 className="font-display wiggle mt-3 text-6xl leading-tight text-ink sm:text-7xl" style={{ textShadow: "4px 5px 0 #ffc53d, 8px 9px 0 rgba(51,48,107,0.25)" }}>
          جشن جدول ضرب
        </h1>
        <svg viewBox="0 0 300 14" className="mx-auto mt-1 w-64" aria-hidden>
          <path d="M4 9 Q 40 2 75 8 T 150 8 T 225 8 T 296 7" fill="none" stroke="#ff5d8f" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <p className="mt-2 text-lg font-bold text-ink-soft">بخوان، خرد کن، ضرب کن و خودت جمع کن تا ستاره بگیری!</p>
      </div>

      {/* کارت نام */}
      <div className={`relative mt-8 w-full max-w-md rounded-3xl border-[4px] border-ink bg-paper p-6 shadow-[9px_11px_0_rgba(51,48,107,0.3)] ${nameError ? "shake" : "card-pop"}`}>
        <PinDot color="#ffc53d" size={30} />
        <Tape color="#4cc9f0" className="-left-4 top-6 -rotate-90" />
        <label className="font-display flex items-center gap-2 text-2xl text-ink">
          <PencilIcon size={22} className="text-candy" /> اول اسمت را بنویس:
        </label>
        <input
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onStart()}
          maxLength={20}
          placeholder="مثلاً: زهرا، علی، باران..."
          className={`font-display mt-3 w-full rounded-2xl border-[3.5px] border-ink bg-white px-4 py-3 text-2xl text-ink placeholder:text-base placeholder:font-body placeholder:font-medium placeholder:text-ink-soft/50 focus:border-candy ${nameError ? "border-candy bg-candy/10" : ""}`}
        />
        {nameError && <p className="font-display mt-2 text-lg text-candy">اول اسمت را بنویس تا بازی شروع شود!</p>}
        <button
          onClick={onStart}
          className="btn-candy font-display mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-[3.5px] border-ink bg-candy px-5 py-3.5 text-3xl text-white shadow-[5px_6px_0_rgba(51,48,107,0.85)]"
        >
          <PlayIcon size={24} /> شروع بازی
        </button>
      </div>

      {/* قانون‌های بازی */}
      <div className="relative mt-6 w-full max-w-md rounded-3xl border-[3.5px] border-ink bg-paper/90 p-5 shadow-[7px_8px_0_rgba(51,48,107,0.22)]">
        <Tape color="#ff5d8f" className="-top-2 right-8 rotate-6" />
        <h3 className="font-display mb-3 text-2xl text-ink">قانون‌های بازی</h3>
        <ul className="space-y-2.5 text-[15px] font-bold text-ink">
          <li className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink bg-mint text-white"><CheckIcon size={16} /></span>
            هر جواب درست: <b className="font-display text-xl text-mint">۱۰+ امتیاز</b>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink bg-candy text-white"><XIcon size={16} /></span>
            هر جواب غلط یا تمام‌شدن وقت: <b className="font-display text-xl text-candy">۵− امتیاز</b>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink bg-lemon text-ink"><TrophyIcon size={17} /></span>
            اگر هر ۱۰ تا را درست بزنی: <b className="font-display text-xl text-tang">۵۰+ امتیاز ویژه و صدای دست!</b>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink bg-ocean text-white"><ClockIcon size={16} /></span>
            برای هر سؤال یک نوار زمان داری؛ با کلیک، لمس یا کلیدهای ۱ تا ۴ جواب بده.
          </li>
        </ul>
      </div>

      <p className="font-display mt-6 flex items-center gap-1.5 text-lg text-ink-soft">
        کلاس خانم <span className="text-candy">ماه منیر</span> <HeartIcon size={18} className="text-candy" />
      </p>
    </div>
  );
}

/* ================= میان‌پرده ================= */
function Interlude({
  doneLevel, nextLevel, correctInLevel, levelCount, onContinue, name,
}: {
  doneLevel: (typeof LEVELS)[number];
  nextLevel: (typeof LEVELS)[number];
  correctInLevel: number;
  levelCount: number;
  onContinue: () => void;
  name: string;
}) {
  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-lg place-items-center px-4">
      <div className="card-pop relative w-full rounded-3xl border-[4px] border-ink bg-paper p-7 text-center shadow-[10px_12px_0_rgba(51,48,107,0.3)]">
        <PinDot color={doneLevel.color} size={30} />
        <div className="font-display inline-block rounded-full border-[3px] border-ink px-4 py-0.5 text-lg text-white" style={{ background: doneLevel.color }}>
          مرحله {toFa(doneLevel.id)}: {doneLevel.name}
        </div>
        <h2 className="font-display mt-3 text-5xl text-ink" style={{ textShadow: "3px 4px 0 #ffc53d" }}>تمام شد!</h2>
        <p className="font-display mt-2 text-2xl text-ink-soft">
          {name} جان، از {toFa(levelCount)} سؤال، <span className="text-mint">{toFa(correctInLevel)}</span> تا را درست زدی!
        </p>
        <div className="mx-auto my-5 h-2 w-2/3 overflow-hidden rounded-full border-2 border-ink bg-white">
          <div className="h-full rounded-full" style={{ width: `${(correctInLevel / levelCount) * 100}%`, background: doneLevel.color }} />
        </div>
        <div className="rounded-2xl border-[3px] border-dashed border-ink bg-white px-4 py-3">
          <p className="text-sm font-black text-ink-soft">مرحله‌ی بعد:</p>
          <p className="font-display text-3xl" style={{ color: nextLevel.color }}>
            مرحله {toFa(nextLevel.id)}: {nextLevel.name}
          </p>
          <p className="mt-1 text-sm font-bold text-ink-soft">{nextLevel.desc}</p>
        </div>
        <button onClick={onContinue} className="btn-candy font-display mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-[3.5px] border-ink bg-mint px-5 py-3.5 text-3xl text-white shadow-[5px_6px_0_rgba(51,48,107,0.85)]">
          <PlayIcon size={22} /> بزن بریم!
        </button>
      </div>
    </div>
  );
}

/* ================= صفحه‌ی نتیجه ================= */
function ResultScreen({
  name, score, bonus, correct, bestStreak, onReplay, onRename,
}: {
  name: string;
  score: number;
  bonus: number;
  correct: number;
  bestStreak: number;
  onReplay: () => void;
  onRename: () => void;
}) {
  const perfect = correct === TOTAL;
  const stars = correct >= 10 ? 3 : correct >= 7 ? 2 : correct >= 4 ? 1 : 0;
  const msg = perfect
    ? "بی‌نقص بود! تو قهرمان جدول ضربی!"
    : correct >= 7 ? "آفرین! خیلی خوب بود — یک قدم تا ستاره‌ی کامل!"
    : correct >= 4 ? "خوب بود! با کمی تمرین حرفه‌ای می‌شوی."
    : "اشکالی ندارد! دوباره تلاش کن، تو حتماً می‌توانی!";

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-xl place-items-center px-4 py-8">
      <div className="card-pop relative w-full rounded-3xl border-[4px] border-ink bg-paper p-7 text-center shadow-[12px_14px_0_rgba(51,48,107,0.3)]">
        <PinDot color="#ffc53d" size={32} />
        <Tape color="#3ddc97" className="-left-5 top-10 -rotate-45" />
        <Tape color="#ff5d8f" className="-right-5 top-10 rotate-45" />

        {perfect ? (
          <div className="marquee-tape font-display mx-auto inline-block rounded-full border-[3px] border-ink px-5 py-1 text-xl text-ink">
            <span className="rounded-full bg-white/90 px-3 py-0.5">همه را درست جواب دادی! ۵۰+ امتیاز ویژه گرفتی!</span>
          </div>
        ) : (
          <div className="font-display mx-auto inline-block rounded-full border-[3px] border-ink bg-ocean px-5 py-1 text-xl text-white">
            کارت تمام شد!
          </div>
        )}

        <div className="mt-3 flex items-center justify-center">
          {perfect ? <TrophyIcon size={64} className="star-pop text-tang" /> : <StarIcon size={58} className="star-pop text-lemon" />}
        </div>

        {/* ستاره‌ها */}
        <div className="mt-2 flex items-end justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="star-pop inline-block" style={{ animationDelay: `${0.25 + i * 0.22}s` }}>
              <StarIcon size={i === 1 ? 52 : 40} className={i < stars ? "text-lemon" : "text-ink/15"} />
            </span>
          ))}
        </div>

        <h2 className="font-display mt-3 text-5xl text-ink" style={{ textShadow: "3px 4px 0 #ffc53d" }}>{name} جان</h2>
        <p className="font-display mt-1 text-2xl text-ink-soft">{msg}</p>

        {/* امتیاز */}
        <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border-[3.5px] border-ink bg-lemon px-5 py-3 shadow-[4px_5px_0_rgba(51,48,107,0.85)]">
          <div className="text-sm font-black text-ink-soft">امتیاز نهایی</div>
          <div className="font-display text-5xl text-ink" dir="ltr">{fmtScore(score)}</div>
          {bonus > 0 && <div className="font-display text-lg text-candy">شامل ۵۰+ جایزه‌ی کامل‌زدن</div>}
        </div>

        {/* آمار */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-mint px-4 py-2 text-white shadow-[3px_4px_0_rgba(51,48,107,0.8)]">
            <CheckIcon size={18} /> <span className="font-display text-2xl">{toFa(correct)}</span>
            <span className="text-xs font-black">درست</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-candy px-4 py-2 text-white shadow-[3px_4px_0_rgba(51,48,107,0.8)]">
            <XIcon size={18} /> <span className="font-display text-2xl">{toFa(TOTAL - correct)}</span>
            <span className="text-xs font-black">غلط</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-grape px-4 py-2 text-white shadow-[3px_4px_0_rgba(51,48,107,0.8)]">
            <StarIcon size={18} /> <span className="font-display text-2xl">{toFa(bestStreak)}</span>
            <span className="text-xs font-black">بهترین پشت‌سرهم</span>
          </div>
        </div>

        {/* معلم */}
        <div className="relative mx-auto mt-6 inline-block rounded-2xl border-[3px] border-ink bg-white px-6 py-2.5 shadow-[4px_5px_0_rgba(51,48,107,0.25)]">
          <PinDot color="#ff5d8f" size={22} />
          <p className="font-display flex items-center gap-2 text-2xl text-ink">
            معلم: <span className="text-candy">ماه منیر</span> <HeartIcon size={20} className="text-candy" />
          </p>
        </div>

        {/* دکمه‌ها */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={onReplay} className="btn-candy font-display flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3.5px] border-ink bg-candy px-5 py-3 text-2xl text-white shadow-[5px_6px_0_rgba(51,48,107,0.85)]">
            <RefreshIcon size={22} /> بازی دوباره
          </button>
          <button onClick={onRename} className="btn-candy font-display flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3.5px] border-ink bg-ocean px-5 py-3 text-2xl text-white shadow-[5px_6px_0_rgba(51,48,107,0.85)]">
            <PencilIcon size={20} /> تغییر نام
          </button>
        </div>
      </div>
    </div>
  );
}
