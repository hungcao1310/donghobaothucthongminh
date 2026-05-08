import { useNavigation } from "../components/SimpleRouter";
import { Clock, Timer, History, Activity } from "lucide-react";
import { useState } from "react";
import { useTimer } from "../contexts/TimerContext";

export function TimerPage() {
  const { navigate, goBack } = useNavigation();
  const { setCurrentTimer } = useTimer();
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  const presets = [
    { label: "5 phút", value: 5 },
    { label: "10 phút", value: 10 },
    { label: "15 phút", value: 15 },
    { label: "30 phút", value: 30 },
  ];

  const startTimer = () => {
    if (minutes > 0 || seconds > 0) {
      setCurrentTimer({ minutes, seconds });
      navigate("timer-running");
    }
  };

  const setPresetTime = (value: number) => {
    setMinutes(value);
    setSeconds(0);
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <h1 className="text-3xl mb-12 text-amber">Hẹn giờ</h1>

      <div className="flex flex-col items-center mb-12">
        <div className="relative w-full max-w-[280px] aspect-square mb-12">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 288 288">
            <circle
              cx="144"
              cy="144"
              r="120"
              fill="none"
              stroke="rgba(245, 158, 11, 0.2)"
              strokeWidth="8"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-light text-amber tabular-nums">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="60"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="absolute w-64 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setPresetTime(preset.value)}
              className="py-3 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-amber transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1">
            <label className="text-sm text-white/60 mb-2 block">Phút</label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-2xl"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-white/60 mb-2 block">Giây</label>
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(Math.min(59, Math.max(0, Number(e.target.value))))}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-2xl"
            />
          </div>
        </div>

        <button
          onClick={startTimer}
          disabled={minutes === 0 && seconds === 0}
          className="mt-8 w-full max-w-sm py-4 rounded-xl bg-amber text-black disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
        >
          Bắt đầu
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around items-center py-4">
          <button onClick={() => navigate("home")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Báo thức</span>
          </button>
          <button onClick={() => navigate("stopwatch")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Bấm giờ</span>
          </button>
          <button onClick={() => navigate("timer")} className="flex flex-col items-center gap-1 text-amber">
            <Timer className="w-6 h-6" />
            <span className="text-xs">Hẹn giờ</span>
          </button>
          <button onClick={() => navigate("health")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Activity className="w-6 h-6" />
            <span className="text-xs">Sức khỏe</span>
          </button>
          <button onClick={() => navigate("history")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <History className="w-6 h-6" />
            <span className="text-xs">Lịch sử</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
