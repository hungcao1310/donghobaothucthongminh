import { useNavigation, useParams } from "../components/SimpleRouter";
import { ChevronLeft, Music, Repeat, Zap, ChevronUp, ChevronDown, Volume2 } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { useState, useEffect } from "react";
import { useAlarms } from "../contexts/AlarmContext";
import { useAlarmForm } from "../contexts/AlarmFormContext";
import { RingtoneModal } from "../components/RingtoneModal";

export function AlarmDetailsPage() {
  const { navigate, goBack } = useNavigation();
  const { id } = useParams();
  const { alarms, updateAlarm } = useAlarms();
  const { formState, setFormState, initForm } = useAlarmForm();

  const alarm = alarms.find(a => a.id === Number(id));

  useEffect(() => {
    if (alarm) {
      initForm({
        id: alarm.id,
        hour: alarm.hour,
        minute: alarm.minute,
        smartMode: alarm.smartMode,
        ringtone: alarm.ringtone,
        label: alarm.label,
        days: alarm.days,
        difficulty: alarm.difficulty || 50,
        challengeType: alarm.challengeType || "math",
        volume: alarm.volume || 80,
        autoIncreaseDifficulty: alarm.autoIncreaseDifficulty ?? true,
      });
    }
  }, [alarm, initForm]);

  const [vibrate, setVibrate] = useState(true);
  const [snooze, setSnooze] = useState(true);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [showRingtoneModal, setShowRingtoneModal] = useState(false);

  const { hour, minute, smartMode, ringtone, volume, label } = formState;

  const handleSave = () => {
    if (alarm) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      updateAlarm(alarm.id, {
        time,
        hour,
        minute,
        label,
        smartMode,
        ringtone,
        difficulty: formState.difficulty,
        challengeType: formState.challengeType,
        volume: formState.volume,
        autoIncreaseDifficulty: formState.autoIncreaseDifficulty,
      });
    }
    navigate("");
  };

  if (!alarm) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white/60">Không tìm thấy báo thức</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <RingtoneModal
        isOpen={showRingtoneModal}
        onClose={() => setShowRingtoneModal(false)}
        selectedRingtone={ringtone}
        onSelect={(name) => setFormState({ ringtone: name })}
      />

      <div className="flex items-center justify-between mb-8">
        <button onClick={() => goBack()} className="text-amber">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl">Cài đặt nâng cao</h2>
        <button onClick={handleSave} className="text-amber">Xong</button>
      </div>

      <div className="text-center mb-8">
        {isEditingTime ? (
          <div>
            <div className="flex gap-3 sm:gap-4 justify-center max-w-xs mx-auto mb-4 px-4">
              <div className="flex-1 min-w-0">
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
                    className="w-full bg-[#1a1a1a] rounded-xl px-2 sm:px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-3xl sm:text-4xl text-amber tabular-nums"
                  />
                  <button
                    onClick={() => setFormState({ hour: (hour - 1 + 24) % 24 })}
                    className="p-2 bg-[#1a1a1a] rounded-lg border border-white/10 hover:border-amber transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 mx-auto text-amber" />
                  </button>
                </div>
              </div>
              <div className="flex items-center text-3xl sm:text-4xl text-amber">:</div>
              <div className="flex-1 min-w-0">
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
                    className="w-full bg-[#1a1a1a] rounded-xl px-2 sm:px-4 py-3 border border-white/10 focus:border-amber outline-none text-center text-3xl sm:text-4xl text-amber tabular-nums"
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
            <button
              onClick={() => setIsEditingTime(false)}
              className="text-sm text-amber hover:text-amber-light transition-colors"
            >
              ✓ Xong chỉnh sửa
            </button>
          </div>
        ) : (
          <div className="px-4">
            <button
              onClick={() => setIsEditingTime(true)}
              className="text-5xl sm:text-6xl font-light text-amber mb-2 hover:text-amber-light transition-colors tabular-nums"
            >
              {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
            </button>
            <div className="text-xs text-white/40 mt-1 text-center">Nhấn vào giờ để chỉnh sửa</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-white/60 mb-2 block px-1">Tên báo thức</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setFormState({ label: e.target.value })}
            className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3 border border-white/10 focus:border-amber outline-none"
            placeholder="Nhập tên báo thức"
          />
        </div>
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber" />
              <div>
                <div className="mb-1">Báo thức thông minh</div>
                <div className="text-sm text-white/60">Giải toán để tắt chuông</div>
              </div>
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

          {smartMode && (
            <button onClick={() => navigate("smart-mode")} className="block text-center text-amber text-sm py-2">
              ⚙️ Cấu hình chế độ thông minh →
            </button>
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
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-amber" />
              <span>Rung</span>
            </div>
            <Switch.Root
              checked={vibrate}
              onCheckedChange={setVibrate}
              className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative"
            >
              <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
            </Switch.Root>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1">Báo lại (Snooze)</div>
              <div className="text-sm text-white/60">Lặp lại sau 5 phút</div>
            </div>
            <Switch.Root
              checked={snooze}
              onCheckedChange={setSnooze}
              className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative"
            >
              <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
            </Switch.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
