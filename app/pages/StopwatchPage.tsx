import { useNavigation } from "../components/SimpleRouter";
import { Clock, Timer, History, Play, Pause, RotateCcw, Flag, Activity } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Lap {
  number: number;
  time: string;
  diff: string;
}

interface StopwatchState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  laps: Lap[];
}

const STORAGE_KEY = "stopwatch_state";

export function StopwatchPage() {
  const { navigate } = useNavigation();
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const animationRef = useRef<number | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: StopwatchState = JSON.parse(stored);
        setLaps(state.laps);

        if (state.isRunning && state.startTime) {
          // Calculate actual elapsed time including time while app was closed
          const now = Date.now();
          const totalElapsed = state.elapsedTime + (now - state.startTime);
          setElapsedTime(totalElapsed);
          setStartTime(now);
          setIsRunning(true);
        } else {
          setElapsedTime(state.elapsedTime);
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error("Failed to load stopwatch state:", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const state: StopwatchState = {
        isRunning,
        startTime,
        elapsedTime,
        laps
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save stopwatch state:", error);
    }
  }, [isRunning, startTime, elapsedTime, laps]);

  // Animation loop for updating time
  useEffect(() => {
    if (isRunning && startTime) {
      const updateTime = () => {
        const now = Date.now();
        const currentElapsed = elapsedTime + (now - startTime);
        setElapsedTime(currentElapsed);
        animationRef.current = requestAnimationFrame(updateTime);
      };

      animationRef.current = requestAnimationFrame(updateTime);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isRunning, startTime]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const parseTimeToMs = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const secParts = parts[1].split('.');
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(secParts[0]);
    const ms = parseInt(secParts[1]);
    return minutes * 60000 + seconds * 1000 + ms * 10;
  };

  const handleToggleRunning = () => {
    if (isRunning) {
      // Pause: save current elapsed time
      if (startTime) {
        const now = Date.now();
        setElapsedTime(prev => prev + (now - startTime));
      }
      setIsRunning(false);
      setStartTime(null);
    } else {
      // Start/Resume: set new start time
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };

  const handleLap = () => {
    const lapTime = formatTime(elapsedTime);
    const prevLapMs = laps.length > 0 ? parseTimeToMs(laps[0].time) : 0;
    const currentMs = elapsedTime;
    const diffMs = currentMs - prevLapMs;
    const diffTime = formatTime(diffMs);

    setLaps([
      { number: laps.length + 1, time: lapTime, diff: diffTime },
      ...laps
    ]);
  };

  const handleReset = () => {
    setElapsedTime(0);
    setStartTime(null);
    setLaps([]);
    setIsRunning(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <h1 className="text-3xl mb-12 text-amber">Bấm giờ</h1>

      <div className="flex flex-col items-center mb-12">
        <div className="text-7xl font-light text-amber-light mb-4 tabular-nums">
          {formatTime(elapsedTime)}
        </div>

        {isRunning && (
          <div className="text-xs text-amber/60 mb-8 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber animate-ping"></span>
            Đang chạy ngầm - Có thể thoát ứng dụng
          </div>
        )}

        <div className="flex gap-6">
          {elapsedTime > 0 && !isRunning && (
            <button
              onClick={handleReset}
              className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition-colors"
            >
              <RotateCcw className="w-6 h-6 text-red-500" />
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleLap}
              className="w-16 h-16 rounded-full bg-amber/20 border-2 border-amber flex items-center justify-center hover:bg-amber/30 transition-colors"
            >
              <Flag className="w-6 h-6 text-amber" />
            </button>
          )}

          <button
            onClick={handleToggleRunning}
            className="w-20 h-20 rounded-full bg-amber shadow-lg shadow-amber/50 flex items-center justify-center hover:scale-110 transition-transform"
          >
            {isRunning ? (
              <Pause className="w-8 h-8 text-black" />
            ) : (
              <Play className="w-8 h-8 text-black ml-1" />
            )}
          </button>
        </div>
      </div>

      {laps.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-white/60 mb-3">Vòng chạy</div>
          {laps.map((lap) => (
            <div key={lap.number} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-5 py-3 border border-white/10">
              <span className="text-white/60">Vòng {lap.number}</span>
              <div className="flex items-center gap-4">
                <span className="text-white/40 text-sm tabular-nums">+{lap.diff}</span>
                <span className="text-amber text-lg tabular-nums">{lap.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around items-center py-4">
          <button onClick={() => navigate("home")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Báo thức</span>
          </button>
          <button onClick={() => navigate("stopwatch")} className="flex flex-col items-center gap-1 text-amber">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Bấm giờ</span>
          </button>
          <button onClick={() => navigate("timer")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
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
