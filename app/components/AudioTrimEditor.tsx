import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { Scissors, Check, X, Volume2, Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface AudioTrimEditorProps {
  audioFile: File;
  onSave: (trimmedBlob: Blob, fadeInDuration: number, fadeOutDuration: number) => void;
  onCancel: () => void;
}

export function AudioTrimEditor({ audioFile, onSave, onCancel }: AudioTrimEditorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [fadeIn, setFadeIn] = useState(0.3);
  const [fadeOut, setFadeOut] = useState(0.3);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wsRegions = RegionsPlugin.create();
    regionsPluginRef.current = wsRegions;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgba(251, 191, 36, 0.3)",
      progressColor: "rgb(251, 191, 36)",
      cursorColor: "rgb(251, 191, 36)",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 120,
      normalize: true,
      plugins: [wsRegions],
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      const dur = ws.getDuration();
      setDuration(dur);
      setTrimEnd(dur);

      // Create selection region
      wsRegions.addRegion({
        start: 0,
        end: dur,
        color: "rgba(251, 191, 36, 0.2)",
        drag: true,
        resize: true,
      });

      wsRegions.on("region-updated", (region: any) => {
        setTrimStart(region.start);
        setTrimEnd(region.end);
      });
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("timeupdate", (time) => setCurrentTime(time));

    // Load audio
    const url = URL.createObjectURL(audioFile);
    ws.load(url);

    return () => {
      ws.destroy();
      URL.revokeObjectURL(url);
    };
  }, [audioFile]);

  const handlePlayPause = () => {
    wavesurferRef.current?.playPause();
  };

  const handleSkip = (seconds: number) => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    const newTime = Math.max(0, Math.min(ws.getDuration(), currentTime + seconds));
    ws.setTime(newTime);
  };

  const handleSave = async () => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    setProcessing(true);

    try {
      // Get audio buffer
      const audioBuffer = ws.getDecodedData();
      if (!audioBuffer) throw new Error("No audio data");

      // Calculate sample positions
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(trimStart * sampleRate);
      const endSample = Math.floor(trimEnd * sampleRate);
      const trimmedLength = endSample - startSample;

      // Create new buffer for trimmed audio
      const trimmedBuffer = new AudioContext().createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        sampleRate
      );

      // Copy and apply fade
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const sourceData = audioBuffer.getChannelData(channel);
        const targetData = trimmedBuffer.getChannelData(channel);

        for (let i = 0; i < trimmedLength; i++) {
          let sample = sourceData[startSample + i];

          // Apply fade in
          if (fadeIn > 0) {
            const fadeInSamples = fadeIn * sampleRate;
            if (i < fadeInSamples) {
              sample *= i / fadeInSamples;
            }
          }

          // Apply fade out
          if (fadeOut > 0) {
            const fadeOutSamples = fadeOut * sampleRate;
            if (i > trimmedLength - fadeOutSamples) {
              sample *= (trimmedLength - i) / fadeOutSamples;
            }
          }

          targetData[i] = sample;
        }
      }

      // Convert to WAV blob
      const blob = await bufferToWave(trimmedBuffer);
      onSave(blob, fadeIn, fadeOut);
    } catch (error) {
      console.error("Trim error:", error);
      alert("Có lỗi khi xử lý audio. Vui lòng thử lại.");
      setProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  const trimmedDuration = trimEnd - trimStart;
  const isValidTrim = trimmedDuration > 0 && trimmedDuration <= 30;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-3xl w-full max-w-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold">Chỉnh sửa nhạc chuông</h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Waveform */}
        <div className="p-6">
          <div ref={waveformRef} className="rounded-xl overflow-hidden bg-black/40 mb-4" />

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => handleSkip(-5)}
              className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full bg-amber hover:bg-amber/90 flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black ml-0.5" />}
            </button>
            <button
              onClick={() => handleSkip(5)}
              className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time display */}
          <div className="flex items-center justify-between text-xs text-white/50 mb-6">
            <span>{formatTime(currentTime)}</span>
            <span className="text-amber">
              {formatTime(trimStart)} - {formatTime(trimEnd)} ({formatTime(trimmedDuration)})
            </span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Trim range */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Scissors className="w-4 h-4 text-amber" />
              <span className="text-sm flex-1">Điểm cắt</span>
              {!isValidTrim && (
                <span className="text-xs text-red-400">Tối đa 30 giây</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Bắt đầu</label>
                <input
                  type="number"
                  min="0"
                  max={trimEnd}
                  step="0.1"
                  value={trimStart.toFixed(1)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTrimStart(val);
                    const regions = regionsPluginRef.current?.getRegions();
                    if (regions?.[0]) regions[0].setOptions({ start: val });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Kết thúc</label>
                <input
                  type="number"
                  min={trimStart}
                  max={duration}
                  step="0.1"
                  value={trimEnd.toFixed(1)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTrimEnd(val);
                    const regions = regionsPluginRef.current?.getRegions();
                    if (regions?.[0]) regions[0].setOptions({ end: val });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Fade controls */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-amber" />
              <span className="text-sm">Hiệu ứng âm thanh</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-2 flex items-center justify-between">
                  <span>Fade In</span>
                  <span className="text-amber">{fadeIn.toFixed(1)}s</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={fadeIn}
                  onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                  className="w-full accent-amber"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 flex items-center justify-between">
                  <span>Fade Out</span>
                  <span className="text-amber">{fadeOut.toFixed(1)}s</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={fadeOut}
                  onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                  className="w-full accent-amber"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-white/8 hover:bg-white/12 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!isValidTrim || processing}
            className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2
              ${isValidTrim && !processing ? "bg-amber hover:bg-amber/90 text-black" : "bg-white/5 text-white/30 cursor-not-allowed"}
            `}
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Lưu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Convert AudioBuffer to WAV Blob
async function bufferToWave(audioBuffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numberOfChannels * 2;

  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true); // byte rate
  view.setUint16(32, numberOfChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, length, true);

  // Write interleaved audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
