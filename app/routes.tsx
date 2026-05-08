import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./pages/HomePage";
import { AddAlarmPage } from "./pages/AddAlarmPage";
import { EditDeletePage } from "./pages/EditDeletePage";
import { AlarmDetailsPage } from "./pages/AlarmDetailsPage";
import { RingtonePage } from "./pages/RingtonePage";
import { BatchManagePage } from "./pages/BatchManagePage";
import { DifficultySettingsPage } from "./pages/DifficultySettingsPage";
import { AlarmChallengePage } from "./pages/AlarmChallengePage";
import { CongratulationsPage } from "./pages/CongratulationsPage";
import { NormalAlarmPage } from "./pages/NormalAlarmPage";
import { StopwatchPage } from "./pages/StopwatchPage";
import { TimerPage } from "./pages/TimerPage";
import { TimerRunningPage } from "./pages/TimerRunningPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SnoozePage } from "./pages/SnoozePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "add", Component: AddAlarmPage },
      { path: "edit", Component: EditDeletePage },
      { path: "details/:id", Component: AlarmDetailsPage },
      { path: "ringtone", Component: RingtonePage },
      { path: "batch", Component: BatchManagePage },
      { path: "difficulty", Component: DifficultySettingsPage },
      { path: "challenge/:id", Component: AlarmChallengePage },
      { path: "congratulations", Component: CongratulationsPage },
      { path: "alarm/:id", Component: NormalAlarmPage },
      { path: "stopwatch", Component: StopwatchPage },
      { path: "timer", Component: TimerPage },
      { path: "timer-running", Component: TimerRunningPage },
      { path: "history", Component: HistoryPage },
      { path: "snooze/:id", Component: SnoozePage },
    ],
  },
]);
