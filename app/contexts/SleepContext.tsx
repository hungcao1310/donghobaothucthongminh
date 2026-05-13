import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as api from "../services/database";

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

function calcHours(bedStr: string, wakeStr: string): number {
  const [bh, bm] = bedStr.split(":").map(Number);
  const [wh, wm] = wakeStr.split(":").map(Number);
  let hours = (wh - bh) + (wm - bm) / 60;
  if (hours < 0) hours += 24;
  return Math.round(hours * 10) / 10;
}

function qualityFromHours(hours: number): SleepRecord["quality"] {
  if (hours >= 8) return "Tốt";
  if (hours >= 7) return "Khá";
  if (hours >= 6) return "Trung bình";
  return "Kém";
}

function toVnDay(dateStr: string): string {
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const d = new Date(dateStr);
  return dayNames[d.getDay()];
}

export function SleepProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<SleepRecord[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const user = api.getUserFromLocal();
      if (!user) return;
      const result = await api.fetchSleepRecords();
      if (result.success && result.records && result.records.length > 0) {
        const mapped: SleepRecord[] = result.records.map(r => {
          const bedDate = r.bedtime ? new Date(r.bedtime) : new Date();
          const wakeDate = r.wakeTime ? new Date(r.wakeTime) : new Date();
          const bedStr = `${String(bedDate.getHours()).padStart(2, "0")}:${String(bedDate.getMinutes()).padStart(2, "0")}`;
          const wakeStr = `${String(wakeDate.getHours()).padStart(2, "0")}:${String(wakeDate.getMinutes()).padStart(2, "0")}`;
          const hours = calcHours(bedStr, wakeStr);
          return {
            date: toVnDay(r.logDate || bedDate.toISOString().split("T")[0]),
            fullDate: r.logDate || bedDate.toISOString().split("T")[0],
            hours,
            quality: qualityFromHours(hours),
            bedtime: bedStr,
            wakeTime: wakeStr,
          };
        });
        setRecords(mapped);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu giấc ngủ:", err);
    }
  };

  const addRecord = async (record: SleepRecord) => {
    try {
      // Parse bedtime/waketime from the current record
      const logDate = record.fullDate || new Date().toISOString().split("T")[0];
      const bedDateTime = `${logDate}T${record.bedtime}:00`;
      const wakeDateTime = `${logDate}T${record.wakeTime}:00`;

      const result = await api.createSleepRecord({
        bedtime: bedDateTime,
        wakeTime: wakeDateTime,
        quality: record.quality === "Tốt" ? 5 : record.quality === "Khá" ? 4 : record.quality === "Trung bình" ? 3 : 2,
        logDate,
      });

      if (result.success) {
        setRecords(prev => {
          const exists = prev.find(r => r.fullDate === logDate);
          if (exists) return prev;
          return [...prev, record];
        });
      }
    } catch (err) {
      console.error("Lỗi thêm dữ liệu giấc ngủ:", err);
    }
  };

  const weeklyAverage =
    records.length > 0
      ? Math.round((records.reduce((sum, r) => sum + r.hours, 0) / records.length) * 10) / 10
      : 0;

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