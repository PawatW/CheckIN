import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { PUNCH_ORDER } from "@/types";

function fmt(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [users, attendanceToday] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
    prisma.attendance.findMany({
      where: { timestamp: { gte: todayStart, lte: todayEnd } },
      select: { userId: true, type: true, timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
  ]);

  // Group punches by userId
  const byUser: Record<string, Record<string, Date>> = {};
  for (const rec of attendanceToday) {
    if (!byUser[rec.userId]) byUser[rec.userId] = {};
    byUser[rec.userId][rec.type] = rec.timestamp;
  }

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const present = users.filter((u) => byUser[u.id]?.["MORNING_IN"]).length;
  const total   = users.length;

  return (
    <div className="flex flex-col pb-20 md:pb-6">
      <PageHeader
        title="Attendance"
        subtitle={todayDateStr}
      />

      {/* Summary strip */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2.5">
        {[
          { label: "Present",  value: present,         color: "text-brand-600"   },
          { label: "Absent",   value: total - present, color: "text-red-500"     },
          { label: "Total",    value: total,            color: "text-gray-700"   },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Staff list */}
      <div className="bg-white mt-4 mx-4 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {users.map((user) => {
            const punches = byUser[user.id] ?? {};
            const morningIn = punches["MORNING_IN"];
            const hasAny    = Object.keys(punches).length > 0;
            const isLate    = morningIn && morningIn.getHours() * 60 + morningIn.getMinutes() >= 9 * 60;

            const statusLabel = !hasAny
              ? "Absent"
              : isLate
              ? "Late"
              : "On Time";

            const statusColor = !hasAny
              ? "bg-red-50 text-red-500"
              : isLate
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-600";

            const userInitials = user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div key={user.id} className="px-4 py-3.5">
                {/* Header row */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Punch timeline */}
                <div className="flex gap-1.5 pl-12 flex-wrap">
                  {PUNCH_ORDER.map((type) => {
                    const ts = punches[type];
                    const shortLabel: Record<string, string> = {
                      MORNING_IN:    "In",
                      MORNING_OUT:   "Out",
                      NOON_IN:       "Noon In",
                      NOON_OUT:      "Noon Out",
                      AFTERNOON_IN:  "PM In",
                      AFTERNOON_OUT: "PM Out",
                    };
                    return (
                      <div
                        key={type}
                        className={`flex flex-col items-center rounded-xl px-2.5 py-1.5 min-w-[52px] ${
                          ts ? "bg-brand-50 border border-brand-100" : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <span className={`text-[9px] font-semibold uppercase tracking-wide ${ts ? "text-brand-600" : "text-gray-300"}`}>
                          {shortLabel[type]}
                        </span>
                        <span className={`text-[11px] font-bold tabular-nums mt-0.5 ${ts ? "text-gray-800" : "text-gray-300"}`}>
                          {ts ? fmt(ts) : "--:--"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
