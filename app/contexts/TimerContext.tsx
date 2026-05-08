import { createContext, useContext, useState, ReactNode } from "react";

interface TimerPreset {
  id: number;
  label: string;
  duration: string;
  seconds: number;
  lastUsed: string;
}

interface TimerContextType {
  presets: TimerPreset[];
  addPreset: (preset: Omit<TimerPreset, "id" | "lastUsed">) => void;
  updateLastUsed: (id: number) => void;
  currentTimer: { minutes: number; seconds: number } | null;
  setCurrentTimer: (timer: { minutes: number; seconds: number } | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [currentTimer, setCurrentTimer] = useState<{ minutes: number; seconds: number } | null>(null);
  const [presets, setPresets] = useState<TimerPreset[]>([
    { id: 1, label: "Nấu mì", duration: "3:00", seconds: 180, lastUsed: "Hôm nay, 12:30" },
    { id: 2, label: "Tập thể dục", duration: "30:00", seconds: 1800, lastUsed: "Hôm qua, 18:00" },
    { id: 3, label: "Giải lao", duration: "15:00", seconds: 900, lastUsed: "2 ngày trước" },
    { id: 4, label: "Thiền", duration: "10:00", seconds: 600, lastUsed: "3 ngày trước" },
    { id: 5, label: "Học tập", duration: "25:00", seconds: 1500, lastUsed: "1 tuần trước" },
  ]);

  const addPreset = (preset: Omit<TimerPreset, "id" | "lastUsed">) => {
    const newId = Math.max(0, ...presets.map(p => p.id)) + 1;
    const now = new Date();
    const lastUsed = `Hôm nay, ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    setPresets([{ ...preset, id: newId, lastUsed }, ...presets]);
  };

  const updateLastUsed = (id: number) => {
    const now = new Date();
    const lastUsed = `Hôm nay, ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    setPresets(presets.map(p => p.id === id ? { ...p, lastUsed } : p));
  };

  return (
    <TimerContext.Provider value={{ presets, addPreset, updateLastUsed, currentTimer, setCurrentTimer }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
}
