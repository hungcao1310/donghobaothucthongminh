# Write AlarmFormContext.tsx
$formContent = @"
import { createContext, useContext, useState, ReactNode } from "react";

export type ChallengeType = "math" | "typing" | "pattern";

interface AlarmFormState {
  id?: number;
  hour: number;
  minute: number;
  days: string[];
  label: string;
  ringtone: string;
  smartMode: boolean;
  difficulty: number;
  challengeType: ChallengeType;
  volume: number;
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
  label: "Bao thuc moi",
  ringtone: "Nhac chuong mac dinh",
  smartMode: false,
  difficulty: 50,
  challengeType: "math",
  volume: 80,
};

const AlarmFormContext = createContext<AlarmFormContextType | undefined>(undefined);

export function AlarmFormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormStateInternal] = useState<AlarmFormState>(defaultState);
  const [isInitialized, setIsInitialized] = useState(false);

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
    setIsInitialized(false);
  };

  const initForm = (state: Partial<AlarmFormState>) => {
    if (!isInitialized) {
      setFormStateInternal({ ...defaultState, ...state });
      setIsInitialized(true);
    }
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
"@

$formContent | Out-File -FilePath "c:\Users\caova\donghobaothucthongminh\repo\app\contexts\AlarmFormContext.tsx" -Encoding UTF8 -NoNewline

Write-Host "AlarmFormContext.tsx updated"
