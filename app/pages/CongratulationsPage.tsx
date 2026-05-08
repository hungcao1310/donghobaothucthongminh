import { useNavigation } from "../components/SimpleRouter";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export function CongratulationsPage() {
  const { navigate, goBack } = useNavigation();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#d97706']
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0a0a0a] via-amber-900/10 to-[#0a0a0a]">
      <div className="text-7xl sm:text-8xl mb-8 animate-bounce">🌅</div>

      <div className="text-3xl sm:text-4xl text-amber mb-4 text-center">
        Chúc mừng!
      </div>

      <div className="text-lg sm:text-xl text-white/80 mb-12 text-center px-4">
        Bạn đã hoàn thành thử thách
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl px-6 sm:px-8 py-6 mb-12 border border-amber/30">
        <div className="text-5xl sm:text-6xl text-amber text-center tabular-nums">07:00</div>
      </div>

      <button
        onClick={() => navigate("")}
        className="w-full max-w-xs py-4 rounded-xl bg-amber text-black text-lg hover:scale-105 transition-transform"
      >
        Bắt đầu ngày mới ☀️
      </button>

      <button
        onClick={() => navigate(`/snooze/1`)}
        className="mt-4 text-white/60 text-sm"
      >
        Báo lại sau 5 phút
      </button>
    </div>
  );
}
