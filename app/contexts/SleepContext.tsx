import { createContext, useContext, useState, ReactNode } from "react";

export interface SleepRecord {
  date: string; // "T2", "T3", etc.
  fullDate: string; // "2024-01-15"
  hours: number; // hours slept
  quality: "Tốt" | "Khá" | "Trung bình" | "Kém";
  bedtime: string; // "23:00"
  wakeTime: string; // "07:00"
}

interface SleepContextType {
  records: SleepRecord[];
  addRecord: (record: SleepRecord) => void;
  weeklyAverage: number;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

function generateMockData(): SleepRecord[] {
  const now = new Date();
  const days: SleepRecord[] = [];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayIndex = date.getDay();
    const dayName = dayNames[dayIndex];

    // Generate varied sleep hours (6-9 hours)
    const baseHours = 7.5;
    const variance = Math.sin(i * 1.2) * 1.2;
    const hours = Math.round((baseHours + variance) * 10) / 10;

    const bedHour = 22 + Math.floor(Math.random() * 2); // 22 or 23
    const bedMin = Math.floor(Math.random() * 30); // 0-29 min
    const wakeHour = 6 + Math.floor(Math.random() * 2); // 6 or 7
    const wakeMin = Math.floor(Math.random() * 30); // 0-29 min

    let quality: SleepRecord["quality"] = "Trung bình";
    if (hours >= 8) quality = "Tốt";
    else if (hours >= 7) quality = "Khá";
    else if (hours < 6) quality = "Kém";

    days.push({
      date: dayName,
      fullDate: date.toISOString().split("T")[0],
      hours,
      quality,
      bedtime: `${bedHour.toString().padStart(2, "0")}:${bedMin.toString().padStart(2, "0")}`,
      wakeTime: `${wakeHour.toString().padStart(2, "0")}:${wakeMin.toString().padStart(2, "0")}`,
    });
  }

  return days;
}

export function SleepProvider({ children }: { children: ReactNode }) {
  const [records] = useState<SleepRecord[]>(generateMockData);

  const addRecord = (record: SleepRecord) => {
    // In a real app this would update state
  };

  const weeklyAverage =
    Math.round((records.reduce((sum, r) => sum + r.hours, 0) / records.length) * 10) / 10;

  return (
    <SleepContext.Provider value={{ records, addRecord, weeklyAverage }}>
      {children}
    </SleepContext.Provider>
  );
}

export function useSleep() {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error("useSleep must be used within SleepProvider");
  }
  return context;
}
