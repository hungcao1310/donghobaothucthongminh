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
  const [vibration, setVibration] = useState(true);
  const [soundIntensity, setSoundIntensity] = useState(formState.volume || 70);

  useEffect(() => {
    setFormState({ difficulty: baseDifficulty });
  }, [baseDifficulty, setFormState]);

  const challenges = [
    { id: "math" as ChallengeType, icon: "🧮", name: "Toán học", desc: "Giải phép tính để tắt chuông", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30" },
    { id: "typing" as ChallengeType, icon: "⌨️", name: "Gõ văn bản", desc: "Gõ chính xác câu Việt/Anh ngẫu nhiên", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
    { id: "pattern" as ChallengeType, icon: "🧩", name: "Nhớ mẫu", desc: "Ghi nhớ và lặp lại chuỗi màu", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },

  ];

  const getDifficultyLabel = () => {
    if (baseDifficulty < 33) return "Dễ";
    if (baseDifficulty < 66) return "Trung bình";
    return "Khó";
  };

  const handleSave = () => {
    setFormState({ smartMode: true, difficulty: baseDifficulty, challengeType, volume: soundIntensity });
    goBack();
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={goBack} className="text-amber"><ChevronLeft className="w-6 h-6" /></button>
        <h2 className="text-xl">Chế độ thông minh</h2>
        <button onClick={handleSave} className="text-amber font-medium">Xong</button>
      </div>
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-2xl text-amber mb-2">Báo thức thông minh</h1>
        <p className="text-white/60 text-sm">Buộc bạn phải tỉnh táo để tắt chuông</p>
      </div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-amber" />
          <h3 className="font-medium">Chọn loại thử thách</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {challenges.map((ch) => (
            <button key={ch.id} onClick={() => { setChallengeType(ch.id); setFormState({ challengeType: ch.id }); }}
              className={`relative p-4 rounded-xl border transition-all active:scale-95 ${
                challengeType === ch.id ? 'bg-gradient-to-br ' + ch.color + ' scale-105' : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'
              }`}>
              <div className="text-3xl mb-2">{ch.icon}</div>
              <div className="text-sm font-medium mb-1">{ch.name}</div>
              <div className="text-xs text-white/60">{ch.desc}</div>
              {challengeType === ch.id && <div className="absolute top-2 right-2"><Zap className="w-4 h-4 text-amber" fill="currentColor" /></div>}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-[#1a1a1a] rounded-xl p-5 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber" /><span className="font-medium">Độ khó ban đầu</span></div>
          <span className="text-amber font-medium">{getDifficultyLabel()}</span>
        </div>
        <Slider.Root value={[baseDifficulty]} onValueChange={([v]) => setBaseDifficulty(v)} max={100} step={1} className="relative flex items-center w-full h-8 mb-3">
          <Slider.Track className="relative h-2 grow rounded-full bg-white/20">
            <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />
          </Slider.Track>
          <Slider.Thumb className="block w-6 h-6 bg-amber rounded-full shadow-lg shadow-amber/50 hover:scale-110 transition-transform border-2 border-[#0a0a0a]" />
        </Slider.Root>
        <div className="flex justify-between text-xs text-white/40"><span>Dễ</span><span>Trung bình</span><span>Khó</span></div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3"><Volume2 className="w-5 h-5 text-amber" /><div><div className="text-sm font-medium">Rung mạnh</div><div className="text-xs text-white/60">Khi báo thức kêu</div></div></div>
          <Switch.Root checked={vibration} onCheckedChange={setVibration} className="w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative">
            <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7" />
          </Switch.Root>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-medium">Âm lượng báo thức</div><div className="text-sm text-amber">{soundIntensity}%</div></div>
          <Slider.Root value={[soundIntensity]} onValueChange={([v]) => setSoundIntensity(v)} max={100} step={10} className="relative flex items-center w-full h-8">
            <Slider.Track className="relative h-2 grow rounded-full bg-white/20"><Slider.Range className="absolute h-full rounded-full bg-amber" /></Slider.Track>
            <Slider.Thumb className="block w-6 h-6 bg-amber rounded-full shadow-lg hover:scale-110 transition-transform" />
          </Slider.Root>
        </div>
      </div>
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
        <div className="flex gap-3"><div className="text-2xl">⚠️</div><div><div className="text-sm font-medium text-red-400 mb-1">Lưu ý quan trọng</div><ul className="text-xs text-white/80 space-y-1"><li>• Báo thức sẽ kêu liên tục cho đến khi giải đúng</li><li>• Không thể tắt hoặc thoát ra giữa chừng</li><li>• Phù hợp cho người khó dậy buổi sáng</li></ul></div></div>
      </div>
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="text-center"><div className="text-xs text-amber/80 mb-2">VÍ DỤ THỰC TẾ</div>
          <div className="text-2xl text-amber mb-3">{baseDifficulty < 33 ? "5 + 8 = ?" : baseDifficulty < 66 ? "12 x 7 = ?" : "15 x 4 - 23 = ?"}</div>
          <div className="text-xs text-white/60">Độ khó: {getDifficultyLabel()}</div>
        </div>
      </div>
    </div>
  );
}
