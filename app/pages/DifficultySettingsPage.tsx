import { useNavigation } from "../components/SimpleRouter";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useAlarmForm } from "../contexts/AlarmFormContext";

export function DifficultySettingsPage() {
  const { navigate, goBack } = useNavigation();
  const { formState, setFormState } = useAlarmForm();
  const [difficulty, setDifficulty] = useState(formState.difficulty);

  useEffect(() => {
    setFormState({ difficulty });
  }, [difficulty, setFormState]);

  const getExample = () => {
    if (difficulty < 33) {
      return "Ví dụ: 5 + 3 = ?";
    } else if (difficulty < 66) {
      return "Ví dụ: 12 × 4 = ?";
    } else {
      return "Ví dụ: 125 ÷ 5 + 18 = ?";
    }
  };

  const getDifficultyLabel = () => {
    if (difficulty < 33) return "Dễ";
    if (difficulty < 66) return "Trung bình";
    return "Khó";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => goBack()} className="text-amber">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl">Cài đặt độ khó</h2>
        <button onClick={() => goBack()} className="text-amber">Xong</button>
      </div>

      <div className="max-w-sm mx-auto mt-16">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🧮</div>
          <div className="text-2xl text-amber mb-2">{getDifficultyLabel()}</div>
          <div className="text-white/60">Cộng trừ đơn giản</div>
        </div>

        <div className="mb-12">
          <Slider.Root
            value={[difficulty]}
            onValueChange={([value]) => setDifficulty(value)}
            max={100}
            step={1}
            className="relative flex items-center w-full h-8"
          >
            <Slider.Track className="relative h-2 grow rounded-full bg-white/20">
              <Slider.Range className="absolute h-full rounded-full bg-amber" />
            </Slider.Track>
            <Slider.Thumb className="block w-6 h-6 bg-amber rounded-full shadow-lg shadow-amber/50 hover:scale-110 transition-transform" />
          </Slider.Root>

          <div className="flex justify-between text-sm text-white/60 mt-3">
            <span>Dễ</span>
            <span>Trung bình</span>
            <span>Khó</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-amber/20 text-center">
          <div className="text-white/60 text-sm mb-4">Ví dụ phép tính</div>
          <div className="text-3xl text-amber">{getExample()}</div>
        </div>

        <div className="mt-8 text-center text-sm text-white/60">
          <p className="mb-2">• Dễ: Phép cộng, trừ đơn giản</p>
          <p className="mb-2">• Trung bình: Phép nhân, chia</p>
          <p>• Khó: Phép tính kết hợp phức tạp</p>
        </div>
      </div>
    </div>
  );
}
