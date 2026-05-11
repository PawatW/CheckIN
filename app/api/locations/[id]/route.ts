import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/locations/:id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as Partial<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    radius: number;
  }>;

  const location = await prisma.location.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(location);
}

// DELETE /api/locations/:id
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.location.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
