import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // Locations
  const headOffice = await prisma.location.upsert({
    where: { id: "loc_head_office" },
    update: {},
    create: {
      id: "loc_head_office",
      name: "Head Office – Bangkok",
      address: "88 Silom Rd, Bang Rak, Bangkok 10500",
      lat: 13.7244,
      lng: 100.5198,
      radius: 200,
    },
  });

  const chiangMai = await prisma.location.upsert({
    where: { id: "loc_chiang_mai" },
    update: {},
    create: {
      id: "loc_chiang_mai",
      name: "North Branch – Chiang Mai",
      address: "55 Nimman Rd, Suthep, Chiang Mai 50200",
      lat: 18.7987,
      lng: 98.9636,
      radius: 150,
    },
  });

  console.log("✅ Locations created:", headOffice.name, chiangMai.name);

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@acme.co" },
    update: {},
    create: {
      email: "admin@acme.co",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      faceEmbedding: [],
      locations: {
        create: [
          { locationId: headOffice.id },
          { locationId: chiangMai.id },
        ],
      },
    },
  });

  // Staff user
  const staffPassword = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "sarah.chen@acme.co" },
    update: {},
    create: {
      email: "sarah.chen@acme.co",
      name: "Sarah Chen",
      password: staffPassword,
      role: "STAFF",
      faceEmbedding: [],
      locations: {
        create: [{ locationId: headOffice.id }],
      },
    },
  });

  console.log("✅ Users created:", admin.email, staff.email);
  console.log("\n🎉 Seed complete! Login credentials:");
  console.log("   Admin  →  admin@acme.co       / admin123");
  console.log("   Staff  →  sarah.chen@acme.co  / staff123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
