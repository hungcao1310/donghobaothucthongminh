import { useState, useRef, useCallback, useMemo } from "react";
import { X, Play, Pause, Check, Upload, Trash2, Star, Search, Flame, Sparkles, Volume2 } from "lucide-react";
import { useRingtone } from "../contexts/RingtoneContext";
import { AudioTrimEditor } from "./AudioTrimEditor";

type PlayFn = (ctx: AudioContext, now: number, stopped: () => boolean) => void;

interface BuiltinRingtone {
  id: string;
  name: string;
  category: string;
  play: PlayFn;
}

// Helpers
function note(ctx: AudioContext, freq: number, start: number, dur: number, gain = 0.4, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = type; osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start); osc.stop(start + dur + 0.05);
}

function sweep(ctx: AudioContext, f1: number, f2: number, start: number, dur: number, gain = 0.38, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = type; osc.frequency.setValueAtTime(f1, start);
  osc.frequency.linearRampToValueAtTime(f2, start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.05);
  g.gain.linearRampToValueAtTime(0.001, start + dur);
  osc.start(start); osc.stop(start + dur + 0.05);
}

const BUILTIN_RINGTONES: BuiltinRingtone[] = [
  // ─── HOT ───
  {
    id: "hot-1", name: "Sunrise Symphony", category: "Hot",
    play: (ctx, now) => {
      // Chord arpeggio: C4–E4–G4–C5, repeats
      const chord = [261.6, 329.6, 392, 523.3];
      chord.forEach((f, i) => note(ctx, f, now + i * 0.13, 0.55, 0.32));
      chord.forEach((f, i) => note(ctx, f * 1.5, now + 0.6 + i * 0.13, 0.55, 0.28));
      chord.forEach((f, i) => note(ctx, f, now + 1.2 + i * 0.13, 0.55, 0.32));
    }
  },
  {
    id: "hot-2", name: "Digital Dream", category: "Hot",
    play: (ctx, now) => {
      // Fast alternating square wave + sub bass hit
      for (let i = 0; i < 10; i++) {
        const t = now + i * 0.12;
        note(ctx, i % 2 === 0 ? 1174 : 880, t, 0.08, 0.28, "square");
      }
      // Sub bass kick on beats 0, 0.48
      [0, 0.48, 0.96].forEach(offset => {
        sweep(ctx, 120, 40, now + offset, 0.2, 0.5, "sine");
      });
    }
  },
  {
    id: "hot-3", name: "Morning Pulse", category: "Hot",
    play: (ctx, now) => {
      // Tribal pulse: strong accent + 3 soft offbeats
      const pattern = [1, 0.25, 0.5, 0.25, 1, 0.25, 0.5, 0.25];
      pattern.forEach((vol, i) => {
        note(ctx, vol === 1 ? 784 : 523, now + i * 0.18, 0.12, vol * 0.4, "triangle");
      });
      pattern.forEach((vol, i) => {
        note(ctx, vol === 1 ? 784 : 523, now + 1.5 + i * 0.18, 0.12, vol * 0.4, "triangle");
      });
    }
  },
  {
    id: "hot-4", name: "Sparkle", category: "Hot",
    play: (ctx, now) => {
      // Starburst: rapid upward chirps at different pitches
      const freqs = [1318, 1568, 1760, 2093, 1760, 1568];
      freqs.forEach((f, i) => sweep(ctx, f, f * 1.4, now + i * 0.09, 0.07, 0.3));
      freqs.forEach((f, i) => sweep(ctx, f * 0.8, f * 1.2, now + 0.7 + i * 0.09, 0.07, 0.25));
    }
  },

  // ─── CỔ ĐIỂN ───
  {
    id: "classic-1", name: "Mặc định", category: "Cổ điển",
    play: (ctx, now) => {
      // Classic bell with harmonics — strikes twice
      const bell = (t: number) => {
        note(ctx, 880, t, 1.2, 0.5);
        note(ctx, 880 * 2.76, t, 0.7, 0.18); // inharmonic partial
        note(ctx, 880 * 5.4, t, 0.4, 0.08);
      };
      bell(now); bell(now + 1.4);
    }
  },
  {
    id: "classic-2", name: "Điện thoại", category: "Cổ điển",
    play: (ctx, now) => {
      // Old telephone: two short rings separated by pause
      const ring = (start: number) => {
        for (let i = 0; i < 8; i++) {
          note(ctx, i % 2 === 0 ? 440 : 480, start + i * 0.05, 0.04, 0.4, "square");
        }
      };
      ring(now); ring(now + 0.8);
    }
  },
  {
    id: "classic-3", name: "Chuông nhà thờ", category: "Cổ điển",
    play: (ctx, now) => {
      // Deep slow bell, strikes 3 times with decay
      [0, 1.2, 2.4].forEach((offset, i) => {
        note(ctx, 220 / (i === 2 ? 1.5 : 1), now + offset, 1.8, 0.55 - i * 0.08);
        note(ctx, 330, now + offset, 1.0, 0.15);
      });
    }
  },

  // ─── NHẸ NHÀNG ───
  {
    id: "soft-1", name: "Bình minh", category: "Nhẹ nhàng",
    play: (ctx, now) => {
      // Very gentle, slow ascending sine glide × 2
      sweep(ctx, 330, 660, now, 1.4, 0.3);
      note(ctx, 440, now + 0.5, 0.8, 0.18);
      sweep(ctx, 330, 660, now + 1.6, 1.4, 0.3);
    }
  },
  {
    id: "soft-2", name: "Giai điệu buổi sáng", category: "Nhẹ nhàng",
    play: (ctx, now) => {
      // Pentatonic scale: C D E G A C'
      const scale = [523.3, 587.3, 659.3, 784, 880, 1046.5];
      scale.forEach((f, i) => note(ctx, f, now + i * 0.2, 0.3, 0.35));
      // Echo
      scale.slice(0, 4).forEach((f, i) => note(ctx, f, now + 1.3 + i * 0.2, 0.3, 0.2));
    }
  },
  {
    id: "soft-3", name: "Lời thì thầm", category: "Nhẹ nhàng",
    play: (ctx, now) => {
      // Barely audible whisper: very soft sawtooth with tremolo-like pulsing
      for (let i = 0; i < 6; i++) {
        note(ctx, 370 + i * 15, now + i * 0.22, 0.35, 0.12, "sine");
      }
      for (let i = 0; i < 4; i++) {
        note(ctx, 440 - i * 20, now + 1.4 + i * 0.22, 0.35, 0.1, "sine");
      }
    }
  },

  // ─── THIÊN NHIÊN ───
  {
    id: "nature-1", name: "Chim hót", category: "Thiên nhiên",
    play: (ctx, now) => {
      // Two-note bird call: quick up-down sweep, repeated 4 times
      const tweet = (t: number) => {
        sweep(ctx, 1800, 2400, t, 0.06, 0.28);
        sweep(ctx, 2400, 1600, t + 0.07, 0.06, 0.22);
      };
      [0, 0.22, 0.9, 1.12].forEach(o => tweet(now + o));
    }
  },
  {
    id: "nature-2", name: "Suối rừng", category: "Thiên nhiên",
    play: (ctx, now) => {
      // Irregular bubbling: random-ish high-freq short notes
      const drops = [1200, 900, 1400, 750, 1100, 1600, 850, 1300];
      const times  = [0, 0.1, 0.18, 0.31, 0.42, 0.5, 0.65, 0.78];
      drops.forEach((f, i) => note(ctx, f, now + times[i], 0.09, 0.2, "sine"));
      drops.forEach((f, i) => note(ctx, f * 0.9, now + 1.0 + times[i], 0.09, 0.18, "sine"));
    }
  },
  {
    id: "nature-3", name: "Gió sớm", category: "Thiên nhiên",
    play: (ctx, now) => {
      // Wind chime: 5 notes, triangle wave, long decay
      const chime = [1046.5, 1174.7, 1318.5, 1568, 1760];
      chime.forEach((f, i) => note(ctx, f, now + i * 0.28, 1.2, 0.22, "triangle"));
    }
  },

  // ─── HIỆN ĐẠI ───
  {
    id: "modern-1", name: "Xung nhịp", category: "Hiện đại",
    play: (ctx, now) => {
      // 8-bit game: fast square arpeggio on I–III–V–VIII
      const arp = [261.6, 329.6, 392, 523.3, 659.3, 784, 1046.5, 784];
      arp.forEach((f, i) => note(ctx, f, now + i * 0.08, 0.07, 0.3, "square"));
      arp.forEach((f, i) => note(ctx, f, now + 0.7 + i * 0.08, 0.07, 0.28, "square"));
    }
  },
  {
    id: "modern-2", name: "Điện tử", category: "Hiện đại",
    play: (ctx, now) => {
      // Techno: steady 4-on-the-floor kick sweep + high hat click
      [0, 0.25, 0.5, 0.75, 1.0, 1.25].forEach(t => {
        sweep(ctx, 180, 50, now + t, 0.18, 0.45, "sine");
        note(ctx, 8000, now + t + 0.12, 0.04, 0.12, "square"); // hi-hat
      });
    }
  },
  {
    id: "modern-3", name: "Chuyển động", category: "Hiện đại",
    play: (ctx, now) => {
      // Synth sweep down then arpeggio burst
      sweep(ctx, 1200, 300, now, 0.6, 0.4, "sawtooth");
      const burst = [400, 500, 600, 800, 1000, 1200];
      burst.forEach((f, i) => note(ctx, f, now + 0.7 + i * 0.07, 0.1, 0.3, "sawtooth"));
    }
  },
];

