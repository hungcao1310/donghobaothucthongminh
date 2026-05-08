import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  difficulty: number;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
}

const COLORS = [
  { id: "red",    bg: "bg-red-500",    glow: "shadow-red-500/70",    dim: "bg-red-900/40",    label: "Đỏ" },
  { id: "blue",   bg: "bg-blue-500",   glow: "shadow-blue-500/70",   dim: "bg-blue-900/40",   label: "Xanh dương" },
  { id: "green",  bg: "bg-green-500",  glow: "shadow-green-500/70",  dim: "bg-green-900/40",  label: "Xanh lá" },
  { id: "yellow", bg: "bg-yellow-400", glow: "shadow-yellow-400/70", dim: "bg-yellow-900/40", label: "Vàng" },
] as const;

type ColorId = typeof COLORS[number]["id"];
type Phase = "idle" | "showing" | "input" | "wrong" | "success";

function seqLength(difficulty: number) {
  if (difficulty < 25) return 3;
  if (difficulty < 50) return 4;
  if (difficulty < 75) return 6;
  return 8;
}

function randomSeq(len: number): ColorId[] {
  return Array.from({ length: len }, () => COLORS[Math.floor(Math.random() * 4)].id);
}

export function PatternChallenge({ difficulty, failCount, onSuccess, onFail }: Props) {
  const len = seqLength(difficulty);
  const [sequence, setSequence] = useState<ColorId[]>(() => randomSeq(len));
  const [userSeq, setUserSeq] = useState<ColorId[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [litColor, setLitColor] = useState<ColorId | null>(null);
  const [showIndex, setShowIndex] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => { timeouts.current.forEach(clearTimeout); timeouts.current = []; };

  const startShowing = useCallback((seq: ColorId[]) => {
    clearTimeouts();
    setUserSeq([]);
    setLitColor(null);
    setPhase("showing");
    setShowIndex(0);

    seq.forEach((color, i) => {
      const t1 = setTimeout(() => setLitColor(color), i * 700);
      const t2 = setTimeout(() => setLitColor(null), i * 700 + 450);
      timeouts.current.push(t1, t2);
    });

    const done = setTimeout(() => {
      setPhase("input");
      setLitColor(null);
    }, seq.length * 700 + 200);
    timeouts.current.push(done);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => startShowing(sequence), 800);
    return () => { clearTimeout(t); clearTimeouts(); };
  }, [sequence]);

  const handleTap = (colorId: ColorId) => {
    if (phase !== "input") return;

    const newSeq = [...userSeq, colorId];
    const idx = newSeq.length - 1;

    if (colorId !== sequence[idx]) {
      // Wrong
      setPhase("wrong");
      setLitColor(colorId);
      onFail();
      const t = setTimeout(() => {
        setLitColor(null);
        const fresh = randomSeq(len);
        setSequence(fresh);
        startShowing(fresh);
      }, 800);
      timeouts.current.push(t);
      return;
    }

    setLitColor(colorId);
    const t = setTimeout(() => setLitColor(null), 250);
    timeouts.current.push(t);

    if (newSeq.length === sequence.length) {
      setPhase("success");
      setTimeout(onSuccess, 400);
    } else {
      setUserSeq(newSeq);
    }
  };

  const progressPct = phase === "input" ? (userSeq.length / sequence.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-2">
      <div className="text-5xl mb-2">🧩</div>

      <div className="text-center mb-5">
        <p className="text-white/60 text-sm">
          {phase === "idle" && "Chuẩn bị quan sát chuỗi màu..."}
          {phase === "showing" && "Ghi nhớ thứ tự màu sắc!"}
          {phase === "input" && `Lặp lại chuỗi (${userSeq.length}/${sequence.length})`}
          {phase === "wrong" && "Sai rồi! Xem lại chuỗi..."}
          {phase === "success" && "Chính xác! ✅"}
        </p>
        <p className="text-xs text-white/35 mt-1">Độ dài chuỗi: {sequence.length} màu</p>
      </div>

      {/* Progress bar */}
      {phase === "input" && (
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-amber rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Color grid */}
      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        {COLORS.map((color) => {
          const isLit = litColor === color.id;
          return (
            <button
              key={color.id}
              onClick={() => handleTap(color.id)}
              disabled={phase !== "input"}
              className={`h-28 rounded-3xl transition-all duration-150 select-none
                ${isLit
                  ? `${color.bg} shadow-2xl ${color.glow} scale-105`
                  : phase === "input"
                    ? `${color.dim} hover:scale-102 active:scale-95 border border-white/10`
                    : `${color.dim} border border-white/5`
                }
              `}
            />
          );
        })}
      </div>

      {/* Sequence dots preview */}
      <div className="flex gap-1.5 flex-wrap justify-center mb-4">
        {sequence.map((c, i) => {
          const col = COLORS.find(x => x.id === c)!;
          const done = i < userSeq.length;
          const current = i === userSeq.length && phase === "input";
          return (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                done ? col.bg : current ? "bg-white scale-125" : "bg-white/20"
              }`}
            />
          );
        })}
      </div>

      {failCount > 0 && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">Sai {failCount} lần — chuỗi mới được tạo</span>
        </div>
      )}
    </div>
  );
}
