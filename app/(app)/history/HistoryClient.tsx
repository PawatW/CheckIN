"use client";

import { useRouter, usePathname } from "next/navigation";
import AttendanceRow, { AttendanceHeader } from "@/components/AttendanceRow";
import type { DayRow } from "@/types";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Props {
  rows: DayRow[];
  year: number;
  month: number;
  stats: { present: number; late: number; absent: number };
}

export default function HistoryClient({ rows, year, month, stats }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    router.push(`${pathname}?year=${y}&month=${m}`);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-14 md:pt-6 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-extrabold text-gray-900 mb-4">Attendance History</h1>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="font-bold text-brand-600 text-[15px]">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={() => navigate(1)}
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Present", val: stats.present, bg: "bg-emerald-50", text: "text-emerald-700" },
            { label: "Late",    val: stats.late,    bg: "bg-amber-50",   text: "text-amber-700"   },
            { label: "Absent",  val: stats.absent,  bg: "bg-red-50",     text: "text-red-600"      },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center`}>
              <p className={`text-xl font-extrabold ${s.text}`}>{s.val}</p>
              <p className={`text-[10px] ${s.text} opacity-80`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <AttendanceHeader />
      <div className="px-3 pt-1.5 pb-4 flex flex-col gap-1.5">
        {rows.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">No records this month.</p>
        ) : (
          rows.map((row) => <AttendanceRow key={row.date} row={row} />)
        )}
      </div>
    </div>
  );
}
