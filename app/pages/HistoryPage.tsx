import { useNavigation } from "../components/SimpleRouter";
import { Clock, Timer, History, Play, X, Activity } from "lucide-react";
import { useState } from "react";
import { useTimer } from "../contexts/TimerContext";
import * as Dialog from "@radix-ui/react-dialog";

export function HistoryPage() {
  const { navigate, goBack } = useNavigation();
  const { presets, addPreset, updateLastUsed, setCurrentTimer } = useTimer();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState(5);
  const [newSeconds, setNewSeconds] = useState(0);

  const handleAddPreset = () => {
    if (newLabel.trim() && (newMinutes > 0 || newSeconds > 0)) {
      const totalSeconds = newMinutes * 60 + newSeconds;
      const duration = `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`;
      addPreset({ label: newLabel, duration, seconds: totalSeconds });
      setNewLabel("");
      setNewMinutes(5);
      setNewSeconds(0);
      setIsAddDialogOpen(false);
    }
  };

  const handleStartTimer = (preset: typeof presets[0]) => {
    const minutes = Math.floor(preset.seconds / 60);
    const seconds = preset.seconds % 60;
    setCurrentTimer({ minutes, seconds });
    updateLastUsed(preset.id);
    navigate("timer-running");
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <h1 className="text-3xl mb-8 text-amber">Lịch sử & Nhãn</h1>

      <div className="mb-6">
        <div className="text-sm text-white/60 mb-3">Hẹn giờ thường dùng</div>
        <div className="space-y-2">
          {presets.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-5 py-4 border border-white/10"
            >
              <div className="flex-1">
                <div className="text-lg mb-1">{item.label}</div>
                <div className="text-sm text-white/60">{item.lastUsed}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-amber text-xl tabular-nums">{item.duration}</div>
                <button
                  onClick={() => handleStartTimer(item)}
                  className="p-3 rounded-full bg-amber/20 hover:bg-amber/30 transition-colors"
                >
                  <Play className="w-5 h-5 text-amber" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Trigger asChild>
          <button className="w-full py-4 rounded-xl bg-amber/10 border border-amber/30 text-amber hover:bg-amber/20 transition-colors">
            + Thêm nhãn mới
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
            <Dialog.Title className="text-xl text-amber mb-6">Thêm nhãn mới</Dialog.Title>
            <Dialog.Description className="sr-only">
              Tạo nhãn hẹn giờ mới với tên và thời gian tùy chỉnh
            </Dialog.Description>
            <Dialog.Close asChild>
              <button className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Tên nhãn</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ví dụ: Nấu ăn, Đọc sách..."
                  className="w-full bg-[#0a0a0a] rounded-xl px-4 py-3 border border-white/10 focus:border-amber outline-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-white/60 mb-2 block">Phút</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-full bg-[#0a0a0a] rounded-xl px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-2xl"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-white/60 mb-2 block">Giây</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newSeconds}
                    onChange={(e) => setNewSeconds(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-full bg-[#0a0a0a] rounded-xl px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-2xl"
                  />
                </div>
              </div>

              <button
                onClick={handleAddPreset}
                disabled={!newLabel.trim() || (newMinutes === 0 && newSeconds === 0)}
                className="w-full py-3 rounded-xl bg-amber text-black disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                Thêm
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around items-center py-4">
          <button onClick={() => navigate("home")} className="flex flex-col items-center gap-1 text-white/60 hover:text-white">
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
          <button onClick={() => navigate("history")} className="flex flex-col items-center gap-1 text-amber">
            <History className="w-6 h-6" />
            <span className="text-xs">Lịch sử</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
