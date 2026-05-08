import { createContext, useContext, useState, ReactNode } from "react";

export type ChallengeType = "math" | "typing" | "pattern" | "shake" | "walk" | "qr";

interface Alarm {
  id: number;
  time: string;
  days: string[];
  enabled: boolean;
  label: string;
  hour: number;
  minute: number;
  ringtone: string;
  smartMode: boolean;
  challengeType?: ChallengeType;
  difficulty?: number;
  baseDifficulty?: number;
  currentDifficulty?: number;
  failCount?: number;
  volume?: number;
  autoIncreaseDifficulty?: boolean;
}

interface AlarmContextType {
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, "id">) => void;
  updateAlarm: (id: number, alarm: Partial<Alarm>) => void;
  deleteAlarm: (id: number) => void;
  toggleAlarm: (id: number) => void;
  incrementFailCount: (id: number) => void;
  resetFailCount: (id: number) => void;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export function AlarmProvider({ children }: { children: ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: 1, time: "07:00", hour: 7, minute: 0, days: ["T2", "T3", "T4", "T5", "T6"], enabled: true, label: "Báo thức buổi sáng", ringtone: "Nhạc chuông mặc định", smartMode: true, challengeType: "math", baseDifficulty: 33, currentDifficulty: 33, failCount: 0 },
    { id: 2, time: "13:00", hour: 13, minute: 0, days: ["T2", "T3", "T4", "T5"], enabled: false, label: "Nghỉ trưa", ringtone: "Nhạc chuông mặc định", smartMode: false },
    { id: 3, time: "22:00", hour: 22, minute: 0, days: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], enabled: true, label: "Chuẩn bị đi ngủ", ringtone: "Nhạc chuông mặc định", smartMode: false },
  ]);

  const addAlarm = (alarm: Omit<Alarm, "id">) => {
    const newId = Math.max(0, ...alarms.map(a => a.id)) + 1;
    const baseDiff = alarm.difficulty || 50;
    setAlarms([...alarms, {
      ...alarm,
      id: newId,
      baseDifficulty: baseDiff,
      currentDifficulty: baseDiff,
      failCount: 0
    }]);
  };

  const updateAlarm = (id: number, updates: Partial<Alarm>) => {
    setAlarms(alarms.map(alarm => {
      if (alarm.id === id) {
        const updated = { ...alarm, ...updates };
        if (updates.difficulty !== undefined) {
          updated.baseDifficulty = updates.difficulty;
          updated.currentDifficulty = updates.difficulty;
        }
        return updated;
      }
      return alarm;
    }));
  };

  const deleteAlarm = (id: number) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const toggleAlarm = (id: number) => {
    setAlarms(alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const incrementFailCount = (id: number) => {
    setAlarms(alarms.map(alarm => {
      if (alarm.id === id) {
        const newFailCount = (alarm.failCount || 0) + 1;
        const baseDiff = alarm.baseDifficulty || 50;

        // Only increase difficulty if autoIncreaseDifficulty is enabled
        let newDifficulty = alarm.currentDifficulty || baseDiff;
        if (alarm.autoIncreaseDifficulty !== false) {
          const increaseFactor = Math.min(newFailCount * 15, 50);
          newDifficulty = Math.min(100, baseDiff + increaseFactor);
        }

        return {
          ...alarm,
          failCount: newFailCount,
          currentDifficulty: newDifficulty
        };
      }
      return alarm;
    }));
  };

  const resetFailCount = (id: number) => {
    setAlarms(alarms.map(alarm => {
      if (alarm.id === id) {
        return {
          ...alarm,
          failCount: 0,
          currentDifficulty: alarm.baseDifficulty || 50
        };
      }
      return alarm;
    }));
  };

  return (
    <AlarmContext.Provider value={{ alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, incrementFailCount, resetFailCount }}>
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarms() {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error("useAlarms must be used within AlarmProvider");
  }
  return context;
}
