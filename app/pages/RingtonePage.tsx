import { useNavigation } from "../components/SimpleRouter";
import { ChevronLeft, Play, Check, Upload, Trash2, Pause, Music, Star, Flame, Sparkles } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useAlarmForm } from "../contexts/AlarmFormContext";
import { useRingtone } from "../contexts/RingtoneContext";
import { AudioTrimEditor } from "../components/AudioTrimEditor";

interface BuiltinRingtone {
  id: string;
  name: string;
  category: string;
  // Web Audio API tone pattern descriptor
  pattern: TonePattern;
}

interface TonePattern {
  type: "bell" | "beep" | "melody" | "pulse" | "chirp" | "rise";
  freq: number;
  freq2?: number;
  bpm?: number;
}

const BUILTIN_RINGTONES: BuiltinRingtone[] = [
  // Hot
  { id: "hot-1", name: "Sunrise Symphony", category: "Hot", pattern: { type: "rise", freq: 440, freq2: 1046 } },
  { id: "hot-2", name: "Digital Dream", category: "Hot", pattern: { type: "beep", freq: 880, freq2: 1174, bpm: 150 } },
  { id: "hot-3", name: "Morning Pulse", category: "Hot", pattern: { type: "pulse", freq: 784, bpm: 130 } },
  { id: "hot-4", name: "Sparkle", category: "Hot", pattern: { type: "chirp", freq: 1318, freq2: 1760 } },
  // Cổ điển
  { id: "classic-1", name: "Mặc định", category: "Cổ điển", pattern: { type: "bell", freq: 880 } },
  { id: "classic-2", name: "Điện thoại", category: "Cổ điển", pattern: { type: "beep", freq: 440, freq2: 480, bpm: 120 } },
  { id: "classic-3", name: "Chuông nhà thờ", category: "Cổ điển", pattern: { type: "bell", freq: 330 } },
  // Nhẹ nhàng
  { id: "soft-1", name: "Bình minh", category: "Nhẹ nhàng", pattern: { type: "rise", freq: 440, freq2: 880 } },
  { id: "soft-2", name: "Giai điệu buổi sáng", category: "Nhẹ nhàng", pattern: { type: "melody", freq: 523, freq2: 659 } },
  { id: "soft-3", name: "Lời thì thầm", category: "Nhẹ nhàng", pattern: { type: "rise", freq: 330, freq2: 523 } },
  // Thiên nhiên
  { id: "nature-1", name: "Chim hót", category: "Thiên nhiên", pattern: { type: "chirp", freq: 1200, freq2: 1600 } },
  { id: "nature-2", name: "Suối rừng", category: "Thiên nhiên", pattern: { type: "melody", freq: 660, freq2: 784 } },
  { id: "nature-3", name: "Gió sớm", category: "Thiên nhiên", pattern: { type: "rise", freq: 500, freq2: 750 } },
  // Hiện đại
  { id: "modern-1", name: "Xung nhịp", category: "Hiện đại", pattern: { type: "pulse", freq: 700, bpm: 140 } },
  { id: "modern-2", name: "Điện tử", category: "Hiện đại", pattern: { type: "beep", freq: 800, freq2: 1000, bpm: 160 } },
  { id: "modern-3", name: "Chuyển động", category: "Hiện đại", pattern: { type: "rise", freq: 600, freq2: 1200 } },
];

function playTonePattern(pattern: TonePattern): () => void {
  let stopped = false;
  let ctx: AudioContext | null = null;

  const run = async () => {
    ctx = new AudioContext();
    const { type, freq, freq2, bpm } = pattern;
    const interval = bpm ? 60000 / bpm : 300;

    const playNote = (frequency: number, startTime: number, duration: number, gain = 0.4) => {
      if (!ctx || stopped) return;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = type === "bell" || type === "melody" ? "sine" : "square";
      osc.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };

    const now = ctx.currentTime;

    if (type === "bell") {
      playNote(freq, now, 1.0, 0.5);
      playNote(freq * 1.5, now, 0.6, 0.2);
      if (!stopped) {
        setTimeout(() => { if (!stopped && ctx) { const t = ctx.currentTime; playNote(freq, t, 1.0, 0.5); } }, 1200);
      }
    } else if (type === "beep") {
      const f2 = freq2 ?? freq;
      for (let i = 0; i < 6; i++) {
        const t = now + (i * interval) / 1000;
        playNote(i % 2 === 0 ? freq : f2, t, (interval * 0.6) / 1000, 0.35);
      }
    } else if (type === "melody") {
      const notes = [freq, freq2 ?? freq, freq * 1.25, freq2 ?? freq, freq];
      notes.forEach((f, i) => playNote(f, now + i * 0.18, 0.15, 0.4));
      setTimeout(() => {
        if (!stopped && ctx) {
          const t = ctx.currentTime;
          notes.forEach((f, i) => playNote(f, t + i * 0.18, 0.15, 0.4));
        }
      }, 1100);
    } else if (type === "pulse") {
      for (let i = 0; i < 8; i++) {
        const t = now + (i * interval) / 1000;
        playNote(freq, t, (interval * 0.4) / 1000, 0.3);
      }
    } else if (type === "chirp") {
      const f2 = freq2 ?? freq * 1.3;
      const chirp = (startTime: number) => {
        if (!ctx || stopped) return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.linearRampToValueAtTime(f2, startTime + 0.08);
        gainNode.gain.setValueAtTime(0.35, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
        osc.start(startTime);
        osc.stop(startTime + 0.15);
      };
      chirp(now);
      chirp(now + 0.15);
      chirp(now + 0.3);
      setTimeout(() => { if (!stopped && ctx) { const t = ctx.currentTime; chirp(t); chirp(t + 0.15); chirp(t + 0.3); } }, 900);
    } else if (type === "rise") {
      const f2 = freq2 ?? freq * 2;
      if (ctx) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(f2, now + 0.8);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.1);
        setTimeout(() => {
          if (!stopped && ctx) {
            const t = ctx.currentTime;
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(freq, t);
            osc2.frequency.linearRampToValueAtTime(f2, t + 0.8);
            g2.gain.setValueAtTime(0, t);
            g2.gain.linearRampToValueAtTime(0.4, t + 0.1);
            g2.gain.linearRampToValueAtTime(0.001, t + 1.0);
            osc2.start(t);
            osc2.stop(t + 1.1);
          }
        }, 1200);
      }
    }
  };

  run();

  return () => {
    stopped = true;
    if (ctx) {
      try { ctx.close(); } catch { /* ignore */ }
    }
  };
}

