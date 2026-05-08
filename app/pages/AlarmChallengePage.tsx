import { useNavigation, useParams } from "../components/SimpleRouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { useAlarms } from "../contexts/AlarmContext";
import { TypingChallenge } from "../components/challenges/TypingChallenge";
import { PatternChallenge } from "../components/challenges/PatternChallenge";
import { ShakeChallenge } from "../components/challenges/ShakeChallenge";
import { WalkChallenge } from "../components/challenges/WalkChallenge";
import { QRChallenge } from "../components/challenges/QRChallenge";
import { Delete } from "lucide-react";

// ─── Math sub-component ──────────────────────────────────────────────────────
interface MathProps {
  difficulty: number;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
}

function MathChallenge({ difficulty, failCount, onSuccess, onFail }: MathProps) {
  const [answer, setAnswer] = useState("");
  const [problem, setProblem] = useState({ question: "", correct: 0 });
  const [shake, setShake] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  useEffect(() => {
    let q = "", a = 0;
    if (difficulty < 33) {
      const n1 = Math.floor(Math.random() * 20) + 1;
      const n2 = Math.floor(Math.random() * 20) + 1;
      q = `${n1} + ${n2}`; a = n1 + n2;
    } else if (difficulty < 66) {
      const n1 = Math.floor(Math.random() * 12) + 2;
      const n2 = Math.floor(Math.random() * 12) + 2;
      q = `${n1} × ${n2}`; a = n1 * n2;
    } else if (difficulty < 85) {
      const n1 = Math.floor(Math.random() * 15) + 5;
      const n2 = Math.floor(Math.random() * 8) + 2;
      const n3 = Math.floor(Math.random() * 30) + 10;
      q = `${n1} × ${n2} − ${n3}`; a = n1 * n2 - n3;
    } else {
      // Ensure division results in whole numbers
      const n4 = Math.floor(Math.random() * 5) + 2; // divisor 2-6
      a = Math.floor(Math.random() * 20) + 10; // result 10-29
      const product = a * n4; // this ensures exact division
      const n1 = Math.floor(Math.random() * 8) + 3; // 3-10
      const n2 = Math.floor(Math.random() * 5) + 2; // 2-6
      const n3 = product - (n1 * n2); // calculate n3 to make equation work
      // Only use if n3 is positive and reasonable
      if (n3 > 0 && n3 < 50) {
        q = `(${n1} × ${n2} + ${n3}) ÷ ${n4}`;
      } else {
        // Fallback to simpler problem
        const n1 = Math.floor(Math.random() * 15) + 5;
        const n2 = Math.floor(Math.random() * 8) + 2;
        const n3 = Math.floor(Math.random() * 30) + 10;
        q = `${n1} × ${n2} − ${n3}`; a = n1 * n2 - n3;
      }
    }
    setProblem({ question: q, correct: a });
    setAnswer("");
  }, [difficulty]);

  useEffect(() => {
    if (answer && answer === problem.correct.toString()) {
      onSuccess();
    }
  }, [answer, problem.correct, onSuccess]);

  const press = (val: string | number) => {
    if (val === "⌫") setAnswer(a => a.slice(0, -1));
    else if (val === "-") setAnswer(a => (a === "" ? "-" : a));
    else setAnswer(a => a + val);
  };

  const check = () => {
    if (parseInt(answer) === problem.correct) {
      onSuccess();
    } else {
      setShake(true); setWrongFlash(true);
      setTimeout(() => { setShake(false); setWrongFlash(false); setAnswer(""); }, 500);
      onFail();
    }
  };

  const rows = [[1,2,3],[4,5,6],[7,8,9],["-",0,"⌫"]];

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto">
      <div className="text-5xl mb-3">🧮</div>
      <p className="text-white/60 text-sm mb-5">Giải phép tính để tắt báo thức</p>

      <div className={`text-4xl mb-6 font-mono text-amber transition-all ${shake ? "animate-shake" : ""}`}>
        {problem.question} = ?
      </div>

      <div className={`w-full bg-[#1a1a1a] rounded-2xl px-6 py-4 mb-6 border transition-all
        ${wrongFlash ? "border-red-500 bg-red-500/10" : "border-amber/30"} ${shake ? "animate-shake" : ""}`}
      >
        <div className={`text-4xl text-center min-h-[50px] flex items-center justify-center
          ${wrongFlash ? "text-red-400" : "text-amber"}`}>
          {answer || "_"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full mb-4">
        {rows.map((row, ri) =>
          row.map((num, ci) => (
            <button
              key={`${ri}-${ci}`}
              onClick={() => press(num)}
              className={`h-14 rounded-xl text-lg font-medium transition-all active:scale-90
                ${num === "⌫"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-[#1e1e1e] text-white hover:bg-[#2a2a2a] border border-white/10"
                }`}
            >
              {num === "⌫" ? <Delete className="w-5 h-5 mx-auto" /> : num}
            </button>
          ))
        )}
      </div>

      <button
        onClick={check}
        disabled={!answer || answer === "-"}
        className="w-full py-4 rounded-2xl bg-amber text-black font-semibold disabled:opacity-40 active:scale-95 transition-all"
      >
        Kiểm tra
      </button>
    </div>
  );
}

