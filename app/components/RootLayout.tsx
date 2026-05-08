import { Outlet } from "react-router";
import { useEffect } from "react";
import { AlarmProvider } from "../contexts/AlarmContext";
import { TimerProvider } from "../contexts/TimerContext";
import { RingtoneProvider } from "../contexts/RingtoneContext";
import { AlarmFormProvider } from "../contexts/AlarmFormContext";
import { AlarmTrigger } from "./AlarmTrigger";

export function RootLayout() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AlarmProvider>
      <TimerProvider>
        <RingtoneProvider>
          <AlarmFormProvider>
            <div className="min-h-screen bg-[#0a0a0a] text-white">
              <div className="max-w-md mx-auto min-h-screen">
                <AlarmTrigger />
                <Outlet />
              </div>
            </div>
          </AlarmFormProvider>
        </RingtoneProvider>
      </TimerProvider>
    </AlarmProvider>
  );
}