const CATEGORY_ORDER = ["Hot", "Cổ điển", "Nhẹ nhàng", "Thiên nhiên", "Hiện đại"];

function playBuiltinRingtone(ringtone: BuiltinRingtone): () => void {
  let stopped = false;
  let ctx: AudioContext | null = null;
  ctx = new AudioContext();
  const now = ctx.currentTime;
  ringtone.play(ctx, now, () => stopped);
  return () => {
    stopped = true;
    try { ctx?.close(); } catch { /* ignore */ }
  };
}

interface RingtoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRingtone: string;
  onSelect: (name: string) => void;
  onSelectId?: (id: number | null) => void;
  ringtoneId?: number | null;
}

export function RingtoneModal({ isOpen, onClose, selectedRingtone, onSelect, onSelectId }: RingtoneModalProps) {
  const { customRingtones, addCustomRingtone, removeCustomRingtone, setDefaultRingtone, defaultRingtoneId, ringtoneList, getRingtoneNameById } = useRingtone();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [playing, setPlaying] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopToneRef = useRef<(() => void) | null>(null);

  const stopAllPlayback = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    stopToneRef.current?.();
    stopToneRef.current = null;
    setPlaying(null);
  };

  const handleSelect = (name: string) => {
    onSelect(name);
    stopAllPlayback();
    onClose();
  };

  const playBuiltin = (ringtone: BuiltinRingtone, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing === ringtone.id) { stopAllPlayback(); return; }
    stopAllPlayback();
    setPlaying(ringtone.id);
    stopToneRef.current = playBuiltinRingtone(ringtone);
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

  // Filter and search
  const filteredBuiltinRingtones = useMemo(() => {
    let filtered = BUILTIN_RINGTONES;

    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const filteredCustomRingtones = useMemo(() => {
    if (!searchQuery) return customRingtones;
    const query = searchQuery.toLowerCase();
    return customRingtones.filter(r => r.name.toLowerCase().includes(query));
  }, [customRingtones, searchQuery]);

  const categories = ["Tất cả", ...CATEGORY_ORDER];

  if (!isOpen) return null;

  return (
    <>
      {/* Trim Editor Modal */}
      {editingFile && (
        <AudioTrimEditor
          audioFile={editingFile}
          onSave={handleSaveTrimmed}
          onCancel={() => setEditingFile(null)}
        />
      )}

      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-[#0a0a0a] w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[90vh] flex flex-col border border-white/10">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold">Chọn nhạc chuông</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 pt-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Tìm kiếm nhạc chuông..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-amber/50 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-6 pt-3 pb-2 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1.5
                    ${selectedCategory === cat ? "bg-amber text-black" : "bg-white/5 hover:bg-white/10"}
                  `}
                >
                  {cat === "Hot" && <Flame className="w-3 h-3" />}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Upload zone */}
          <div className="px-6 pt-2 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.aac,.flac,.opus,audio/*"
              onChange={handleFileInput}
              style={{ display: "none" }}
              id="modal-ringtone-file-input"
            />
            <label
              htmlFor="modal-ringtone-file-input"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer
                ${dragOver ? "border-amber bg-amber/20" : "border-amber/40 bg-amber/5 hover:bg-amber/10"}
                ${uploading ? "opacity-60 pointer-events-none" : ""}
              `}
            >
              <Upload className="w-4 h-4 text-amber" />
              <span className="text-sm text-amber font-medium">
                {uploading ? "Đang tải lên..." : "Tải nhạc của bạn"}
              </span>
            </label>

            {error && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Ringtone list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Custom ringtones */}
            {filteredCustomRingtones.length > 0 && (
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Nhạc của tôi</p>
                <div className="space-y-2">
                  {filteredCustomRingtones.map((rt) => (
                    <RingtoneRow
                      key={rt.id}
                      label={rt.name}
                      sublabel={rt.duration > 0 ? `${rt.duration}s` : undefined}
                      isSelected={selectedRingtone === rt.name}
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

          {/* DB Ringtones từ CSDL */}
          {ringtoneList.length > 0 && (
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Nhạc chuông từ CSDL</p>
              <div className="space-y-2">
                {ringtoneList.map((rt) => (
                  <RingtoneRow
                    key={`db-${rt.id}`}
                    label={rt.name}
                    sublabel={rt.filePath ? rt.filePath.split('/').pop() : undefined}
                    isSelected={selectedRingtone === rt.name}
                    isPlaying={playing === `db-${rt.id}`}
                    onSelect={() => {
                      if (onSelectId) onSelectId(rt.id);
                      handleSelect(rt.name);
                    }}
                    onPlay={(e) => {
                      e.stopPropagation();
                      if (playing === `db-${rt.id}`) { stopAllPlayback(); return; }
                      stopAllPlayback();
                      setPlaying(`db-${rt.id}`);
                      if (rt.filePath) {
                        const audio = new Audio(`/${rt.filePath}`);
                        audioRef.current = audio;
                        audio.play().catch(() => {});
                        audio.onended = () => setPlaying(null);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Built-in ringtones (tổng hợp âm thanh) */}
          {filteredBuiltinRingtones.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                {selectedCategory === "Hot" && <Flame className="w-4 h-4 text-orange-500" />}
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  {selectedCategory === "Tất cả" ? "Âm thanh tổng hợp" : selectedCategory}
                </p>
                {selectedCategory === "Hot" && <Sparkles className="w-3 h-3 text-amber" />}
              </div>
              <div className="space-y-2">
                {filteredBuiltinRingtones.map((rt) => (
                  <RingtoneRow
                    key={rt.id}
                    label={rt.name}
                    isSelected={selectedRingtone === rt.name}
                    isPlaying={playing === rt.id}
                    onSelect={() => handleSelect(rt.name)}
                    onPlay={(e) => playBuiltin(rt, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {ringtoneList.length === 0 && filteredBuiltinRingtones.length === 0 && filteredCustomRingtones.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không tìm thấy nhạc chuông phù hợp</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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
      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all cursor-pointer
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
            <span className="px-1.5 py-0.5 rounded-md bg-amber/15 text-amber text-[9px] font-semibold uppercase tracking-wider flex-shrink-0">
              Mặc định
            </span>
          )}
        </div>
        {sublabel && <span className="text-xs text-white/35">{sublabel}</span>}
      </div>

      {/* Mini Waveform animation when playing */}
      {isPlaying && (
        <div className="flex items-end gap-0.5 h-4">
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
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0
            ${isDefault ? "bg-amber/20 text-amber" : "bg-white/8 hover:bg-white/15 text-white/40"}
          `}
        >
          <Star className={`w-3.5 h-3.5 ${isDefault ? "fill-amber" : ""}`} />
        </button>
      )}

      {/* Play button */}
      <button
        onClick={onPlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0
          ${isPlaying ? "bg-amber text-black" : "bg-white/8 hover:bg-white/15"}
        `}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* Delete button (custom only) */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/15 hover:bg-red-500/25 transition-all flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      )}
    </div>
  );
}
