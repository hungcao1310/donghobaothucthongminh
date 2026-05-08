import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, AlertTriangle, CheckCircle } from "lucide-react";
import jsQR from "jsqr";

interface Props {
  difficulty: number;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
}

export function QRChallenge({ difficulty, failCount, onSuccess, onFail }: Props) {
  const [status, setStatus] = useState<"idle" | "requesting" | "scanning" | "denied" | "detected">("idle");
  const [detectedData, setDetectedData] = useState("");
  const [scanPulse, setScanPulse] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const donRef = useRef(false);

  const scan = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scan);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

    if (code && !donRef.current) {
      donRef.current = true;
      setDetectedData(code.data);
      setStatus("detected");
      setScanPulse(true);
      // Stop stream
      streamRef.current?.getTracks().forEach(t => t.stop());
      setTimeout(onSuccess, 600);
      return;
    }

    rafRef.current = requestAnimationFrame(scan);
  }, [onSuccess]);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("scanning");
      rafRef.current = requestAnimationFrame(scan);
    } catch {
      setStatus("denied");
    }
  }, [scan]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-2">
      <div className="text-5xl mb-3">📷</div>

      <p className="text-white/60 text-sm mb-2 text-center">
        Quét mã QR đã đặt xa giường ngủ của bạn
      </p>
      <p className="text-xs text-white/30 mb-5 text-center">
        Bất kỳ mã QR nào cũng được chấp nhận
      </p>

      {/* Camera preview */}
      <div className="relative w-64 h-64 rounded-3xl overflow-hidden bg-[#111] border-2 border-white/10 mb-4">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${status === "scanning" ? "opacity-100" : "opacity-0"}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        {status === "scanning" && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner brackets */}
            {[["top-3 left-3", "border-t-2 border-l-2"], ["top-3 right-3", "border-t-2 border-r-2"],
              ["bottom-3 left-3", "border-b-2 border-l-2"], ["bottom-3 right-3", "border-b-2 border-r-2"]].map(([pos, border], i) => (
              <div key={i} className={`absolute w-6 h-6 ${pos} ${border} border-amber rounded-sm`} />
            ))}
            {/* Scanning line */}
            <div className="absolute left-4 right-4 h-0.5 bg-amber/70 rounded-full" style={{ animation: "scanLine 2s ease-in-out infinite", top: "50%" }} />
          </div>
        )}

        {/* Idle state */}
        {(status === "idle" || status === "requesting") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Camera className="w-10 h-10 text-white/30" />
            {status === "requesting" && (
              <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}

        {/* Permission denied */}
        {status === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <p className="text-xs text-white/60">Không có quyền camera</p>
            <p className="text-xs text-white/40">Cấp quyền camera trong cài đặt</p>
          </div>
        )}

        {/* Detected */}
        {status === "detected" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-500/20">
            <CheckCircle className="w-12 h-12 text-green-400" />
            <p className="text-sm text-green-300 font-medium">Đã quét thành công!</p>
          </div>
        )}
      </div>

      {status === "idle" && (
        <button
          onClick={startCamera}
          className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-amber text-black font-semibold text-base active:scale-95 transition-all"
        >
          <Camera className="w-5 h-5" />
          Mở camera
        </button>
      )}

      {status === "denied" && (
        <button
          onClick={startCamera}
          className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-amber/20 border border-amber text-amber font-medium active:scale-95 transition-all"
        >
          <Camera className="w-5 h-5" />
          Thử lại
        </button>
      )}

      {status === "scanning" && (
        <p className="text-amber text-sm animate-pulse">Đang tìm mã QR...</p>
      )}

      {detectedData && (
        <p className="mt-2 text-xs text-white/30 truncate max-w-full px-4">
          {detectedData.slice(0, 40)}{detectedData.length > 40 ? "..." : ""}
        </p>
      )}

      {failCount > 0 && (
        <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">Đã sai {failCount} lần</span>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-60px); opacity: 0; }
          20%, 80% { opacity: 1; }
          50% { transform: translateY(60px); }
        }
      `}</style>
    </div>
  );
}
