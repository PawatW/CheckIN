import type { DayRow } from "@/types";

const STATUS_STYLES = {
  "on-time": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "border-gray-100" },
  late:      { dot: "bg-amber-500",   text: "text-amber-700",   bg: "border-gray-100" },
  absent:    { dot: "bg-red-500",     text: "text-red-600",     bg: "border-red-100"  },
};

const CELLS = [
  { key: "morningIn",    short: "MI" },
  { key: "morningOut",   short: "MO" },
  { key: "noonIn",       short: "NI" },
  { key: "noonOut",      short: "NO" },
  { key: "afternoonIn",  short: "AI" },
  { key: "afternoonOut", short: "AO" },
] as const;

interface Props {
  row: DayRow;
  showDate?: boolean;
}

export default function AttendanceRow({ row, showDate = true }: Props) {
  const s = STATUS_STYLES[row.status];

  return (
    <div className={`bg-white rounded-xl border ${s.bg} overflow-hidden`}>
      <div className="grid items-center px-2.5 py-2.5" style={{ gridTemplateColumns: "48px repeat(6, 1fr)" }}>
        {showDate && (
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 leading-none">{row.date.slice(8)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{row.dayOfWeek}</p>
          </div>
        )}
        {CELLS.map(({ key }) => {
          const val = row[key];
          return (
            <span
              key={key}
              className={`text-[11px] text-center font-semibold tabular-nums ${
                val ? s.text : "text-gray-200"
              }`}
            >
              {val ?? "--:--"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function AttendanceHeader() {
  return (
    <div
      className="grid px-2.5 py-1.5 bg-gray-50"
      style={{ gridTemplateColumns: "48px repeat(6, 1fr)" }}
    >
      <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Date</span>
      {CELLS.map(({ short }) => (
        <span key={short} className="text-[10px] font-bold text-gray-400 uppercase text-center">
          {short}
        </span>
      ))}
    </div>
  );
}
