import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import type { AttendanceRecord } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  // Assigned locations
  const locationRows = await prisma.location.findMany({
    where: { users: { some: { userId: session.user.id } } },
  });

  // Today's attendance
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const todayRecords = await prisma.attendance.findMany({
    where: { userId: session.user.id, timestamp: { gte: todayStart, lt: todayEnd } },
    include: { location: { select: { id: true, name: true } } },
    orderBy: { timestamp: "asc" },
  });

  // Monthly stats (current month, working days only)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthRecords = await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      type: "MORNING_IN",
      timestamp: { gte: monthStart, lt: monthEnd },
    },
    select: { timestamp: true },
  });

  // Count working days so far this month (Mon–Fri up to today)
  let workingDaysTotal = 0;
  const cursor = new Date(monthStart);
  const today  = new Date(); today.setHours(23, 59, 59, 999);
  while (cursor <= today && cursor < monthEnd) {
    const d = cursor.getDay();
    if (d !== 0 && d !== 6) workingDaysTotal++;
    cursor.setDate(cursor.getDate() + 1);
  }

  const presentDays = monthRecords.length;
  const onTimeDays  = monthRecords.filter((r) => {
    const t = r.timestamp;
    return t.getHours() < 9 || (t.getHours() === 9 && t.getMinutes() === 0);
  }).length;
  const lateDays   = presentDays - onTimeDays;
  const absentDays = Math.max(0, workingDaysTotal - presentDays);

  // Face embedding
  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { faceEmbedding: true },
  });

  const serialised: AttendanceRecord[] = todayRecords.map((r) => ({
    id:        r.id,
    type:      r.type,
    timestamp: r.timestamp.toISOString(),
    gpsLat:    r.gpsLat,
    gpsLng:    r.gpsLng,
    faceScore: r.faceScore,
    location:  r.location,
  }));

  return (
    <DashboardClient
      user={{ id: session.user.id, name: session.user.name, email: session.user.email }}
      locations={locationRows}
      initialAttendance={serialised}
      faceEmbedding={userRow?.faceEmbedding ?? []}
      monthStats={{ present: presentDays, onTime: onTimeDays, late: lateDays, absent: absentDays }}
    />
  );
}
