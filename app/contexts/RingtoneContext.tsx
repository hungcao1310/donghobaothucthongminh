import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  customRingtones: CustomRingtone[];
  addCustomRingtone: (ringtone: CustomRingtone) => void;
  removeCustomRingtone: (id: string) => void;
  setDefaultRingtone: (id: string) => void;
  defaultRingtoneId: string | null;
}

const RingtoneContext = createContext<RingtoneContextType | undefined>(undefined);

export function RingtoneProvider({ children }: { children: ReactNode }) {
  const [selectedRingtone, setSelectedRingtone] = useState("Nhạc chuông mặc định");
  const [defaultRingtoneId, setDefaultRingtoneIdState] = useState<string | null>(() => {
    const stored = localStorage.getItem("defaultRingtoneId");
    return stored || null;
  });
  const [customRingtones, setCustomRingtones] = useState<CustomRingtone[]>(() => {
    const stored = localStorage.getItem("customRingtones");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("customRingtones", JSON.stringify(customRingtones));
    } catch {
      // localStorage quota exceeded (audio data URLs are large) — skip persistence
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
      customRingtones,
      addCustomRingtone,
      removeCustomRingtone,
      setDefaultRingtone,
      defaultRingtoneId
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
