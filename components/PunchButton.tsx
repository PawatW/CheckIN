"use client";

import type { PunchType } from "@prisma/client";
import { PUNCH_LABELS, PUNCH_ICONS } from "@/types";

interface Props {
  punchType: PunchType;
  recordedTime: string | null;
  isNext: boolean;
  inZone: boolean;
  onClick: () => void;
}

export default function PunchButton({ punchType, recordedTime, isNext, inZone, onClick }: Props) {
  const done = !!recordedTime;
  const canPunch = isNext && inZone && !done;

  return (
    <button
      onClick={canPunch ? onClick : undefined}
      disabled={!canPunch && !done}
      className={`relative rounded-2xl p-3.5 text-left transition-all duration-150 ${
        done
          ? "bg-emerald-50 border-2 border-emerald-200"
          : canPunch
          ? "bg-white border-2 border-gray-200 shadow-sm active:scale-[0.97] cursor-pointer"
          : "bg-white border-2 border-gray-100 opacity-60 cursor-not-allowed"
      }`}
    >
      {done && (
        <div className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-brand-600 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="text-xl mb-1.5">{PUNCH_ICONS[punchType]}</div>
      <p className={`text-[11px] font-medium mb-0.5 ${done ? "text-emerald-700" : "text-gray-500"}`}>
        {PUNCH_LABELS[punchType]}
      </p>
      <p
        className={`text-base font-bold tabular-nums ${
          done ? "text-brand-600" : "text-gray-300"
        }`}
      >
        {recordedTime ?? "--:--"}
      </p>
    </button>
  );
}