// ─── Challenge type metadata ─────────────────────────────────────────────────
const CHALLENGE_META: Record<string, { icon: string; title: string }> = {
  math:    { icon: "🧮", title: "Toán học" },
  typing:  { icon: "⌨️", title: "Gõ văn bản" },
  pattern: { icon: "🧩", title: "Nhớ mẫu" },
  shake:   { icon: "📱", title: "Lắc điện thoại" },
  walk:    { icon: "🚶", title: "Đi bộ 100 bước" },
  qr:      { icon: "📷", title: "Quét QR" },
};

// ─── Main page ───────────────────────────────────────────────────────────────
export function AlarmChallengePage() {
  const { navigate, goBack } = useNavigation();
  const params = useParams();
  const { alarms, incrementFailCount, resetFailCount } = useAlarms();

  const isDemo = !!params.demoType;
  const alarm = isDemo ? null : alarms.find(a => a.id === Number(params.id));

  const navigateRef = useRef(navigate);
  const resetRef = useRef(resetFailCount);
  const incrementRef = useRef(incrementFailCount);
  useEffect(() => { navigateRef.current = navigate; resetRef.current = resetFailCount; incrementRef.current = incrementFailCount; });

  // Block back navigation only for real alarms
  useEffect(() => {
    if (isDemo) return;
    const block = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.key === "Backspace" && e.metaKey)) e.preventDefault();
    };
    const blockUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("keydown", block);
    window.addEventListener("beforeunload", blockUnload);
    return () => { window.removeEventListener("keydown", block); window.removeEventListener("beforeunload", blockUnload); };
  }, [isDemo]);

  const [demoSuccess, setDemoSuccess] = useState(false);

  const failCount = alarm?.failCount ?? 0;
  const currentDifficulty = isDemo ? 33 : (alarm?.currentDifficulty ?? alarm?.difficulty ?? 50);
  const challengeType = isDemo ? (params.demoType as string) : (alarm?.challengeType ?? "math");
  const meta = CHALLENGE_META[challengeType] ?? CHALLENGE_META.math;

  const handleSuccess = useCallback(() => {
    if (isDemo) { setDemoSuccess(true); return; }
    if (alarm) resetRef.current(alarm.id);
    navigateRef.current("congratulations");
  }, [isDemo, alarm]);

  const handleFail = useCallback(() => {
    if (!isDemo && alarm) incrementRef.current(alarm.id);
  }, [isDemo, alarm]);

  const getDiffLabel = () => {
    if (currentDifficulty < 33) return { label: "Dễ", color: "text-green-400" };
    if (currentDifficulty < 66) return { label: "Trung bình", color: "text-amber" };
    if (currentDifficulty < 85) return { label: "Khó", color: "text-orange-400" };
    return { label: "Cực khó", color: "text-red-400" };
  };
  const diff = getDiffLabel();

  const renderChallenge = () => {
    const props = { difficulty: currentDifficulty, failCount, onSuccess: handleSuccess, onFail: handleFail };
    switch (challengeType) {
      case "math":    return <MathChallenge {...props} />;
      case "typing":  return <TypingChallenge {...props} />;
      case "pattern": return <PatternChallenge {...props} />;
      case "shake":   return <ShakeChallenge {...props} />;
      case "walk":    return <WalkChallenge {...props} />;
      case "qr":      return <QRChallenge {...props} />;
      default:        return <MathChallenge {...props} />;
    }
  };

  if (demoSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-6 gap-6">
        <div className="text-7xl">🎉</div>
        <div className="text-center">
          <p className="text-2xl text-amber font-semibold mb-2">Hoàn thành!</p>
          <p className="text-white/60 text-sm">Bạn đã vượt qua thử thách <strong className="text-white">{meta.title}</strong></p>
        </div>
        <button
          onClick={goBack}
          className="px-8 py-3 rounded-2xl bg-amber text-black font-semibold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          {isDemo && (
            <button onClick={goBack} className="mr-1 p-1 text-white/50 hover:text-white transition-colors text-xl leading-none">
              ←
            </button>
          )}
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <div className="text-sm font-medium">{meta.title}</div>
            <div className={`text-xs ${isDemo ? "text-blue-400" : diff.color}`}>
              {isDemo ? "Chế độ demo" : diff.label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDemo && failCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 rounded-lg px-2.5 py-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-300">×{failCount}</span>
            </div>
          )}
          <div className={`border rounded-lg px-2.5 py-1 ${isDemo ? "bg-blue-500/10 border-blue-500/20" : "bg-amber/10 border-amber/20"}`}>
            <span className={`text-xs ${isDemo ? "text-blue-300" : `animate-pulse ${failCount > 2 ? "text-red-400" : "text-amber"}`}`}>
              {isDemo ? "👀 Demo" : failCount > 4 ? "🚨 Kêu liên tục" : "⏰ Đang reo"}
            </span>
          </div>
        </div>
      </div>

      {/* Challenge content */}
      <div className="flex-1 flex flex-col items-center justify-center p-5">
        {renderChallenge()}
      </div>

      <div className="px-5 pb-6 text-center">
        {isDemo
          ? <p className="text-xs text-white/25">Đây là bản xem thử — hoàn thành để xem kết quả</p>
          : <p className="text-xs text-white/25">⚠️ Không thể thoát cho đến khi hoàn thành thử thách</p>
        }
      </div>
    </div>
  );
}
