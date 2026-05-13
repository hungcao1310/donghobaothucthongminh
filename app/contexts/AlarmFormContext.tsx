import { createContext, useContext, useState, ReactNode } from "react";

export type ChallengeType = "math" | "typing" | "pattern";

export type RepeatMode = "once" | "weekly";

interface AlarmFormState {
  id?: number;
  hour: number;
  minute: number;
  days: string[];
  label: string;
  ringtone: string;
  ringtoneId?: number | null;
  smartMode: boolean;
  difficulty: number;
  challengeType: ChallengeType;
  volume: number;
  repeat: RepeatMode;
}

interface AlarmFormContextType {
  formState: AlarmFormState;
  setFormState: (state: Partial<AlarmFormState>) => void;
  resetForm: () => void;
  initForm: (state: Partial<AlarmFormState>) => void;
}

const defaultState: AlarmFormState = {
  hour: 7,
  minute: 0,
  days: ["T2", "T3", "T4", "T5", "T6"],
  label: "Báo thức mới",
  ringtone: "Nhạc chuông mặc định",
  smartMode: false,
  difficulty: 50,
  challengeType: "math",
  volume: 80,
  repeat: "weekly",
};

const AlarmFormContext = createContext<AlarmFormContextType | undefined>(undefined);

export function AlarmFormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormStateInternal] = useState<AlarmFormState>(defaultState);

  const setFormState = (updates: Partial<AlarmFormState>) => {
    setFormStateInternal((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    setFormStateInternal({
      ...defaultState,
      hour: now.getHours(),
      minute: now.getMinutes()
    });
  };

  const initForm = (state: Partial<AlarmFormState>) => {
    setFormStateInternal({ ...defaultState, ...state });
  };

  return (
    <AlarmFormContext.Provider value={{ formState, setFormState, resetForm, initForm }}>
      {children}
    </AlarmFormContext.Provider>
  );
}

export function useAlarmForm() {
  const context = useContext(AlarmFormContext);
  if (!context) {
    throw new Error("useAlarmForm must be used within AlarmFormProvider");
  }
  return context;
}
