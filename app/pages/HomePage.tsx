import { Plus, Clock, Timer, History, Music, Volume2, Trash2, Edit2, Activity, User } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { useState, useEffect, useRef } from "react";
import { useAlarms } from "../contexts/AlarmContext";
import { useAlarmForm } from "../contexts/AlarmFormContext";
import { useNavigation } from "../components/SimpleRouter";


function DeleteConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-white font-medium mb-1">Xóa báo thức?</p>
            <p className="text-white/50 text-sm">Bạn có chắc chắn muốn xóa báo thức này không?</p>
          </div>
          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipeableAlarmCard({
  alarm,
  onEdit,
  onDelete,
  onToggle,
}: {
  alarm: { id: number; time: string; days: string[]; enabled: boolean; label: string; ringtone: string; volume?: number };
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [revealed, setRevealed] = useState<"none" | "delete" | "edit">("none");
  const [showConfirm, setShowConfirm] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const hasDragged = useRef(false);
  const THRESHOLD = 72;

  // swipe RIGHT → edit (offset > 0, card shifts right, exposes left backdrop)
  // swipe LEFT  → delete (offset < 0, card shifts left, exposes right backdrop)

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isHorizontal.current = null;
    hasDragged.current = false;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
    }
    if (!isHorizontal.current) return;
    e.preventDefault();
    hasDragged.current = true;
    const base = revealed === "delete" ? -THRESHOLD : revealed === "edit" ? THRESHOLD : 0;
    const raw = base + dx;
    const clamped = Math.max(-THRESHOLD - 24, Math.min(THRESHOLD + 24, raw));
    setOffset(clamped);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    isHorizontal.current = null;

    if (!hasDragged.current) return;

    if (offset > THRESHOLD / 2) {
      setOffset(THRESHOLD);
      setRevealed("edit");
    } else if (offset < -THRESHOLD / 2) {
      setOffset(-THRESHOLD);
      setRevealed("delete");
    } else {
      setOffset(0);
      setRevealed("none");
    }
  };

  const reset = () => { setOffset(0); setRevealed("none"); };

  return (
    <>
      {showConfirm && (
        <DeleteConfirmDialog
          onConfirm={() => { setShowConfirm(false); reset(); onDelete(); }}
          onCancel={() => { setShowConfirm(false); reset(); }}
        />
      )}

      <div className="relative rounded-2xl overflow-hidden select-none">
        {/* Edit backdrop — visible when card slides RIGHT */}
        <div className="absolute inset-0 flex items-center justify-start pl-5 bg-amber/20 rounded-2xl">
          <div className="flex flex-col items-center gap-1">
            <Edit2 className="w-5 h-5 text-amber" />
            <span className="text-[10px] text-amber font-medium">Sửa</span>
          </div>
        </div>
        {/* Delete backdrop — visible when card slides LEFT */}
        <div className="absolute inset-0 flex items-center justify-end pr-5 bg-red-500/20 rounded-2xl">
          <div className="flex flex-col items-center gap-1">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="text-[10px] text-red-400 font-medium">Xóa</span>
          </div>
        </div>

        {/* Card */}
        <div
          className="relative bg-[#1a1a1a] rounded-2xl p-4 sm:p-5 border border-white/10 touch-pan-y cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${offset}px)`,
            transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.25,1,0.5,1)",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl sm:text-5xl font-light text-amber-light tabular-nums">{alarm.time}</div>
            <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <Switch.Root
                checked={alarm.enabled}
                onCheckedChange={onToggle}
                className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative cursor-pointer"
              >
                <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
              </Switch.Root>
            </div>
          </div>
          <div className="text-sm text-white/60 mb-2">{alarm.label}</div>
          <div className="flex gap-2 flex-wrap mb-2">
            {alarm.days.map((day) => (
              <span key={day} className="text-xs px-2 py-1 rounded-full bg-amber/20 text-amber">{day}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{alarm.ringtone || "Mặc định"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{alarm.volume || 80}%</span>
            </div>
          </div>
        </div>

        {/* Tap targets on revealed sides */}
        {revealed === "edit" && (
          <button
            className="absolute inset-y-0 left-0 w-20 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); reset(); onEdit(); }}
          />
        )}
        {revealed === "delete" && (
          <button
            className="absolute inset-y-0 right-0 w-20 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
          />
        )}
      </div>
    </>
  );
}

export function HomePage() {
  const { alarms, toggleAlarm, deleteAlarm } = useAlarms();
  const { resetForm } = useAlarmForm();
  const { navigate } = useNavigation();

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
        <button
          onClick={() => navigate("auth")}
          className="p-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-amber hover:border-amber/30 transition-all"
          title="Đăng nhập / Đăng ký"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mb-12">
        <div className="text-6xl sm:text-7xl font-light text-white mb-2 tabular-nums">{currentTime || "--:--"}</div>
        <div className="text-amber/60 text-sm">Giờ Việt Nam (ICT)</div>
      </div>

      <div className="space-y-4 mb-24">
        {alarms.map((alarm) => (
          <SwipeableAlarmCard
            key={alarm.id}
            alarm={alarm}
            onEdit={() => navigate("details", { id: alarm.id })}
            onDelete={() => deleteAlarm(alarm.id)}
            onToggle={() => toggleAlarm(alarm.id)}
          />
        ))}
      </div>

      <button
        onClick={handleAddClick}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-amber flex items-center justify-center shadow-lg shadow-amber/50 hover:scale-110 transition-transform cursor-pointer"
      >
        <Plus className="w-8 h-8 text-black" />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around items-center py-4">
          <button onClick={() => navigate("home")} className="flex flex-col items-center gap-1 text-amber">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Báo thức</span>
          </button>
          <button onClick={() => navigate("stopwatch")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Clock className="w-6 h-6" />
            <span className="text-xs">Bấm giờ</span>
          </button>
          <button onClick={() => navigate("timer")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Timer className="w-6 h-6" />
            <span className="text-xs">Hẹn giờ</span>
          </button>
          <button onClick={() => navigate("health")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <Activity className="w-6 h-6" />
            <span className="text-xs">Sức khỏe</span>
          </button>
          <button onClick={() => navigate("history")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
            <History className="w-6 h-6" />
            <span className="text-xs">Lịch sử</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
