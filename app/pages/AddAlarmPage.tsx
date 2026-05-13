import { useNavigation } from "../components/SimpleRouter";
import { ChevronLeft, Music, ChevronUp, ChevronDown, Volume2 } from "lucide-react";
import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useAlarms } from "../contexts/AlarmContext";
import { useAlarmForm } from "../contexts/AlarmFormContext";
import { useRingtone } from "../contexts/RingtoneContext";
import { RingtoneModal } from "../components/RingtoneModal";

export function AddAlarmPage() {
  const { navigate, goBack } = useNavigation();
  const { addAlarm } = useAlarms();
  const { formState, setFormState, resetForm } = useAlarmForm();
  const { setSelectedRingtoneId } = useRingtone();
  const [showRingtoneModal, setShowRingtoneModal] = useState(false);

  const { hour, minute, smartMode, label, days: selectedDays, ringtone, volume, ringtoneId, repeat } = formState;

  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const handleSave = () => {
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    addAlarm({
      time,
      hour,
      minute,
      days: repeat === "once" ? [] : selectedDays,
      enabled: true,
      label,
      ringtone,
      smartMode,
      difficulty: formState.difficulty,
      challengeType: formState.challengeType,
      volume: formState.volume,
        });
    resetForm();
    navigate("");
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setFormState({ days: selectedDays.filter(d => d !== day) });
    } else {
      setFormState({ days: [...selectedDays, day] });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <RingtoneModal
        isOpen={showRingtoneModal}
        onClose={() => setShowRingtoneModal(false)}
        selectedRingtone={ringtone}
        onSelect={(name) => setFormState({ ringtone: name })}
        onSelectId={(id) => setFormState({ ringtoneId: id })}
        ringtoneId={ringtoneId}
      />

      <div className="flex items-center justify-between mb-8">
        <button onClick={() => goBack()} className="text-amber">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl">Thêm báo thức</h2>
        <button onClick={handleSave} className="text-amber">Lưu</button>
      </div>

      <div className="mb-8">
        <div className="text-center mb-8">
          <div className="text-5xl sm:text-6xl font-light text-amber mb-6 tabular-nums">
            {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
          </div>

          <div className="flex gap-3 sm:gap-4 justify-center max-w-xs mx-auto px-4">
            <div className="flex-1 min-w-0">
              <label className="text-sm text-white/60 mb-2 block">Giờ</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFormState({ hour: (hour + 1) % 24 })}
                  className="p-2 bg-[#1a1a1a] rounded-lg border border-white/10 hover:border-amber transition-colors"
                >
                  <ChevronUp className="w-5 h-5 mx-auto text-amber" />
                </button>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setFormState({ hour: Math.min(23, Math.max(0, Number(e.target.value) || 0)) })}
                  className="w-full bg-[#1a1a1a] rounded-xl px-2 sm:px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-2xl sm:text-3xl text-amber tabular-nums"
                />
                <button
                  onClick={() => setFormState({ hour: (hour - 1 + 24) % 24 })}
                  className="p-2 bg-[#1a1a1a] rounded-lg border border-white/10 hover:border-amber transition-colors"
                >
                  <ChevronDown className="w-5 h-5 mx-auto text-amber" />
                </button>
              </div>
            </div>
            <div className="flex items-center pb-3 text-2xl sm:text-3xl text-amber">:</div>
            <div className="flex-1 min-w-0">
              <label className="text-sm text-white/60 mb-2 block">Phút</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFormState({ minute: (minute + 1) % 60 })}
                  className="p-2 bg-[#1a1a1a] rounded-lg border border-white/10 hover:border-amber transition-colors"
                >
                  <ChevronUp className="w-5 h-5 mx-auto text-amber" />
                </button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => setFormState({ minute: Math.min(59, Math.max(0, Number(e.target.value) || 0)) })}
                  className="w-full bg-[#1a1a1a] rounded-xl px-2 sm:px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-2xl sm:text-3xl text-amber tabular-nums"
                />
                <button
                  onClick={() => setFormState({ minute: (minute - 1 + 60) % 60 })}
                  className="p-2 bg-[#1a1a1a] rounded-lg border border-white/10 hover:border-amber transition-colors"
                >
                  <ChevronDown className="w-5 h-5 mx-auto text-amber" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Tên báo thức</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setFormState({ label: e.target.value })}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3 border border-white/10 focus:border-amber outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-3 block">Chế độ lặp</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setFormState({ repeat: "once", days: [] })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  repeat === "once"
                    ? 'bg-amber text-black'
                    : 'bg-[#1a1a1a] text-white/60 border border-white/10'
                }`}
              >
                Một lần
              </button>
              <button
                onClick={() => setFormState({ repeat: "weekly" })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  repeat === "weekly"
                    ? 'bg-amber text-black'
                    : 'bg-[#1a1a1a] text-white/60 border border-white/10'
                }`}
              >
                Lặp lại
              </button>
            </div>
            {repeat === "weekly" && (
              <div className="flex gap-2">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-2 rounded-full text-sm transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-amber text-black'
                        : 'bg-[#1a1a1a] text-white/60'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setShowRingtoneModal(true)} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-4 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-amber" />
              <span>Nhạc chuông</span>
            </div>
            <span className="text-sm text-white/60 truncate max-w-[150px]">{ringtone}</span>
          </button>

          <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-amber" />
                <span>Âm lượng</span>
              </div>
              <span className="text-sm text-amber font-medium">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setFormState({ volume: Number(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber [&::-moz-range-thumb]:border-0"
            />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1">Chế độ thông minh</div>
                <div className="text-sm text-white/60">Giải toán để tắt chuông</div>
              </div>
              <Switch.Root
                checked={smartMode}
                onCheckedChange={(checked) => {
                  if (checked) {
                    navigate("smart-mode");
                  } else {
                    setFormState({ smartMode: false });
                  }
                }}
                className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative"
              >
                <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
              </Switch.Root>
            </div>
          </div>

          {smartMode && (
            <button onClick={() => navigate("smart-mode")} className="block text-center text-amber text-sm">
              ⚙️ Cấu hình chế độ thông minh →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
