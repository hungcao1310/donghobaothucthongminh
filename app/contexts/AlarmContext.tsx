import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import * as api from "../services/database";

export type ChallengeType = "math" | "typing" | "pattern";

export interface Alarm {
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
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [localIdCounter, setLocalIdCounter] = useState(100);

  // Tải danh sách báo thức từ API khi mount
  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    try {
      const user = api.getUserFromLocal();
      if (!user) return;
      const result = await api.fetchAlarms();
      if (result.success && result.alarms) {
        setAlarms(result.alarms.map(a => ({
          ...a,
          ringtone: a.ringtone || "",
          challengeType: (a.challengeType as ChallengeType) || "math",
          difficulty: a.difficulty || 50,
          baseDifficulty: a.difficulty || 50,
          currentDifficulty: a.difficulty || 50,
          failCount: 0,
          volume: a.volume || 80,
          filePath: a.filePath || "",
        })));
      }
    } catch (err) {
      console.error("Lỗi tải báo thức:", err);
    }
  };

  const addAlarm = useCallback(async (alarm: Omit<Alarm, "id">) => {
    try {
      const user = api.getUserFromLocal();
      if (!user) return;

      const result = await api.createAlarm({
        time: alarm.time,
        label: alarm.label,
        days: alarm.days,
        enabled: alarm.enabled,
        smartMode: alarm.smartMode,
        challengeType: alarm.challengeType,
        difficulty: alarm.difficulty,
        volume: alarm.volume,
      });

      if (result.success && result.alarmId) {
        const baseDiff = alarm.difficulty || 50;
        const newAlarm: Alarm = {
          ...alarm,
          id: result.alarmId,
          baseDifficulty: baseDiff,
          currentDifficulty: baseDiff,
          failCount: 0,
        };
        setAlarms(prev => [...prev, newAlarm]);
      } else {
        // Fallback local
        const newId = localIdCounter;
        setLocalIdCounter(prev => prev + 1);
        const baseDiff2 = alarm.difficulty || 50;
        setAlarms(prev => [...prev, {
          ...alarm,
          id: newId,
          baseDifficulty: baseDiff2,
          currentDifficulty: baseDiff2,
          failCount: 0
        }]);
      }
    } catch (err) {
      console.error("Lỗi thêm báo thức:", err);
    }
  }, [localIdCounter]);

  const updateAlarm = useCallback(async (id: number, updates: Partial<Alarm>) => {
    try {
      const result = await api.updateAlarm(id, updates);
      if (result.success || true) {
        setAlarms(prev => prev.map(alarm => {
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
      }
    } catch (err) {
      console.error("Lỗi cập nhật báo thức:", err);
    }
  }, []);

  const deleteAlarm = useCallback(async (id: number) => {
    try {
      await api.deleteAlarm(id);
      setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    } catch (err) {
      console.error("Lỗi xóa báo thức:", err);
    }
  }, []);

  const toggleAlarm = useCallback(async (id: number) => {
    try {
      const result = await api.toggleAlarm(id);
      if (result.success) {
        setAlarms(prev => prev.map(alarm =>
          alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
        ));
      }
    } catch (err) {
      console.error("Lỗi toggle báo thức:", err);
    }
  }, []);

  const incrementFailCount = useCallback((id: number) => {
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id === id) {
        return { ...alarm, failCount: (alarm.failCount || 0) + 1 };
      }
      return alarm;
    }));
  }, []);

  const resetFailCount = useCallback((id: number) => {
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id === id) {
        return { ...alarm, failCount: 0 };
      }
      return alarm;
    }));
  }, []);

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