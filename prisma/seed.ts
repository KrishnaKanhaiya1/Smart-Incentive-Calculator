import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.salesEntry.deleteMany();
  await prisma.incentiveSlab.deleteMany();
  await prisma.carModel.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const adminPassword = await bcrypt.hash("password123", 10);
  const salesPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const salesOfficer = await prisma.user.create({
    data: {
      email: "sales@example.com",
      name: "Sales Officer",
      password: salesPassword,
      role: "SALES_OFFICER",
    },
  });

  // Create car models
  const cars = await prisma.carModel.createMany({
    data: [
      {
        name: "Honda City",
        baseSuffix: "V",
        variant: "Petrol",
      },
      {
        name: "Maruti Swift",
        baseSuffix: "LXi",
        variant: "Petrol",
      },
      {
        name: "Hyundai i20",
        baseSuffix: "Active",
        variant: "Diesel",
      },
      {
        name: "Toyota Fortuner",
        baseSuffix: "4x2",
        variant: "Diesel",
      },
      {
        name: "Tata Nexon",
        baseSuffix: "XE",
        variant: "Petrol",
      },
    ],
  });

  // Create incentive slabs
  await prisma.incentiveSlab.createMany({
    data: [
      {
        minRange: 1,
        maxRange: 3,
        incentiveAmount: 1000,
      },
      {
        minRange: 4,
        maxRange: 7,
        incentiveAmount: 2000,
      },
      {
        minRange: 8,
        maxRange: null,
        incentiveAmount: 3500,
      },
    ],
  });

  console.log("✅ Seed data created successfully!");
  console.log("Admin user:", admin.email);
  console.log("Sales officer user:", salesOfficer.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
