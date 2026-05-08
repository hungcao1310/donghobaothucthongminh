import { useNavigation } from "../components/SimpleRouter";
import { ChevronLeft, Brain, Zap, TrendingUp, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import { useAlarmForm, ChallengeType } from "../contexts/AlarmFormContext";

export function SmartModeSettingsPage() {
  const { navigate, goBack } = useNavigation();
  const { formState, setFormState } = useAlarmForm();

  const [challengeType, setChallengeType] = useState<ChallengeType>(formState.challengeType || "math");
  const [baseDifficulty, setBaseDifficulty] = useState(formState.difficulty || 33);
  const [autoIncrease, setAutoIncrease] = useState(formState.autoIncreaseDifficulty ?? true);
  const [increaseRate, setIncreaseRate] = useState(15);
  const [vibration, setVibration] = useState(true);
  const [soundIntensity, setSoundIntensity] = useState(formState.volume || 70);

  useEffect(() => {
    setFormState({ difficulty: baseDifficulty });
  }, [baseDifficulty, setFormState]);

  const challenges = [
    {
      id: "math" as ChallengeType,
      icon: "🧮",
      name: "Toán học",
      desc: "Giải phép tính để tắt chuông",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30"
    },
    {
      id: "typing" as ChallengeType,
      icon: "⌨️",
      name: "Gõ văn bản",
      desc: "Gõ chính xác câu Việt/Anh ngẫu nhiên",
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    },
    {
      id: "pattern" as ChallengeType,
      icon: "🧩",
      name: "Nhớ mẫu",
      desc: "Ghi nhớ và lặp lại chuỗi màu",
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    },
    {
      id: "shake" as ChallengeType,
      icon: "📱",
      name: "Lắc điện thoại",
      desc: "Lắc liên tục đến khi báo thức tắt",
      color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    },
    {
      id: "walk" as ChallengeType,
      icon: "🚶",
      name: "Đi bộ",
      desc: "Phải đi đủ 100 bước mới tắt",
      color: "from-red-500/20 to-rose-500/20 border-red-500/30",
    },
    {
      id: "qr" as ChallengeType,
      icon: "📷",
      name: "Quét QR",
      desc: "Quét mã QR đặt xa giường ngủ",
      color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
    },
  ];

  const getDifficultyLabel = () => {
    if (baseDifficulty < 33) return "Dễ";
    if (baseDifficulty < 66) return "Trung bình";
    return "Khó";
  };

  const getIncreaseRateLabel = () => {
    if (increaseRate <= 10) return "Nhẹ nhàng";
    if (increaseRate <= 15) return "Vừa phải";
    if (increaseRate <= 25) return "Mạnh";
    return "Cực mạnh";
  };

  const handleSave = () => {
    setFormState({
      smartMode: true,
      difficulty: baseDifficulty,
      challengeType,
      autoIncreaseDifficulty: autoIncrease,
      volume: soundIntensity,
    });
    goBack();
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={goBack} className="text-amber">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl">Chế độ thông minh</h2>
        <button onClick={handleSave} className="text-amber font-medium">Xong</button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-2xl text-amber mb-2">Báo thức thông minh</h1>
        <p className="text-white/60 text-sm">Buộc bạn phải tỉnh táo để tắt chuông</p>
      </div>

      {/* Challenge Types */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-amber" />
          <h3 className="font-medium">Chọn loại thử thách</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {challenges.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => { setChallengeType(challenge.id); setFormState({ challengeType: challenge.id }); }}
              className={`relative p-4 rounded-xl border transition-all active:scale-95 ${
                challengeType === challenge.id
                  ? `bg-gradient-to-br ${challenge.color} scale-105`
                  : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-3xl mb-2">{challenge.icon}</div>
              <div className="text-sm font-medium mb-1">{challenge.name}</div>
              <div className="text-xs text-white/60">{challenge.desc}</div>
              {challengeType === challenge.id && (
                <div className="absolute top-2 right-2">
                  <Zap className="w-4 h-4 text-amber" fill="currentColor" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Base Difficulty */}
      <div className="bg-[#1a1a1a] rounded-xl p-5 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber" />
            <span className="font-medium">Độ khó ban đầu</span>
          </div>
          <span className="text-amber font-medium">{getDifficultyLabel()}</span>
        </div>

        <Slider.Root
          value={[baseDifficulty]}
          onValueChange={([value]) => setBaseDifficulty(value)}
          max={100}
          step={1}
          className="relative flex items-center w-full h-8 mb-3"
        >
          <Slider.Track className="relative h-2 grow rounded-full bg-white/20">
            <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />
          </Slider.Track>
          <Slider.Thumb className="block w-6 h-6 bg-amber rounded-full shadow-lg shadow-amber/50 hover:scale-110 transition-transform border-2 border-[#0a0a0a]" />
        </Slider.Root>

        <div className="flex justify-between text-xs text-white/40">
          <span>Dễ</span>
          <span>Trung bình</span>
          <span>Khó</span>
        </div>
      </div>

      {/* Auto Increase */}
      <div className="bg-[#1a1a1a] rounded-xl p-5 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-medium mb-1">Tự động tăng độ khó</div>
            <div className="text-sm text-white/60">Mỗi lần sai sẽ khó hơn</div>
          </div>
          <Switch.Root
            checked={autoIncrease}
            onCheckedChange={setAutoIncrease}
            className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative"
          >
            <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
          </Switch.Root>
        </div>

        {autoIncrease && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Tốc độ tăng</span>
              <span className="text-sm text-amber">{getIncreaseRateLabel()}</span>
            </div>
            <Slider.Root
              value={[increaseRate]}
              onValueChange={([value]) => setIncreaseRate(value)}
              min={5}
              max={30}
              step={5}
              className="relative flex items-center w-full h-8"
            >
              <Slider.Track className="relative h-2 grow rounded-full bg-white/20">
                <Slider.Range className="absolute h-full rounded-full bg-amber" />
              </Slider.Track>
              <Slider.Thumb className="block w-6 h-6 bg-amber rounded-full shadow-lg hover:scale-110 transition-transform" />
            </Slider.Root>
            <div className="flex justify-between text-xs text-white/40 mt-2">
              <span>+5%/lần</span>
              <span>+{increaseRate}%/lần</span>
              <span>+30%/lần</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Settings */}
      <div className="space-y-3 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-amber" />
            <div>
              <div className="text-sm font-medium">Rung mạnh</div>
              <div className="text-xs text-white/60">Khi báo thức kêu</div>
            </div>
          </div>
          <Switch.Root
            checked={vibration}
            onCheckedChange={setVibration}
            className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative"
          >
            <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
          </Switch.Root>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Âm lượng báo thức</div>
            <div className="text-sm text-amber">{soundIntensity}%</div>
          </div>
          <Slider.Root
            value={[soundIntensity]}
            onValueChange={([value]) => setSoundIntensity(value)}
            max={100}
            step={10}
            className="relative flex items-center w-full h-8"
          >
            <Slider.Track className="relative h-2 grow rounded-full bg-white/20">
              <Slider.Range className="absolute h-full rounded-full bg-amber" />
            </Slider.Track>
            <Slider.Thumb className="block w-6 h-6 bg-amber rounded-full shadow-lg hover:scale-110 transition-transform" />
          </Slider.Root>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="text-sm font-medium text-red-400 mb-1">Lưu ý quan trọng</div>
            <ul className="text-xs text-white/80 space-y-1">
              <li>• Báo thức sẽ kêu liên tục cho đến khi giải đúng</li>
              <li>• Không thể tắt hoặc thoát ra giữa chừng</li>
              <li>• Mỗi lần sai, độ khó tăng lên {increaseRate}%</li>
              <li>• Phù hợp cho người khó dậy buổi sáng</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="text-center">
          <div className="text-xs text-amber/80 mb-2">VÍ DỤ THỰC TẾ</div>
          <div className="text-2xl text-amber mb-3">
            {baseDifficulty < 33 ? "5 + 8 = ?" : baseDifficulty < 66 ? "12 × 7 = ?" : "15 × 4 - 23 = ?"}
          </div>
          <div className="text-xs text-white/60">
            Độ khó: {getDifficultyLabel()} → {autoIncrease ? `${getDifficultyLabel()} +${increaseRate}%` : "Không đổi"}
          </div>
        </div>
      </div>
    </div>
  );
}
