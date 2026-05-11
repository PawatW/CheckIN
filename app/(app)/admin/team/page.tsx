import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [users, locations] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        faceEmbedding: true,
        locations: {
          select: { location: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.location.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const staff = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    faceEnrolled: u.faceEmbedding.length > 0,
    locations: u.locations.map((ul) => ul.location),
  }));

  return (
    <div className="flex flex-col pb-20 md:pb-6">
      <PageHeader
        title="Team"
        subtitle={`${staff.length} member${staff.length !== 1 ? "s" : ""}`}
      />
      <div className="bg-white mt-4 mx-4 rounded-2xl border border-gray-100 overflow-hidden">
        <TeamClient initialStaff={staff} allLocations={locations} />
      </div>
    </div>
  );
}
