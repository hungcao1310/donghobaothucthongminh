const fs = require('fs');
const path = require('path');

// Helper to write file
function writeFile(relativePath, content) {
  const fullPath = path.join(__dirname, relativePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated: ${relativePath}`);
}

// 1. AlarmFormContext.tsx - Remove autoIncreaseDifficulty field
const alarmFormContent = `import { createContext, useContext, useState, ReactNode } from "react";

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
  label: "Báo thức mới",
  ringtone: "Nhạc chuông mặc định",
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
`;
writeFile('app/contexts/AlarmFormContext.tsx', alarmFormContent);

// 2. AddAlarmPage.tsx - Remove autoIncreaseDifficulty from handleSave
let addAlarmContent = fs.readFileSync(path.join(__dirname, 'app/pages/AddAlarmPage.tsx'), 'utf8');
addAlarmContent = addAlarmContent.replace(
  "      autoIncreaseDifficulty: formState.autoIncreaseDifficulty,\n",
  ""
);
writeFile('app/pages/AddAlarmPage.tsx', addAlarmContent);

// 3. AlarmDetailsPage.tsx - Remove autoIncreaseDifficulty from initForm and handleSave
let alarmDetailsContent = fs.readFileSync(path.join(__dirname, 'app/pages/AlarmDetailsPage.tsx'), 'utf8');
alarmDetailsContent = alarmDetailsContent.replace(
  "        autoIncreaseDifficulty: alarm.autoIncreaseDifficulty ?? true,\n",
  ""
);
alarmDetailsContent = alarmDetailsContent.replace(
  "        autoIncreaseDifficulty: formState.autoIncreaseDifficulty,\n",
  ""
);
writeFile('app/pages/AlarmDetailsPage.tsx', alarmDetailsContent);

// 4. SmartModeSettingsPage.tsx - Remove entire auto increase section
let smartModeContent = fs.readFileSync(path.join(__dirname, 'app/pages/SmartModeSettingsPage.tsx'), 'utf8');

// Remove autoIncrease state and increaseRate state
smartModeContent = smartModeContent.replace(
  "  const [autoIncrease, setAutoIncrease] = useState(formState.autoIncreaseDifficulty ?? true);\n  const [increaseRate, setIncreaseRate] = useState(15);\n",
  ""
);

// Remove Auto Increase section (lines 169-211)
smartModeContent = smartModeContent.replace(
  /(\s*){2}\/\* Auto Increase \*\/[\s\S]*?<\/div>\n\s*<\/div>\n\s*\n\s*(\/\* Additional)/,
  "$1$2"
);

// Update handleSave to remove autoIncreaseDifficulty
smartModeContent = smartModeContent.replace(
  "      autoIncreaseDifficulty: autoIncrease,\n",
  ""
);

// Update preview text referencing autoIncrease
smartModeContent = smartModeContent.replace(
  "            Độ khó: {getDifficultyLabel()} → {autoIncrease ? `${getDifficultyLabel()} +${increaseRate}%` : \"Không đổi\"}\n",
  "            Độ khó: {getDifficultyLabel()}\n"
);

// Update warning notice referencing increaseRate
smartModeContent = smartModeContent.replace(
  "              <li>• Mỗi lần sai, độ khó tăng lên {increaseRate}%</li>\n",
  ""
);

// Remove the getIncreaseRateLabel function
smartModeContent = smartModeContent.replace(
  /  const getIncreaseRateLabel = \(\) => {\n    if \(increaseRate <= 10\) return "Nhẹ nhàng";\n    if \(increaseRate <= 15\) return "Vừa phải";\n    if \(increaseRate <= 25\) return "Mạnh";\n    return "Cực mạnh";\n  };\n\n/,
  ""
);

writeFile('app/pages/SmartModeSettingsPage.tsx', smartModeContent);

// 5. AlarmContext.tsx - Already done (no autoIncreaseDifficulty)
console.log('✅ All files updated successfully!');
