import { useState, useEffect, useRef, useMemo } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  difficulty: number;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
}

const VI_EASY = [
  "bầu trời màu xanh",
  "hôm nay trời đẹp",
  "chào buổi sáng mới",
  "mặt trời đã mọc",
  "thức dậy đi thôi",
];
const VI_MEDIUM = [
  "bầu trời màu xanh và những đám mây trắng",
  "hôm nay là một ngày mới tuyệt vời",
  "thức dậy và bắt đầu ngày mới nào",
  "mặt trời đã mọc ở phía đông rồi",
  "uống một ly nước và tập thể dục thôi",
];
const VI_HARD = [
  "bầu trời trong xanh và những đám mây trắng bồng bềnh trôi",
  "hôm nay là một ngày mới hãy bắt đầu với năng lượng tích cực",
  "thức dậy sớm và tập thể dục mỗi sáng sẽ giúp bạn khỏe mạnh hơn",
  "mỗi buổi sáng là cơ hội để bắt đầu lại và làm những điều tốt đẹp hơn",
  "không có gì tốt hơn là một giấc ngủ ngon và thức dậy tràn đầy năng lượng",
];

const EN_EASY = [
  "rise and shine",
  "good morning world",
  "wake up now",
  "start your day",
  "open your eyes",
];
const EN_MEDIUM = [
  "rise and shine it is morning",
  "good morning the sun is up",
  "wake up and have a great day",
  "today is going to be amazing",
  "time to get up and get going",
];
const EN_HARD = [
  "rise and shine the early bird catches the worm",
  "good morning sunshine the world says hello to you today",
  "wake up and smell the coffee it is a brand new day",
  "every morning brings new opportunities to be your best self",
  "the secret to a great day starts with waking up with purpose",
];

function pickPhrase(difficulty: number): { text: string; lang: "vi" | "en" } {
  const isVietnamese = Math.random() < 0.5;
  const lang = isVietnamese ? "vi" : "en";

  let pool: string[];
  if (difficulty < 33) {
    pool = isVietnamese ? VI_EASY : EN_EASY;
  } else if (difficulty < 66) {
    pool = isVietnamese ? VI_MEDIUM : EN_MEDIUM;
  } else {
    pool = isVietnamese ? VI_HARD : EN_HARD;
  }

  return { text: pool[Math.floor(Math.random() * pool.length)], lang };
}

export function TypingChallenge({ difficulty, failCount, onSuccess, onFail }: Props) {
  const { text, lang } = useMemo(() => pickPhrase(difficulty), [difficulty]);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (normalize(val) === normalize(text)) {
      onSuccess();
    }
  };

  const handleSubmit = () => {
    if (normalize(input) === normalize(text)) {
      onSuccess();
    } else {
      setShake(true);
      setWrongFlash(true);
      setTimeout(() => { setShake(false); setWrongFlash(false); setInput(""); inputRef.current?.focus(); }, 600);
      onFail();
    }
  };

  // Highlight matching prefix
  const renderHighlight = () => {
    const norm = normalize(input);
    const target = normalize(text);
    let matchLen = 0;
    while (matchLen < norm.length && matchLen < target.length && norm[matchLen] === target[matchLen]) {
      matchLen++;
    }
    // Find actual char position in original text
    const correct = text.slice(0, matchLen);
    const wrong = input.length > matchLen ? input.slice(matchLen) : "";
    const remaining = text.slice(matchLen);

    return (
      <div className="font-mono text-lg leading-relaxed break-words">
        <span className="text-amber">{correct}</span>
        {wrong && <span className="bg-red-500/30 text-red-300">{wrong}</span>}
        <span className="text-white/30">{remaining}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-2">
      <div className="text-5xl mb-3">⌨️</div>
      <p className="text-white/60 text-sm mb-6 text-center">
        Gõ chính xác đoạn văn bản {lang === "vi" ? "tiếng Việt" : "tiếng Anh"} dưới đây
      </p>

      {/* Target text with highlight */}
      <div
        className={`w-full bg-[#1a1a1a] border rounded-2xl px-5 py-4 mb-4 transition-all ${
          wrongFlash ? "border-red-500 bg-red-500/10" : "border-amber/30"
        } ${shake ? "animate-shake" : ""}`}
      >
        {renderHighlight()}
      </div>

      {/* Lang badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full ${lang === "vi" ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300"}`}>
          {lang === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
        </span>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Gõ văn bản vào đây..."
        className={`w-full bg-[#111] border rounded-2xl px-5 py-4 text-white placeholder-white/30 outline-none transition-all text-base
          ${shake ? "animate-shake" : ""}
          ${wrongFlash ? "border-red-500" : "border-white/20 focus:border-amber"}
        `}
      />

      <button
        onClick={handleSubmit}
        disabled={!input.trim()}
        className="mt-4 w-full py-4 rounded-2xl bg-amber text-black font-semibold text-base disabled:opacity-40 active:scale-95 transition-all"
      >
        Xác nhận
      </button>

      <button
        onClick={() => setInput("")}
        className="mt-3 flex items-center gap-1.5 text-white/40 text-sm"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Xóa hết
      </button>

      {failCount > 0 && (
        <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">Sai {failCount} lần — độ khó đã tăng</span>
        </div>
      )}
    </div>
  );
}
