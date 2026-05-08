import { useEffect, useState } from "react";
import { useAlarms } from "../contexts/AlarmContext";
import { useNavigation } from "./SimpleRouter";

export function AlarmTrigger() {
  const { alarms, updateAlarm } = useAlarms();
  const { navigate } = useNavigation();
  const [lastChecked, setLastChecked] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dayIndex = now.getDay();
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const currentDay = days[dayIndex];

      if (timeStr !== lastChecked) {
        setLastChecked(timeStr);
        const triggered = alarms.find(a =>
          a.enabled &&
          a.time === timeStr &&
          a.days.includes(currentDay)
        );

        if (triggered) {
          updateAlarm(triggered.id, { enabled: false });
          if (triggered.smartMode) {
            navigate("challenge", { id: triggered.id });
          } else {
            navigate("alarm", { id: triggered.id });
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alarms, lastChecked, navigate, updateAlarm]);

  return null;
}
