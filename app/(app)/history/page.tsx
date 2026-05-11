import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HistoryClient from "./HistoryClient";
import type { DayRow } from "@/types";

export const dynamic = "force-dynamic";

function buildDayRow(date: Date, records: { type: string; timestamp: Date }[]): DayRow {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const get = (type: string) => {
    const r = records.find((r) => r.type === type);
    return r ? fmt(r.timestamp) : null;
  };

  const mi = get("MORNING_IN");
  const status: DayRow["status"] = !mi
    ? "absent"
    : mi > "09:00"
    ? "late"
    : "on-time";

  return {
    date: date.toISOString().slice(0, 10),
    dayOfWeek: DAYS[date.getDay()],
    morningIn:    mi,
    morningOut:   get("MORNING_OUT"),
    noonIn:       get("NOON_IN"),
    noonOut:      get("NOON_OUT"),
    afternoonIn:  get("AFTERNOON_IN"),
    afternoonOut: get("AFTERNOON_OUT"),
    status,
  };
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const session = await auth();
  if (!session) return null;

  const now = new Date();
  const year  = Number(searchParams.year)  || now.getFullYear();
  const month = Number(searchParams.month) || now.getMonth() + 1;

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const records = await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      timestamp: { gte: start, lt: end },
    },
    orderBy: { timestamp: "asc" },
  });

  // Group by date
  const grouped = new Map<string, typeof records>();
  for (const r of records) {
    const key = r.timestamp.toISOString().slice(0, 10);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  // Build row per working day (Mon–Fri) in month
  const rows: DayRow[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      const key = cursor.toISOString().slice(0, 10);
      rows.push(buildDayRow(new Date(cursor), grouped.get(key) ?? []));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const present = rows.filter((r) => r.status !== "absent").length;
  const late    = rows.filter((r) => r.status === "late").length;
  const absent  = rows.filter((r) => r.status === "absent").length;

  return (
    <HistoryClient
      rows={rows}
      year={year}
      month={month}
      stats={{ present, late, absent }}
    />
  );
}
