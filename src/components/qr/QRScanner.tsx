"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, SwitchCamera, Loader2 } from "lucide-react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const activeRef = useRef(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleClose = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  const scanFrames = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    function tick() {
      if (!activeRef.current) return;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          const val = code.data.trim().toUpperCase();
          if (val.startsWith("BE-") && val.length >= 10) {
            onScan(val);
            cleanup();
            return;
          }
        }
      } catch {
        // Continue scanning on error
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [onScan, cleanup]);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    setLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current && activeRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        setLoading(false);
        scanFrames();
      }
    } catch {
      setLoading(false);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions dans les réglages de votre navigateur.");
    }
  }, [scanFrames]);

  function switchCamera() {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    startCamera(newFacing);
  }

  useEffect(() => {
    activeRef.current = true;
    startCamera(facingMode);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#0066FF]" />
            <h3 className="font-semibold text-[#0C1B2A]">Scanner un QR code</h3>
          </div>
          <div className="flex items-center gap-2">
            {scanning && (
              <button
                onClick={switchCamera}
                className="p-2 text-gray-500 hover:text-[#0066FF] hover:bg-[#0066FF]/5 rounded-lg transition-colors"
                title="Changer de caméra"
              >
                <SwitchCamera className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Camera */}
        <div className="relative aspect-square bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading state */}
          {loading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
              <Loader2 className="h-8 w-8 text-[#0066FF] animate-spin" />
              <p className="text-white/70 text-sm">Activation de la caméra...</p>
            </div>
          )}

          {/* Scanner overlay */}
          {scanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 relative">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#0066FF] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#0066FF] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#0066FF] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#0066FF] rounded-br-lg" />
                {/* Scan line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-[#0066FF]/60 animate-scan-line" />
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 gap-4">
              <Camera className="h-10 w-10 text-white/40" />
              <p className="text-white text-center text-sm">{error}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-gray-500">
            Pointez la caméra vers le QR code du client
          </p>
        </div>
      </div>
    </div>
  );
}
