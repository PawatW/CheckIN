import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/locations  — returns locations assigned to the current user (staff)
// or all locations (admin)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "ADMIN") {
    const locations = await prisma.location.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(locations);
  }

  const locations = await prisma.location.findMany({
    where: { users: { some: { userId: session.user.id } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(locations);
}

// POST /api/locations — admin only
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    name: string;
    address: string;
    lat: number;
    lng: number;
    radius?: number;
  };

  const { name, address, lat, lng, radius = 200 } = body;
  if (!name || !address || lat == null || lng == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: { name, address, lat, lng, radius },
  });
  return NextResponse.json(location, { status: 201 });
}
