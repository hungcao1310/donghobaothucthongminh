import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  difficulty: number;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
}

// Duration to sustain shaking (seconds) based on difficulty
function requiredDuration(difficulty: number) {
  if (difficulty < 33) return 5;
  if (difficulty < 66) return 8;
  if (difficulty < 85) return 12;
  return 15;
}

const THRESHOLD = 18; // m/s² - shake detection threshold
const DECAY_RATE = 3;  // energy units lost per second when not shaking
const GAIN_RATE = 12;  // energy units gained per second when shaking

export function ShakeChallenge({ difficulty, failCount, onSuccess, onFail }: Props) {
  const totalDuration = requiredDuration(difficulty);
  const [energy, setEnergy] = useState(0); // 0-100
  const [isShaking, setIsShaking] = useState(false);
  const [hasMotion, setHasMotion] = useState<boolean | null>(null);
  const [permDenied, setPermDenied] = useState(false);
  const [done, setDone] = useState(false);

  const energyRef = useRef(0);
  const isShakingRef = useRef(false);
  const lastShakeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const doneRef = useRef(false);

  const tick = useCallback(() => {
    if (doneRef.current) return;
    const now = Date.now();
    const shakingNow = (now - lastShakeRef.current) < 200;
    isShakingRef.current = shakingNow;
    setIsShaking(shakingNow);

    energyRef.current = shakingNow
      ? Math.min(100, energyRef.current + GAIN_RATE / 30)
      : Math.max(0, energyRef.current - DECAY_RATE / 30);

    setEnergy(Math.round(energyRef.current));

    if (energyRef.current >= 100) {
      doneRef.current = true;
      setDone(true);
      onSuccess();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [onSuccess]);

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const mag = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
    if (mag > THRESHOLD) {
      lastShakeRef.current = Date.now();
    }
  }, []);

  const startMotion = useCallback(() => {
    window.addEventListener("devicemotion", handleMotion);
    rafRef.current = requestAnimationFrame(tick);
  }, [handleMotion, tick]);

  useEffect(() => {
    // Check if DeviceMotionEvent is available
    if (typeof DeviceMotionEvent === "undefined") {
      setHasMotion(false);
      return;
    }

    // iOS 13+ requires permission
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      (DeviceMotionEvent as any).requestPermission()
        .then((state: string) => {
          if (state === "granted") {
            setHasMotion(true);
            startMotion();
          } else {
            setPermDenied(true);
            setHasMotion(false);
          }
        })
        .catch(() => { setHasMotion(false); });
    } else {
      setHasMotion(true);
      startMotion();
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      cancelAnimationFrame(rafRef.current);
    };
  }, [startMotion, handleMotion]);

  // Fallback: tap button rapidly
  const tapIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTapHold = () => {
    lastShakeRef.current = Date.now();
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    tapIntervalRef.current = setInterval(() => {
      lastShakeRef.current = Date.now();
    }, 80);
  };

  const stopTapHold = () => {
    if (tapIntervalRef.current) { clearInterval(tapIntervalRef.current); tapIntervalRef.current = null; }
  };

  useEffect(() => {
    if (hasMotion === false) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(rafRef.current); if (tapIntervalRef.current) clearInterval(tapIntervalRef.current); };
  }, [hasMotion, tick]);

  const pct = energy;
  const circumference = 2 * Math.PI * 52;
  const strokeDash = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-2">
      {/* Ring progress */}
      <div className="relative mb-4">
        <svg width={120} height={120} className="-rotate-90">
          <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
          <circle
            cx={60} cy={60} r={52}
            fill="none"
            stroke={pct > 66 ? "#22c55e" : pct > 33 ? "#f59e0b" : "#f59e0b"}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl transition-transform duration-100 ${isShaking ? "scale-125" : "scale-100"}`}>
            📱
          </span>
        </div>
      </div>

      <div className="text-2xl font-bold text-amber mb-1">{pct}%</div>
      <p className="text-white/60 text-sm mb-1 text-center">
        {hasMotion === false
          ? "Nhấn và giữ nút để mô phỏng lắc"
          : isShaking ? "Tiếp tục lắc!" : "Lắc điện thoại mạnh liên tục"}
      </p>
      <p className="text-xs text-white/35 mb-6">
        Lắc đến khi thanh đầy {totalDuration}s mới tắt báo thức
      </p>

      {hasMotion === false && !done && (
        <button
          onPointerDown={startTapHold}
          onPointerUp={stopTapHold}
          onPointerLeave={stopTapHold}
          className={`w-48 h-16 rounded-3xl font-semibold text-base select-none transition-all active:scale-95
            ${isShaking ? "bg-green-500 text-black scale-105" : "bg-amber/20 border-2 border-amber text-amber"}
          `}
        >
          {isShaking ? "Đang lắc..." : "Nhấn và giữ 📱"}
        </button>
      )}

      {hasMotion === true && (
        <div className={`flex gap-1 mt-2 ${isShaking ? "opacity-100" : "opacity-30"}`}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-amber rounded-full"
              style={{
                height: isShaking ? `${12 + Math.sin(i * 1.5) * 8}px` : "8px",
                animation: isShaking ? `waveBar 0.3s ease-in-out infinite` : "none",
                animationDelay: `${i * 0.06}s`,
                transition: "height 0.1s",
              }}
            />
          ))}
        </div>
      )}

      {failCount > 0 && (
        <div className="mt-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">Đã sai {failCount} lần — phải lắc lâu hơn</span>
        </div>
      )}
    </div>
  );
}
