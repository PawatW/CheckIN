import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LocationsClient from "./LocationsClient";

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const locations = await prisma.location.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  const serialised = locations.map((l) => ({
    id:      l.id,
    name:    l.name,
    address: l.address,
    lat:     l.lat,
    lng:     l.lng,
    radius:  l.radius,
    staff:   l._count.users,
  }));

  return <LocationsClient initialLocations={serialised} />;
}
