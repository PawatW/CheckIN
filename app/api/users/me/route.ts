import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/me  — returns own profile including whether face is enrolled
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, faceEmbedding: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...user,
    faceEnrolled: user.faceEmbedding.length > 0,
    faceEmbedding: undefined,   // never expose raw embedding
  });
}

// PATCH /api/users/me  — update face embedding (enrollment)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { faceEmbedding?: number[] };

  if (!body.faceEmbedding || !Array.isArray(body.faceEmbedding) || body.faceEmbedding.length !== 128) {
    return NextResponse.json(
      { error: "faceEmbedding must be a 128-element Float array" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { faceEmbedding: body.faceEmbedding },
  });

  return NextResponse.json({ enrolled: true });
}
