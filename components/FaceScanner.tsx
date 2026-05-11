"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ScanPhase } from "@/types";

interface Props {
  onResult: (score: number, passed: boolean) => void;
  onCancel: () => void;
  storedEmbedding?: number[];
}

export default function FaceScanner({ onResult, onCancel, storedEmbedding }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef(true);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 480, height: 480 },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const { loadModels, detectFace, matchDescriptor } = await import("@/lib/face");
        await loadModels();

        let ticks = 0;
        intervalId = setInterval(async () => {
          if (!runningRef.current || !videoRef.current) return;
          ticks++;
          setProgress(Math.min(100, Math.round((ticks / 25) * 100)));

          if (ticks < 10) return; // give models a moment to warm up
          const result = await detectFace(videoRef.current);
          if (!result) return;

          clearInterval(intervalId);
          const { score, matched } = matchDescriptor(
            result.descriptor,
            storedEmbedding ?? []
          );

          setPhase(matched ? "verified" : "failed");
          setTimeout(() => {
            stopCamera();
            onResult(score, matched);
          }, 1000);
        }, 120);
      } catch (err) {
        setError("Camera access denied. Please allow camera permissions.");
      }
    }

    start();
    return () => {
      runningRef.current = false;
      clearInterval(intervalId);
      stopCamera();
    };
  }, [storedEmbedding, onResult, stopCamera]);

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  const handleRetry = () => {
    runningRef.current = true;
    setPhase("scanning");
    setProgress(0);
    setError(null);
  };

  const phaseColor = phase === "verified" ? "#10B981" : phase === "failed" ? "#EF4444" : "#1D9E75";

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center">
      <p className="text-white/50 text-sm mb-8 tracking-wide">
        {phase === "scanning"
          ? "Position your face in the frame"
          : phase === "verified"
          ? "Identity Verified"
          : error ?? "Scan Failed – Try Again"}
      </p>

      {/* Oval viewfinder */}
      <div className="relative w-[200px] h-[256px]">
        {/* Camera background */}
        <div className="absolute inset-0 rounded-full bg-[#1A1A2E] overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient opacity-10" />
          {/* Face silhouette */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-[0.12]">
            <svg width="110" height="145" viewBox="0 0 120 160" fill="white">
              <ellipse cx="60" cy="55" rx="38" ry="46" />
              <path d="M10 160 Q10 105 60 100 Q110 105 110 160Z" />
            </svg>
          </div>
          {/* Live video */}
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-full scale-x-[-1]"
          />
        </div>

        {/* Animated oval border */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 256">
          <ellipse
            cx="100"
            cy="128"
            rx="96"
            ry="123"
            fill="none"
            stroke={phaseColor}
            strokeWidth="2.5"
            strokeDasharray={phase === "scanning" ? "20 8" : "1000"}
            style={{
              transition: "stroke 0.4s",
              animation: phase === "scanning" ? "spin 3s linear infinite" : "none",
            }}
          />
        </svg>

        {/* Phase icon */}
        {phase !== "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: phaseColor }}
            >
              {phase === "verified" ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {phase === "scanning" && (
        <div className="mt-8 w-44">
          <div className="h-0.5 bg-white/10 rounded-full">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/30 text-xs text-center mt-2">Analyzing… {progress}%</p>
        </div>
      )}

      {phase === "verified" && (
        <p className="text-emerald-400 text-sm font-semibold mt-7">Clock-in recorded ✓</p>
      )}

      {/* Actions */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 px-6">
        {phase === "failed" && (
          <button
            onClick={handleRetry}
            className="w-full py-3.5 rounded-3xl bg-brand-600 text-white font-bold text-sm"
          >
            Try Again
          </button>
        )}
        <button
          onClick={handleCancel}
          className="w-full py-3.5 rounded-3xl bg-white/10 text-white/60 font-semibold text-sm"
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes spin { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -112; } }
      `}</style>
    </div>
  );
}
