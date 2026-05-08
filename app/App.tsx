import { useEffect } from "react";
import { NavigationProvider, useNavigation } from "./components/SimpleRouter";
import { AlarmProvider } from "./contexts/AlarmContext";
import { TimerProvider } from "./contexts/TimerContext";
import { RingtoneProvider } from "./contexts/RingtoneContext";
import { AlarmFormProvider } from "./contexts/AlarmFormContext";
import { SleepProvider } from "./contexts/SleepContext";
import { HomePage } from "./pages/HomePage";
import { AddAlarmPage } from "./pages/AddAlarmPage";
import { EditDeletePage } from "./pages/EditDeletePage";
import { AlarmDetailsPage } from "./pages/AlarmDetailsPage";
import { RingtonePage } from "./pages/RingtonePage";
import { BatchManagePage } from "./pages/BatchManagePage";
import { DifficultySettingsPage } from "./pages/DifficultySettingsPage";
import { SmartModeSettingsPage } from "./pages/SmartModeSettingsPage";
import { AlarmChallengePage } from "./pages/AlarmChallengePage";
import { CongratulationsPage } from "./pages/CongratulationsPage";
import { NormalAlarmPage } from "./pages/NormalAlarmPage";
import { StopwatchPage } from "./pages/StopwatchPage";
import { TimerPage } from "./pages/TimerPage";
import { TimerRunningPage } from "./pages/TimerRunningPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SnoozePage } from "./pages/SnoozePage";
import { HealthPage } from "./pages/HealthPage";
import { AlarmTrigger } from "./components/AlarmTrigger";

function AppContent() {
  const { currentPage } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case "home": return <HomePage />;
      case "add": return <AddAlarmPage />;
      case "edit": return <EditDeletePage />;
      case "details": return <AlarmDetailsPage />;
      case "ringtone": return <RingtonePage />;
      case "batch": return <BatchManagePage />;
      case "difficulty": return <DifficultySettingsPage />;
      case "smart-mode": return <SmartModeSettingsPage />;
      case "challenge": return <AlarmChallengePage />;
      case "congratulations": return <CongratulationsPage />;
      case "alarm": return <NormalAlarmPage />;
      case "stopwatch": return <StopwatchPage />;
      case "timer": return <TimerPage />;
      case "timer-running": return <TimerRunningPage />;
      case "history": return <HistoryPage />;
      case "snooze": return <SnoozePage />;
      case "health": return <HealthPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-md mx-auto min-h-screen">
        <AlarmTrigger />
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <NavigationProvider>
      <RingtoneProvider>
        <TimerProvider>
          <SleepProvider>
            <AlarmProvider>
              <AlarmFormProvider>
                <AppContent />
              </AlarmFormProvider>
            </AlarmProvider>
          </SleepProvider>
        </TimerProvider>
      </RingtoneProvider>
    </NavigationProvider>
  );
}