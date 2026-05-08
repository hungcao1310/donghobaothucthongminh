import { useNavigation, useParams } from "../components/SimpleRouter";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAlarms } from "../contexts/AlarmContext";

export function NormalAlarmPage() {
  const { navigate, goBack } = useNavigation();
  const { id } = useParams();
  const { alarms } = useAlarms();
  const alarm = alarms.find(a => a.id === Number(id));
  const [slideProgress, setSlideProgress] = useState(0);

  const handleDismiss = () => {
    if (slideProgress > 80) {
      navigate("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-amber/60 text-sm mb-4 animate-pulse">
          Báo thức đang reo...
        </div>

        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-7xl sm:text-8xl mb-8"
        >
          ⏰
        </motion.div>

        <div className="text-5xl sm:text-6xl text-amber mb-4 tabular-nums">{alarm?.time || "07:00"}</div>
        <div className="text-lg sm:text-xl text-white/60 mb-16 text-center px-4">{alarm?.label || "Báo thức"}</div>

        <div className="w-full max-w-sm space-y-6">
          <div className="relative w-full h-16 bg-[#1a1a1a] rounded-full border-2 border-amber/30 overflow-hidden">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDrag={(_, info) => {
                const progress = Math.max(0, Math.min(100, (info.offset.x / 250) * 100));
                setSlideProgress(progress);
              }}
              onDragEnd={handleDismiss}
              className="absolute left-0 top-0 h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <div className="w-14 h-14 rounded-full bg-amber flex items-center justify-center shadow-lg shadow-amber/50">
                <span className="text-2xl">→</span>
              </div>
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/60">Trượt để tắt</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/snooze/${id}`)}
            className="w-full py-4 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
          >
            Báo lại sau 5 phút
          </button>
        </div>
      </div>
    </div>
  );
}
