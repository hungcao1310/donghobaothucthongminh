import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as api from "../services/database";

export interface Ringtone {
  id: number;
  name: string;
  filePath: string;
}

export interface CustomRingtone {
  id: string;
  name: string;
  url: string;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
  isDefault?: boolean;
}

interface RingtoneContextType {
  selectedRingtone: string;
  setSelectedRingtone: (ringtone: string) => void;
  ringtoneList: Ringtone[];
  selectedRingtoneId: number | null;
  setSelectedRingtoneId: (id: number | null) => void;
  customRingtones: CustomRingtone[];
  addCustomRingtone: (ringtone: CustomRingtone) => void;
  removeCustomRingtone: (id: string) => void;
  setDefaultRingtone: (id: string) => void;
  defaultRingtoneId: string | null;
  getRingtoneNameById: (id: number | null | undefined) => string;
}

const RingtoneContext = createContext<RingtoneContextType | undefined>(undefined);

export function RingtoneProvider({ children }: { children: ReactNode }) {
  const [selectedRingtone, setSelectedRingtone] = useState("Nhạc chuông mặc định");
  const [selectedRingtoneId, setSelectedRingtoneId] = useState<number | null>(1);
  const [ringtoneList, setRingtoneList] = useState<Ringtone[]>([]);
  const [defaultRingtoneId, setDefaultRingtoneIdState] = useState<string | null>(() => {
    return localStorage.getItem("defaultRingtoneId") || null;
  });
  const [customRingtones, setCustomRingtones] = useState<CustomRingtone[]>(() => {
    const stored = localStorage.getItem("customRingtones");
    return stored ? JSON.parse(stored) : [];
  });

  // Load ringtones from API on mount
  useEffect(() => {
    loadRingtones();
  }, []);

  const loadRingtones = async () => {
    try {
      const result = await api.fetchRingtones();
      if (result.success && result.ringtones) {
        setRingtoneList(result.ringtones);
        if (result.ringtones.length > 0) {
          // Set default name for selectedRingtone if not set
          if (selectedRingtone === "Nhạc chuông mặc định") {
            setSelectedRingtone(result.ringtones[0].name);
            setSelectedRingtoneId(result.ringtones[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi tải danh sách nhạc chuông:", err);
    }
  };

  const getRingtoneNameById = (id: number | null | undefined): string => {
    if (!id) return "Nhạc chuông mặc định";
    const found = ringtoneList.find(r => r.id === id);
    return found ? found.name : "Nhạc chuông mặc định";
  };

  useEffect(() => {
    try {
      localStorage.setItem("customRingtones", JSON.stringify(customRingtones));
    } catch {
      // skip
    }
  }, [customRingtones]);

  useEffect(() => {
    if (defaultRingtoneId) {
      localStorage.setItem("defaultRingtoneId", defaultRingtoneId);
    } else {
      localStorage.removeItem("defaultRingtoneId");
    }
  }, [defaultRingtoneId]);

  const addCustomRingtone = (ringtone: CustomRingtone) => {
    setCustomRingtones([ringtone, ...customRingtones]);
  };

  const removeCustomRingtone = (id: string) => {
    if (defaultRingtoneId === id) {
      setDefaultRingtoneIdState(null);
    }
    setCustomRingtones(customRingtones.filter(r => r.id !== id));
  };

  const setDefaultRingtone = (id: string) => {
    setDefaultRingtoneIdState(id);
  };

  return (
    <RingtoneContext.Provider value={{
      selectedRingtone,
      setSelectedRingtone,
      ringtoneList,
      selectedRingtoneId,
      setSelectedRingtoneId,
      customRingtones,
      addCustomRingtone,
      removeCustomRingtone,
      setDefaultRingtone,
      defaultRingtoneId,
      getRingtoneNameById,
    }}>
      {children}
    </RingtoneContext.Provider>
  );
}

export function useRingtone() {
  const context = useContext(RingtoneContext);
  if (!context) {
    throw new Error("useRingtone must be used within RingtoneProvider");
  }
  return context;
}