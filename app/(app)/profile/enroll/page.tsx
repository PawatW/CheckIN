"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Step = "intro" | "camera" | "capturing" | "saving" | "done" | "error";

export default function EnrollPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Clean up on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  const startEnrollment = async () => {
    setStep("camera");
    setProgress(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStep("capturing");

      const { loadModels, detectFace } = await import("@/lib/face");
      await loadModels();

      // Collect multiple descriptors and average them for a robust embedding
      const samples: Float32Array[] = [];
      const TARGET = 5;

      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          if (!videoRef.current) { clearInterval(interval); reject(new Error("Camera lost")); return; }
          const result = await detectFace(videoRef.current);
          if (result) {
            samples.push(result.descriptor);
            setProgress(Math.round((samples.length / TARGET) * 100));
            if (samples.length >= TARGET) { clearInterval(interval); resolve(); }
          }
        }, 400);
      });

      setStep("saving");
      stopCamera();

      // Average the descriptors for a more robust embedding
      const averaged = new Array(128).fill(0).map((_, i) =>
        samples.reduce((sum, s) => sum + s[i], 0) / samples.length
      );

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceEmbedding: averaged }),
      });

      if (!res.ok) throw new Error("Failed to save embedding");
      setStep("done");
    } catch (err) {
      stopCamera();
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <div
        className="px-5 pt-14 md:pt-6 pb-5"
        style={{ background: "linear-gradient(145deg, #1D9E75 0%, #0E8A62 100%)" }}
      >
        <button onClick={() => router.back()} className="text-white/70 text-sm flex items-center gap-1.5 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 className="text-white text-xl font-bold">Face Enrollment</h1>
        <p className="text-white/70 text-sm mt-1">Register your face for attendance verification</p>
      </div>

      <div className="flex-1 px-5 pt-8 pb-10 flex flex-col items-center">
        {/* Intro */}
        {step === "intro" && (
          <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-brand-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">How it works</h2>
              <ul className="text-sm text-gray-500 space-y-2 text-left">
                {[
                  "Your camera will open and scan your face",
                  "5 samples are captured and averaged for accuracy",
                  "The embedding is stored encrypted in the database",
                  "No photos are ever uploaded or stored",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-brand-500 font-bold mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
              <strong>Tip:</strong> Find good lighting, face the camera directly, and remove sunglasses.
            </div>

            <button
              onClick={startEnrollment}
              className="w-full py-4 rounded-3xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E8A62)", boxShadow: "0 4px 14px rgba(29,158,117,0.35)" }}
            >
              Start Enrollment
            </button>
          </div>
        )}

        {/* Camera / capturing */}
        {(step === "camera" || step === "capturing") && (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <p className="text-gray-500 text-sm">
              {step === "camera" ? "Starting camera…" : "Hold still — capturing samples"}
            </p>

            {/* Oval viewfinder */}
            <div className="relative w-[200px] h-[256px]">
              <div className="absolute inset-0 rounded-full bg-[#1A1A2E] overflow-hidden">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover rounded-full scale-x-[-1]"
                />
              </div>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 256">
                <ellipse
                  cx="100" cy="128" rx="96" ry="123"
                  fill="none" stroke="#1D9E75" strokeWidth="2.5"
                  strokeDasharray="20 8"
                  style={{ animation: "spin 3s linear infinite" }}
                />
              </svg>
            </div>

            {/* Progress */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Samples captured</span>
                <span>{Math.round(progress / 20)} / 5</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Saving */}
        {step === "saving" && (
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Saving your face data…</p>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-6 pt-8 text-center w-full max-w-sm">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enrollment Complete!</h2>
              <p className="text-gray-500 text-sm mt-2">
                Your face has been registered. You can now use Face ID to punch in and out.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-4 rounded-3xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E8A62)" }}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-6 pt-8 text-center w-full max-w-sm">
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enrollment Failed</h2>
              <p className="text-gray-500 text-sm mt-2">{errorMsg}</p>
            </div>
            <button
              onClick={() => { setStep("intro"); setProgress(0); setErrorMsg(""); }}
              className="w-full py-4 rounded-3xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E8A62)" }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -112; } }
      `}</style>
    </div>
  );
}
