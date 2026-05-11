import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/users/[id]/locations — assign a location to a user
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { locationId } = await req.json() as { locationId?: string };
  if (!locationId) return NextResponse.json({ error: "locationId required" }, { status: 400 });

  try {
    await prisma.userLocation.create({
      data: { userId: params.id, locationId },
    });
  } catch {
    // P2002 = unique constraint (already assigned) — treat as success
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/users/[id]/locations — remove a location from a user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { locationId } = await req.json() as { locationId?: string };
  if (!locationId) return NextResponse.json({ error: "locationId required" }, { status: 400 });

  await prisma.userLocation.deleteMany({
    where: { userId: params.id, locationId },
  });

  return NextResponse.json({ ok: true });
}
