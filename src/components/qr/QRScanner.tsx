"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, SwitchCamera } from "lucide-react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  async function startCamera(facing: "environment" | "user") {
    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        setError(null);
        scanFrames();
      }
    } catch {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }

  function scanFrames() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function tick() {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Use BarcodeDetector API if available (Chrome, Edge)
      if ("BarcodeDetector" in window) {
        if (!scannerRef.current) {
          // @ts-expect-error BarcodeDetector is not in all TS defs
          scannerRef.current = new BarcodeDetector({ formats: ["qr_code"] });
        }
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        scannerRef.current
          .detect(createImageBitmapCompat(canvas, imageData))
          .then((barcodes: { rawValue: string }[]) => {
            if (barcodes.length > 0) {
              const val = barcodes[0].rawValue.trim().toUpperCase();
              if (val.startsWith("BE-") && val.length >= 10) {
                onScan(val);
                cleanup();
                return;
              }
            }
            animFrameRef.current = requestAnimationFrame(tick);
          })
          .catch(() => {
            animFrameRef.current = requestAnimationFrame(tick);
          });
        return;
      }

      // Fallback: try jsQR if BarcodeDetector not available
      try {
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        // Dynamic import would be ideal but for simplicity we scan with BarcodeDetector
        // If BarcodeDetector not available, show manual entry message
        if (!("BarcodeDetector" in window)) {
          setError("Scan QR non supporté sur ce navigateur. Entrez le code manuellement.");
          cleanup();
          return;
        }
      } catch {
        // continue
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }

  function createImageBitmapCompat(canvas: HTMLCanvasElement, _imageData: ImageData) {
    // BarcodeDetector can work directly with canvas
    return canvas;
  }

  function cleanup() {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  function switchCamera() {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    startCamera(newFacing);
  }

  useEffect(() => {
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
              onClick={() => { cleanup(); onClose(); }}
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
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner overlay */}
          {scanning && (
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6">
              <p className="text-white text-center text-sm">{error}</p>
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