const CATEGORY_ORDER = ["Hot", "Cổ điển", "Nhẹ nhàng", "Thiên nhiên", "Hiện đại"];

export function RingtonePage() {
  const { goBack } = useNavigation();
  const { formState, setFormState } = useAlarmForm();
  const { ringtone: selectedRingtone } = formState;
  const { customRingtones, addCustomRingtone, removeCustomRingtone, setDefaultRingtone, defaultRingtoneId } = useRingtone();

  const setSelectedRingtone = (r: string) => setFormState({ ringtone: r });

  const [selected, setSelected] = useState(selectedRingtone || "Mặc định");
  const [playing, setPlaying] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopToneRef = useRef<(() => void) | null>(null);

  const handleSelect = (name: string) => {
    setSelected(name);
    setSelectedRingtone(name);
  };

  const stopAllPlayback = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    stopToneRef.current?.();
    stopToneRef.current = null;
    setPlaying(null);
  };

  const playBuiltin = (ringtone: BuiltinRingtone, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing === ringtone.id) { stopAllPlayback(); return; }
    stopAllPlayback();
    setPlaying(ringtone.id);
    stopToneRef.current = playTonePattern(ringtone.pattern);
    setTimeout(() => { stopToneRef.current?.(); stopToneRef.current = null; setPlaying(null); }, 3000);
  };

  const playCustom = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing === id) { stopAllPlayback(); return; }
    stopAllPlayback();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(null);
    setPlaying(id);
  };

  const processFile = useCallback((file: File) => {
    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const validExts = ["mp3", "wav", "m4a", "ogg", "aac", "flac", "opus"];
    if (!validExts.includes(ext)) {
      setError("Định dạng không hỗ trợ. Vui lòng chọn: MP3, WAV, M4A, OGG, AAC");
      setUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(`File quá lớn: ${(file.size / 1024 / 1024).toFixed(1)}MB. Tối đa 5MB`);
      setUploading(false);
      return;
    }

    // Open trim editor
    setUploading(false);
    setEditingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSaveTrimmed = useCallback((blob: Blob, fadeIn: number, fadeOut: number) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) { setError("Không thể đọc file. Thử lại"); return; }

      const name = editingFile?.name.replace(/\.[^/.]+$/, "") || "Nhạc mới";
      const audio = new Audio(dataUrl);

      audio.onloadedmetadata = () => {
        const ringtone = {
          id: Date.now().toString(),
          name,
          url: dataUrl,
          duration: Math.round(audio.duration),
          fadeIn,
          fadeOut
        };
        addCustomRingtone(ringtone);
        handleSelect(name);
        setEditingFile(null);
      };

      audio.onerror = () => {
        const ringtone = {
          id: Date.now().toString(),
          name,
          url: dataUrl,
          duration: 0,
          fadeIn,
          fadeOut
        };
        addCustomRingtone(ringtone);
        handleSelect(name);
        setEditingFile(null);
      };

      audio.load();
    };
    reader.onerror = () => { setError("Không thể đọc file. Thử lại"); setEditingFile(null); };
    reader.readAsDataURL(blob);
  }, [editingFile, addCustomRingtone]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const categories = CATEGORY_ORDER.map((cat) => ({
    name: cat,
    items: BUILTIN_RINGTONES.filter((r) => r.category === cat),
  }));

  return (
    <div className="min-h-screen pb-10">
      {/* Trim Editor Modal */}
      {editingFile && (
        <AudioTrimEditor
          audioFile={editingFile}
          onSave={handleSaveTrimmed}
          onCancel={() => setEditingFile(null)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/10">
        <button onClick={goBack} className="text-amber p-1 -ml-1">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">Nhạc chuông</h2>
        <button
          onClick={goBack}
          className="text-amber font-medium text-sm px-3 py-1.5 rounded-lg bg-amber/10"
        >
          Xong
        </button>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* Upload zone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.ogg,.aac,.flac,.opus,audio/*"
            onChange={handleFileInput}
            style={{ display: "none" }}
            id="ringtone-file-input"
          />
          <label
            htmlFor="ringtone-file-input"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 w-full py-7 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none
              ${dragOver ? "border-amber bg-amber/20" : "border-amber/40 bg-amber/5 hover:bg-amber/10 hover:border-amber/60"}
              ${uploading ? "opacity-60 pointer-events-none" : ""}
            `}
          >
            <div className="w-12 h-12 rounded-full bg-amber/15 flex items-center justify-center">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-amber" />
              )}
            </div>
            <div className="text-center">
              <p className="text-amber font-medium text-sm">
                {uploading ? "Đang tải lên..." : dragOver ? "Thả file vào đây" : "Tải nhạc chuông của bạn"}
              </p>
              <p className="text-white/40 text-xs mt-1">MP3, WAV, M4A, OGG · Tối đa 30 giây · 5MB</p>
            </div>
          </label>

          {error && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Custom ringtones */}
        {customRingtones.length > 0 && (
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-3 px-1">Nhạc của tôi</p>
            <div className="space-y-2">
              {customRingtones.map((rt) => (
                <RingtoneRow
                  key={rt.id}
                  label={rt.name}
                  sublabel={rt.duration > 0 ? `${rt.duration}s` : undefined}
                  isSelected={selected === rt.name}
                  isPlaying={playing === rt.id}
                  isDefault={defaultRingtoneId === rt.id}
                  onSelect={() => handleSelect(rt.name)}
                  onPlay={(e) => playCustom(rt.id, rt.url, e)}
                  onSetDefault={(e) => {
                    e.stopPropagation();
                    setDefaultRingtone(rt.id);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    if (playing === rt.id) stopAllPlayback();
                    removeCustomRingtone(rt.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Built-in ringtones by category */}
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center gap-2 mb-3 px-1">
              {cat.name === "Hot" && <Flame className="w-4 h-4 text-orange-500" />}
              <p className="text-xs text-white/50 uppercase tracking-wider">{cat.name}</p>
              {cat.name === "Hot" && <Sparkles className="w-3 h-3 text-amber" />}
            </div>
            <div className="space-y-2">
              {cat.items.map((rt) => (
                <RingtoneRow
                  key={rt.id}
                  label={rt.name}
                  isSelected={selected === rt.name}
                  isPlaying={playing === rt.id}
                  onSelect={() => handleSelect(rt.name)}
                  onPlay={(e) => playBuiltin(rt, e)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RingtoneRowProps {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  isPlaying: boolean;
  isDefault?: boolean;
  onSelect: () => void;
  onPlay: (e: React.MouseEvent) => void;
  onSetDefault?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

function RingtoneRow({ label, sublabel, isSelected, isPlaying, isDefault, onSelect, onPlay, onSetDefault, onDelete }: RingtoneRowProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer
        ${isSelected ? "border-amber bg-amber/8" : "border-white/8 bg-[#141414] hover:border-white/15"}
      `}
    >
      {/* Selection indicator */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${isSelected ? "border-amber bg-amber" : "border-white/25"}
      `}>
        {isSelected && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${isSelected ? "text-amber" : "text-white"}`}>
            {label}
          </span>
          {isDefault && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber/15 text-amber text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">
              Mặc định
            </span>
          )}
        </div>
        {sublabel && <span className="text-xs text-white/35">{sublabel}</span>}
      </div>

      {/* Waveform animation when playing */}
      {isPlaying && (
        <div className="flex items-end gap-0.5 h-4 mr-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-0.5 bg-amber rounded-full"
              style={{
                animation: `waveBar 0.6s ease-in-out infinite`,
                animationDelay: `${i * 0.12}s`,
                height: "60%",
              }}
            />
          ))}
        </div>
      )}

      {/* Default star button (custom only) */}
      {onSetDefault && (
        <button
          onClick={onSetDefault}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0
            ${isDefault ? "bg-amber/20 text-amber" : "bg-white/8 hover:bg-white/15 text-white/40"}
          `}
        >
          <Star className={`w-4 h-4 ${isDefault ? "fill-amber" : ""}`} />
        </button>
      )}

      {/* Play button */}
      <button
        onClick={onPlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0
          ${isPlaying ? "bg-amber text-black" : "bg-white/8 hover:bg-white/15"}
        `}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Delete button (custom only) */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/15 hover:bg-red-500/25 transition-all flex-shrink-0"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      )}
    </div>
  );
}
