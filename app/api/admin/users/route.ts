import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users — list all users with their assigned locations
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      faceEmbedding: true,
      locations: {
        select: {
          location: { select: { id: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      faceEnrolled: u.faceEmbedding.length > 0,
      locations: u.locations.map((ul) => ul.location),
    }))
  );
}
