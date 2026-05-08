import { useNavigation } from "../components/SimpleRouter";
import { useState, useEffect } from "react";
import { Pause, Play, X } from "lucide-react";
import { useTimer } from "../contexts/TimerContext";

export function TimerRunningPage() {
  const { navigate, goBack } = useNavigation();
  const { currentTimer } = useTimer();

  const initialTime = currentTimer
    ? currentTimer.minutes * 60 + currentTimer.seconds
    : 5 * 60;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(true);
  const totalTime = initialTime;

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setTimeout(() => navigate(""), 2000);
    }
  }, [timeLeft, navigate]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-[320px] aspect-square mb-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="rgba(245, 158, 11, 0.2)"
            strokeWidth="12"
          />
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 140}`}
            strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-5xl sm:text-6xl md:text-7xl font-light text-amber tabular-nums mb-2">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          {timeLeft === 0 && (
            <div className="text-lg sm:text-xl text-amber-light animate-pulse">Hết giờ! ⏰</div>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => navigate("timer")}
          className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition-colors"
        >
          <X className="w-6 h-6 text-red-500" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={timeLeft === 0}
          className="w-20 h-20 rounded-full bg-amber shadow-lg shadow-amber/50 flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
        >
          {isRunning ? (
            <Pause className="w-8 h-8 text-black" />
          ) : (
            <Play className="w-8 h-8 text-black ml-1" />
          )}
        </button>
      </div>
    </div>
  );
}
