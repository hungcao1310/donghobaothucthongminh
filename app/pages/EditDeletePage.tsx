import { useNavigation } from "../components/SimpleRouter";
import { ChevronLeft, Trash2, Edit3 } from "lucide-react";
import { useAlarms } from "../contexts/AlarmContext";

export function EditDeletePage() {
  const { navigate, goBack } = useNavigation();
  const { alarms, deleteAlarm } = useAlarms();

  const deleteAll = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả báo thức?")) {
      const allIds = alarms.map(a => a.id);
      allIds.forEach(id => deleteAlarm(id));
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => goBack()} className="text-amber">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl">Chỉnh sửa / Xóa</h2>
        <button onClick={deleteAll} className="text-red-500 text-sm">Xóa tất cả</button>
      </div>

      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center text-white/60 py-12">
            Không có báo thức nào
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-5 py-4 border border-white/10"
            >
              <div className="flex-1">
                <div className="text-3xl text-amber-light mb-1">{alarm.time}</div>
                <div className="text-sm text-white/60">{alarm.label}</div>
                <div className="text-xs text-white/40 mt-1">
                  {alarm.ringtone} • {alarm.volume || 80}%
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/alarm/${alarm.id}`)}
                  className="p-3 rounded-full bg-amber/20 hover:bg-amber/30 transition-colors"
                >
                  <Edit3 className="w-5 h-5 text-amber" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Xóa báo thức "${alarm.label}"?`)) {
                      deleteAlarm(alarm.id);
                    }
                  }}
                  className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
