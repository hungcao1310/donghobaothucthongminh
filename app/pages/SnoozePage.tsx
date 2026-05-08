import { useNavigation, useParams } from "../components/SimpleRouter";
import { useState, useEffect } from "react";

export function SnoozePage() {
  const { navigate, goBack } = useNavigation();
  const { id } = useParams();
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          navigate(`/alarm/${id}`);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, id]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
      <div className="text-white/40 text-sm mb-8">Báo lại sau</div>

      <div className="text-6xl sm:text-7xl md:text-8xl font-light text-amber mb-4 tabular-nums">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>

      <div className="text-white/60 mb-16 text-center px-4">Chuông sẽ reo lại lúc 07:05</div>

      <div className="w-full max-w-sm space-y-4">
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
          <div className="text-2xl sm:text-3xl text-amber-light mb-2 tabular-nums">07:00</div>
          <div className="text-sm text-white/60">Báo thức buổi sáng</div>
        </div>

        <button
          onClick={() => navigate("")}
          className="w-full py-4 rounded-xl bg-amber/10 border border-amber/30 text-amber hover:bg-amber/20 transition-colors"
        >
          Tắt luôn
        </button>
      </div>

      <div className="mt-12 text-center text-sm text-white/40">
        <p>Nhấn để tắt báo thức hoàn toàn</p>
        <p className="mt-2">hoặc đợi để chuông reo lại</p>
      </div>
    </div>
  );
}
