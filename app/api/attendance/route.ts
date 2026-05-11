import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isInZone } from "@/lib/geofence";
import { PUNCH_ORDER, getNextPunch } from "@/types";
import type { PunchType } from "@prisma/client";

// GET /api/attendance?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");

  const start = dateParam
    ? new Date(`${dateParam}T00:00:00`)
    : new Date(new Date().toDateString());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const records = await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      timestamp: { gte: start, lt: end },
    },
    include: { location: { select: { id: true, name: true } } },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json(records);
}

// POST /api/attendance
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    locationId: string;
    gpsLat: number;
    gpsLng: number;
    faceScore: number;
    punchType?: PunchType;
  };

  const { locationId, gpsLat, gpsLng, faceScore, punchType } = body;

  if (!locationId || gpsLat == null || gpsLng == null || faceScore == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify location exists and user is assigned to it
  const location = await prisma.location.findFirst({
    where: {
      id: locationId,
      users: { some: { userId: session.user.id } },
    },
  });
  if (!location) {
    return NextResponse.json({ error: "Location not found or not assigned" }, { status: 404 });
  }

  // Server-side geofence check
  if (!isInZone(gpsLat, gpsLng, location.lat, location.lng, location.radius)) {
    return NextResponse.json({ error: "Outside geofence" }, { status: 403 });
  }

  // Face score must pass threshold
  if (faceScore < 0.5) {
    return NextResponse.json({ error: "Face verification failed" }, { status: 403 });
  }

  // Determine punch type: use provided or compute next
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendance = await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      timestamp: { gte: today, lt: tomorrow },
    },
    select: { type: true },
  });

  const doneTypes = todayAttendance.map((a) => a.type);
  const nextType = punchType ?? getNextPunch(doneTypes);

  if (!nextType) {
    return NextResponse.json({ error: "All punches already recorded today" }, { status: 409 });
  }

  // Enforce sequential order
  const targetIdx = PUNCH_ORDER.indexOf(nextType);
  const prevType = targetIdx > 0 ? PUNCH_ORDER[targetIdx - 1] : null;
  if (prevType && !doneTypes.includes(prevType)) {
    return NextResponse.json(
      { error: `Must complete ${prevType} before ${nextType}` },
      { status: 409 }
    );
  }

  const record = await prisma.attendance.create({
    data: {
      userId: session.user.id,
      locationId,
      type: nextType,
      gpsLat,
      gpsLng,
      faceScore,
    },
    include: { location: { select: { id: true, name: true } } },
  });

  return NextResponse.json(record, { status: 201 });
}
