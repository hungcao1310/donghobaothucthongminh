import { useNavigation } from "../components/SimpleRouter";
import { ChevronLeft, Trash2, Power, PowerOff, CheckSquare } from "lucide-react";
import { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useAlarms } from "../contexts/AlarmContext";

export function BatchManagePage() {
  const { navigate, goBack } = useNavigation();
  const { alarms, deleteAlarm, updateAlarm } = useAlarms();
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const selectAll = () => {
    if (selected.length === alarms.length) {
      setSelected([]);
    } else {
      setSelected(alarms.map(a => a.id));
    }
  };

  const deleteSelected = () => {
    selected.forEach(id => deleteAlarm(id));
    setSelected([]);
  };

  const enableSelected = () => {
    selected.forEach(id => updateAlarm(id, { enabled: true }));
    setSelected([]);
  };

  const disableSelected = () => {
    selected.forEach(id => updateAlarm(id, { enabled: false }));
    setSelected([]);
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => goBack()} className="text-amber">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl">Quản lý hàng loạt</h2>
          {selected.length > 0 && <div className="text-white/60 text-xs mt-1">{selected.length} đã chọn</div>}
        </div>
        <button onClick={selectAll} className="text-amber text-sm">
          {selected.length === alarms.length && alarms.length > 0 ? "Bỏ chọn" : "Tất cả"}
        </button>
      </div>

      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center text-white/40 py-10">Không có báo thức nào</div>
        ) : alarms.map((alarm) => (
          <div
            key={alarm.id}
            onClick={() => toggleSelect(alarm.id)}
            className={`flex items-center gap-4 bg-[#1a1a1a] rounded-xl px-5 py-4 border transition-colors cursor-pointer ${
              selected.includes(alarm.id) ? 'border-amber' : 'border-white/10'
            }`}
          >
            <Checkbox.Root
              checked={selected.includes(alarm.id)}
              className="w-6 h-6 rounded border-2 border-white/40 data-[state=checked]:bg-amber data-[state=checked]:border-amber flex items-center justify-center"
            >
              <Checkbox.Indicator>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M11.5 3.5L6 11L3.5 8" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Checkbox.Indicator>
            </Checkbox.Root>

            <div className="flex-1">
              <div className="text-3xl text-amber-light mb-1">{alarm.time}</div>
              <div className="text-sm text-white/60">{alarm.label}</div>
            </div>

            <div className={`text-xs px-2 py-1 rounded ${alarm.enabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
              {alarm.enabled ? 'BẬT' : 'TẮT'}
            </div>
          </div>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10">
          <div className="max-w-md mx-auto flex justify-around items-center py-4">
            <button
              onClick={deleteSelected}
              className="flex flex-col items-center gap-1 text-red-500"
            >
              <Trash2 className="w-6 h-6" />
              <span className="text-xs">Xóa</span>
            </button>
            <button
              onClick={enableSelected}
              className="flex flex-col items-center gap-1 text-green-400"
            >
              <Power className="w-6 h-6" />
              <span className="text-xs">Bật</span>
            </button>
            <button
              onClick={disableSelected}
              className="flex flex-col items-center gap-1 text-white/60"
            >
              <PowerOff className="w-6 h-6" />
              <span className="text-xs">Tắt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
