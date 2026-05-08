import { useNavigation } from "../components/SimpleRouter";
import { Plus, Clock, Timer, History, MoreVertical, Edit2 } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { useState, useEffect } from "react";
import { useAlarms } from "../contexts/AlarmContext";
import { useAlarmForm } from "../contexts/AlarmFormContext";

export function HomePage() {
  const { alarms, toggleAlarm } = useAlarms();
  const { resetForm } = useAlarmForm();
  const { navigate, goBack } = useNavigation();

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    resetForm();
    navigate("add");
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-amber">Báo thức thông minh</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate("/edit")} className="p-2 rounded-lg bg-[#1a1a1a] border border-white/10 hover:border-amber transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-12">
        <div className="text-7xl font-light text-white mb-2">{currentTime || "--:--"}</div>
        <div className="text-amber/60 text-sm">Giờ Việt Nam (ICT)</div>
      </div>

      <div className="space-y-4 mb-24">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 hover:border-amber/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-5xl font-light text-amber-light">{alarm.time}</div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/details/${alarm.id}`}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 className="w-4 h-4 text-amber" />
                </button>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch.Root
                    checked={alarm.enabled}
                    onCheckedChange={() => toggleAlarm(alarm.id)}
                    className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative cursor-pointer"
                  >
                    <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
                  </Switch.Root>
                </div>
              </div>
            </div>
            <div className="text-sm text-white/60 mb-2">{alarm.label}</div>
            <div className="flex gap-2 flex-wrap">
              {alarm.days.map((day) => (
                <span key={day} className="text-xs px-2 py-1 rounded-full bg-amber/20 text-amber">
                  {day}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <a
        href="/add"
        onClick={handleAddClick}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-amber flex items-center justify-center shadow-lg shadow-amber/50 hover:scale-110 transition-transform cursor-pointer"
      >
        <Plus className="w-8 h-8 text-black" />
      </a>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around items-center py-4">
          <button onClick={() => navigate("/")} className="flex flex-col items-center gap-1 text-amber">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Báo thức</span>
          </button>
          <button onClick={() => navigate("/stopwatch")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Bấm giờ</span>
          </button>
          <button onClick={() => navigate("/timer")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Timer className="w-6 h-6" />
            <span className="text-xs">Hẹn giờ</span>
          </button>
          <button onClick={() => navigate("/history")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <History className="w-6 h-6" />
            <span className="text-xs">Lịch sử</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
