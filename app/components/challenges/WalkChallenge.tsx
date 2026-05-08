import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  difficulty: number;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
}

const TARGET_STEPS = 100;
const STEP_THRESHOLD = 12; // m/s² peak to count a step
const MIN_STEP_INTERVAL = 250; // ms between steps

export function WalkChallenge({ difficulty, failCount, onSuccess, onFail }: Props) {
  const [steps, setSteps] = useState(0);
  const [hasMotion, setHasMotion] = useState<boolean | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [done, setDone] = useState(false);

  const stepsRef = useRef(0);
  const lastStepRef = useRef(0);
  const lastMagRef = useRef(0);
  const movingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addStep = useCallback(() => {
    if (done) return;
    stepsRef.current += 1;
    setSteps(stepsRef.current);
    if (stepsRef.current >= TARGET_STEPS) {
      setDone(true);
      onSuccess();
    }
  }, [done, onSuccess]);

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const mag = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);

    // Peak detection for step counting
    const now = Date.now();
    if (mag > STEP_THRESHOLD && lastMagRef.current <= STEP_THRESHOLD) {
      if (now - lastStepRef.current > MIN_STEP_INTERVAL) {
        lastStepRef.current = now;
        addStep();
      }
    }
    lastMagRef.current = mag;

    // Show "moving" indicator
    if (mag > 10) {
      setIsMoving(true);
      if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
      movingTimerRef.current = setTimeout(() => setIsMoving(false), 500);
    }
  }, [addStep]);

  const startMotion = useCallback(() => {
    window.addEventListener("devicemotion", handleMotion);
  }, [handleMotion]);

  useEffect(() => {
    if (typeof DeviceMotionEvent === "undefined") {
      setHasMotion(false);
      return;
    }

    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      (DeviceMotionEvent as any).requestPermission()
        .then((state: string) => {
          if (state === "granted") { setHasMotion(true); startMotion(); }
          else setHasMotion(false);
        })
        .catch(() => setHasMotion(false));
    } else {
      setHasMotion(true);
      startMotion();
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
    };
  }, [startMotion, handleMotion]);

  const handleTap = () => {
    if (done) return;
    addStep();
    setIsMoving(true);
    if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
    movingTimerRef.current = setTimeout(() => setIsMoving(false), 200);
  };

  const pct = Math.min(100, (steps / TARGET_STEPS) * 100);
  const circumference = 2 * Math.PI * 52;
  const strokeDash = circumference - (pct / 100) * circumference;

  // Walking animation frame
  const frameIndex = Math.floor((steps % 4));
  const legAngles = [
    { l: -20, r: 20 },
    { l: -10, r: 10 },
    { l: 20, r: -20 },
    { l: 10, r: -10 },
  ][frameIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-2">
      {/* Ring progress */}
      <div className="relative mb-3">
        <svg width={130} height={130} className="-rotate-90">
          <circle cx={65} cy={65} r={52} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
          <circle
            cx={65} cy={65} r={52}
            fill="none"
            stroke={pct >= 100 ? "#22c55e" : "#f59e0b"}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            className="transition-all duration-200"
          />
        </svg>
        {/* Walking figure */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width={44} height={56} viewBox="0 0 44 56" className="transition-transform duration-100">
            {/* Head */}
            <circle cx={22} cy={8} r={7} fill={isMoving ? "#f59e0b" : "#ffffff"} className="transition-colors" />
            {/* Body */}
            <line x1={22} y1={15} x2={22} y2={34} stroke={isMoving ? "#f59e0b" : "#ffffff"} strokeWidth={3} strokeLinecap="round" className="transition-colors" />
            {/* Left arm */}
            <line x1={22} y1={19} x2={10} y2={28} stroke={isMoving ? "#f59e0b" : "#aaaaaa"} strokeWidth={2.5} strokeLinecap="round" style={{ transform: `rotate(${legAngles.r}deg)`, transformOrigin: "22px 19px" }} />
            {/* Right arm */}
            <line x1={22} y1={19} x2={34} y2={28} stroke={isMoving ? "#f59e0b" : "#aaaaaa"} strokeWidth={2.5} strokeLinecap="round" style={{ transform: `rotate(${-legAngles.r}deg)`, transformOrigin: "22px 19px" }} />
            {/* Left leg */}
            <line x1={22} y1={34} x2={12} y2={52} stroke={isMoving ? "#f59e0b" : "#ffffff"} strokeWidth={2.5} strokeLinecap="round" style={{ transform: `rotate(${legAngles.l}deg)`, transformOrigin: "22px 34px" }} className="transition-colors" />
            {/* Right leg */}
            <line x1={22} y1={34} x2={32} y2={52} stroke={isMoving ? "#f59e0b" : "#ffffff"} strokeWidth={2.5} strokeLinecap="round" style={{ transform: `rotate(${legAngles.r}deg)`, transformOrigin: "22px 34px" }} className="transition-colors" />
          </svg>
        </div>
      </div>

      <div className="text-3xl font-bold text-amber mb-0.5">{steps}<span className="text-lg text-white/40">/{TARGET_STEPS}</span></div>
      <p className="text-white/50 text-xs mb-1">bước</p>

      <p className="text-white/60 text-sm mb-1 text-center">
        {hasMotion === false
          ? "Nhấn nút để đếm bước chân"
          : isMoving ? "Đang đi bộ... tiếp tục!" : "Hãy đi bộ để đếm bước"}
      </p>
      <p className="text-xs text-white/30 mb-5">Đi đủ 100 bước thì báo thức tắt</p>

      {/* Tap fallback */}
      {(hasMotion === false || hasMotion === null) && !done && (
        <button
          onClick={handleTap}
          className={`w-48 h-16 rounded-3xl font-semibold text-base select-none transition-all active:scale-90
            ${isMoving ? "bg-amber text-black scale-102" : "bg-amber/20 border-2 border-amber text-amber"}
          `}
        >
          Bước ({TARGET_STEPS - steps} còn lại)
        </button>
      )}

      {hasMotion === true && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-3 text-center">
          <p className="text-xs text-white/50">Cảm biến đang hoạt động</p>
          <div className={`mt-1 w-2 h-2 rounded-full mx-auto ${isMoving ? "bg-green-400" : "bg-white/20"}`} />
        </div>
      )}

      {failCount > 0 && (
        <div className="mt-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">Đã sai {failCount} lần — phải đi đủ 100 bước</span>
        </div>
      )}
    </div>
  );
}
