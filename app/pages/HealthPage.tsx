import { useState, useEffect } from "react";
import { useNavigation } from "../components/SimpleRouter";
import { useSleep } from "../contexts/SleepContext";
import { Clock, Timer, History, Activity, Moon, Sun, Thermometer, Droplets, Wind } from "lucide-react";

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  city: string;
}

function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        );
        const data = await res.json();

        const codeToDesc: Record<number, { text: string; icon: string }> = {
          0: { text: "Trời quang", icon: "☀️" },
          1: { text: "Ít mây", icon: "🌤" },
          2: { text: "Nhiều mây", icon: "⛅" },
          3: { text: "U ám", icon: "☁️" },
          45: { text: "Sương mù", icon: "🌫" },
          48: { text: "Sương đá", icon: "🌫" },
          51: { text: "Mưa nhẹ", icon: "🌦" },
          53: { text: "Mưa vừa", icon: "🌦" },
          55: { text: "Mưa nặng hạt", icon: "🌧" },
          61: { text: "Mưa rào nhẹ", icon: "🌦" },
          63: { text: "Mưa rào vừa", icon: "🌧" },
          65: { text: "Mưa rào nặng hạt", icon: "🌧" },
          71: { text: "Tuyết rơi nhẹ", icon: "🌨" },
          73: { text: "Tuyết rơi vừa", icon: "🌨" },
          75: { text: "Tuyết rơi dày", icon: "❄️" },
          80: { text: "Mưa rào", icon: "🌦" },
          81: { text: "Mưa rào vừa", icon: "🌧" },
          82: { text: "Mưa rào dữ dội", icon: "🌧" },
          95: { text: "Giông bão", icon: "⛈" },
          96: { text: "Giông kèm mưa đá", icon: "⛈" },
          99: { text: "Giông kèm mưa đá lớn", icon: "⛈" },
        };

        const code = data.current.weather_code as number;
        const weatherInfo = codeToDesc[code] || { text: "Không xác định", icon: "🌡" };

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          description: weatherInfo.text,
          icon: weatherInfo.icon,
          windSpeed: data.current.wind_speed_10m,
          city: "Vị trí của bạn",
        });
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(21.0285, 105.8542),
        { timeout: 10000 }
      );
    } else {
      fetchWeather(21.0285, 105.8542);
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 animate-pulse">
        <div className="h-4 w-24 bg-white/10 rounded mb-4" />
        <div className="h-12 w-32 bg-white/10 rounded mb-2" />
        <div className="h-4 w-48 bg-white/10 rounded" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10">
        <p className="text-white/50 text-sm text-center">Không thể tải dữ liệu thời tiết</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber/20 to-[#1a1a1a] rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-white/60 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber" />
          Thời tiết
        </h3>
        <span className="text-xs text-white/40">{weather.city}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl mb-1">{weather.icon}</div>
          <div className="text-3xl font-light text-white">{weather.temp}°C</div>
          <div className="text-sm text-white/60 mt-1">{weather.description}</div>
        </div>
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2 justify-end">
            <Thermometer className="w-3.5 h-3.5 text-white/40" />
            <span className="text-sm text-white/60">Cảm giác {weather.feelsLike}°</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Droplets className="w-3.5 h-3.5 text-white/40" />
            <span className="text-sm text-white/60">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Wind className="w-3.5 h-3.5 text-white/40" />
            <span className="text-sm text-white/60">{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SleepChart() {
  const { records, weeklyAverage } = useSleep();

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-white/60 flex items-center gap-2">
          <Moon className="w-4 h-4 text-amber" />
          Thống kê giấc ngủ 7 ngày
        </h3>
        <div className="text-right">
          <div className="text-xs text-white/40">Trung bình</div>
          <div className="text-lg text-amber font-light">{weeklyAverage}h</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between h-32 gap-1.5 px-2">
        {records.map((item, i) => {
          const heightPercent = (item.hours / 10) * 100;
          const color =
            item.hours >= 8 ? "bg-green-500"
            : item.hours >= 7 ? "bg-amber"
            : item.hours >= 6 ? "bg-orange-500"
            : "bg-red-500";

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full flex justify-center" style={{ height: "120px" }}>
                <div
                  className={`w-full max-w-[28px] rounded-t-lg ${color} opacity-80 hover:opacity-100 transition-opacity absolute bottom-0`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white/70 whitespace-nowrap">
                    {item.hours}h
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-white/40">{item.date}</span>
            </div>
          );
        })}
      </div>

      {/* Reference line */}
      <div className="relative mt-2 pt-1">
        <div className="border-t border-dashed border-green-500/30">
          <span className="text-[9px] text-green-500/50 absolute -top-2.5 right-0">Khuyến nghị 7-8h</span>
        </div>
      </div>

      {/* Daily detail list */}
      <div className="mt-6 space-y-2">
        <h4 className="text-xs text-white/40 mb-2">Chi tiết từng ngày</h4>
        {records.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/70 w-8">{r.date}</span>
              <div className="flex items-center gap-1.5">
                <Moon className="w-3 h-3 text-amber/60" />
                <span className="text-xs text-white/60">{r.bedtime}</span>
                <span className="text-xs text-white/30">→</span>
                <Sun className="w-3 h-3 text-amber/60" />
                <span className="text-xs text-white/60">{r.wakeTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-light">{r.hours}h</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                r.quality === "Tốt" ? "bg-green-500/20 text-green-400"
                : r.quality === "Khá" ? "bg-amber/20 text-amber"
                : r.quality === "Trung bình" ? "bg-orange-500/20 text-orange-400"
                : "bg-red-500/20 text-red-400"
              }`}>{r.quality}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Advice card */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber/10 to-transparent border border-amber/20">
        <p className="text-xs text-white/70">
          {weeklyAverage >= 7 && weeklyAverage <= 8
            ? "💪 Bạn đang có giấc ngủ rất tốt! Duy trì thói quen này nhé."
            : weeklyAverage > 8
            ? "😴 Bạn ngủ khá nhiều. Hãy thử điều chỉnh để có lịch trình cân bằng hơn."
            : "⚠️ Bạn đang thiếu ngủ. Cố gắng đi ngủ sớm hơn để có sức khỏe tốt nhất."}
        </p>
      </div>
    </div>
  );
}

function SleepQualityChart() {
  const { records } = useSleep();

  const qualityCount = {
    "Tốt": records.filter((r) => r.quality === "Tốt").length,
    "Khá": records.filter((r) => r.quality === "Khá").length,
    "Trung bình": records.filter((r) => r.quality === "Trung bình").length,
    "Kém": records.filter((r) => r.quality === "Kém").length,
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10">
      <h3 className="text-sm text-white/60 flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-amber" />
        Chất lượng giấc ngủ
      </h3>
      <div className="space-y-3">
        {Object.entries(qualityCount).map(([label, count]) => {
          const percent = (count / records.length) * 100;
          const barColor =
            label === "Tốt" ? "bg-green-500"
            : label === "Khá" ? "bg-amber"
            : label === "Trung bình" ? "bg-orange-500"
            : "bg-red-500";

          return (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">{label}</span>
                <span className="text-white/40">{count} ngày</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HealthPage() {
  const { navigate } = useNavigation();
  const { weeklyAverage } = useSleep();

  return (
    <div className="min-h-screen p-6 pb-24">
      <h1 className="text-3xl text-amber mb-6">Sức khỏe giấc ngủ</h1>

      {/* Weather */}
      <div className="mb-6">
        <WeatherCard />
      </div>

      {/* Sleep Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 text-center">
          <Moon className="w-5 h-5 text-amber mx-auto mb-2" />
          <div className="text-xl text-white font-light">{weeklyAverage}h</div>
          <div className="text-[10px] text-white/40">Trung bình</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 text-center">
          <Sun className="w-5 h-5 text-amber mx-auto mb-2" />
          <div className="text-xl text-white font-light">
            {weeklyAverage >= 7 ? "✅" : "⚠️"}
          </div>
          <div className="text-[10px] text-white/40">
            {weeklyAverage >= 7 ? "Khỏe mạnh" : "Cần cải thiện"}
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 text-center">
          <Activity className="w-5 h-5 text-amber mx-auto mb-2" />
          <div className="text-xl text-white font-light">
            {weeklyAverage >= 7 ? "💪" : "📊"}
          </div>
          <div className="text-[10px] text-white/40">Đánh giá</div>
        </div>
      </div>

      {/* Sleep Chart */}
      <div className="mb-6">
        <SleepChart />
      </div>

      {/* Quality Chart */}
      <div className="mb-6">
        <SleepQualityChart />
      </div>

      {/* Health Tips */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-5 border border-white/10 mb-6">
        <h3 className="text-sm text-white/60 mb-3">💡 Mẹo cải thiện giấc ngủ</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-white/70">
            <span className="text-amber mt-0.5">•</span>
            Đi ngủ và thức dậy đều đặn mỗi ngày, kể cả cuối tuần
          </li>
          <li className="flex items-start gap-2 text-xs text-white/70">
            <span className="text-amber mt-0.5">•</span>
            Tránh dùng điện thoại 30 phút trước khi ngủ
          </li>
          <li className="flex items-start gap-2 text-xs text-white/70">
            <span className="text-amber mt-0.5">•</span>
            Ngủ đủ 7-8 tiếng mỗi đêm để có sức khỏe tốt nhất
          </li>
          <li className="flex items-start gap-2 text-xs text-white/70">
            <span className="text-amber mt-0.5">•</span>
            Phòng ngủ nên tối, yên tĩnh và mát mẻ (18-22°C)
          </li>
        </ul>
      </div>

      {/* Navigation */}
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
          <button onClick={() => navigate("health")} className="flex flex-col items-center gap-1 text-amber">
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

