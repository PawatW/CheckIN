"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("sarah.chen@acme.co");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col px-6 font-sans">
      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center pt-10">
        <div
          className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #1D9E75, #0F7A58)",
            boxShadow: "0 8px 24px rgba(29,158,117,0.28)",
          }}
        >
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 6H2v14h14v-2M4 6V4h14v14h-2M8 12h8M12 8v8" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">TimeCheck</h1>
        <p className="text-gray-400 text-sm mt-1">Smart Attendance · GPS + Face ID</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="pb-10">
        <h2 className="text-[22px] font-bold text-gray-900 mb-6">Sign in</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Work Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 bg-gray-50 outline-none focus:border-brand-600 focus:bg-white transition mb-4"
          placeholder="you@company.com"
        />

        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
        <div className="relative mb-2">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 bg-gray-50 outline-none focus:border-brand-600 focus:bg-white transition pr-12"
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPw ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            )}
          </button>
        </div>

        <div className="text-right mb-6">
          <span className="text-xs font-semibold text-brand-600 cursor-pointer">Forgot password?</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-3xl text-white font-bold text-sm transition disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, #1D9E75, #0E8A62)",
            boxShadow: "0 4px 14px rgba(29,158,117,0.35)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white inline-block"
                  style={{ animation: `bounce 1s ${i * 0.15}s ease-in-out infinite` }}
                />
              ))}
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        <p className="text-center text-gray-400 text-xs mt-6">v2.4.1 · © 2026 TimeCheck Inc.</p>
      </form>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>
    </div>
  );
}
