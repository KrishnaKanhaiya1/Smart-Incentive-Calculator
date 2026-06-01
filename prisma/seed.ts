import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with enterprise-grade demo data...\n");

  const adminHash = await bcrypt.hash("admin123", 12);
  const salesHash = await bcrypt.hash("sales123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nippytoyota.com" },
    update: { passwordHash: adminHash, name: "Rajesh Kumar" },
    create: {
      email: "admin@nippytoyota.com",
      name: "Rajesh Kumar",
      role: "ADMIN",
      passwordHash: adminHash,
    },
  });

  const salesOfficer1 = await prisma.user.upsert({
    where: { email: "anita.sharma@nippytoyota.com" },
    update: { passwordHash: salesHash },
    create: {
      email: "anita.sharma@nippytoyota.com",
      name: "Anita Sharma",
      role: "SALES",
      passwordHash: salesHash,
    },
  });

  const salesOfficer2 = await prisma.user.upsert({
    where: { email: "vikram.patel@nippytoyota.com" },
    update: { passwordHash: salesHash },
    create: {
      email: "vikram.patel@nippytoyota.com",
      name: "Vikram Patel",
      role: "SALES",
      passwordHash: salesHash,
    },
  });

  console.log("✅ Users seeded:", adminUser.name, salesOfficer1.name, salesOfficer2.name);

  const carModels = [
    { modelName: "Toyota Glanza",   variant: "G MT" },
    { modelName: "Toyota Glanza",   variant: "V CVT" },
    { modelName: "Toyota Urban Cruiser Hyryder", variant: "S HEV" },
    { modelName: "Toyota Urban Cruiser Hyryder", variant: "V Neo Drive" },
    { modelName: "Toyota Innova Crysta", variant: "GX 7-Seater" },
    { modelName: "Toyota Innova Crysta", variant: "ZX AT" },
    { modelName: "Toyota Innova HyCross", variant: "VX HEV" },
    { modelName: "Toyota Innova HyCross", variant: "ZX(O) HEV" },
    { modelName: "Toyota Fortuner", variant: "4x2 AT" },
    { modelName: "Toyota Fortuner", variant: "Legender 4x4 AT" },
    { modelName: "Toyota Camry", variant: "Hybrid" },
    { modelName: "Toyota Vellfire", variant: "Executive Lounge" },
  ];

  const dbCars: any[] = [];
  for (const car of carModels) {
    const dbCar = await prisma.carModel.upsert({
      where: {
        modelName_variant: {
          modelName: car.modelName,
          variant: car.variant,
        },
      },
      update: {},
      create: {
        modelName: car.modelName,
        variant: car.variant,
        isActive: true,
      },
    });
    dbCars.push(dbCar);
  }

  console.log(`✅ Car models seeded: ${carModels.length} variants across Toyota India lineup`);

  // Seeding historical sales logs for rich charts/leaderboard
  console.log("🌱 Seeding Sales Logs for Anita Sharma and Vikram Patel...");
  await prisma.salesLog.deleteMany({});

  const anitaId = salesOfficer1.id;
  const vikramId = salesOfficer2.id;
  const findCar = (name: string, variant: string) => {
    return dbCars.find(c => c.modelName === name && c.variant === variant)?.id || dbCars[0].id;
  };

  const salesLogsData = [
    // Anita Sharma - Sales Logs
    // March 2026
    { userId: anitaId, carModelId: findCar("Toyota Glanza", "V CVT"), quantity: 4, month: 3, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Urban Cruiser Hyryder", "S HEV"), quantity: 2, month: 3, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Fortuner", "4x2 AT"), quantity: 1, month: 3, year: 2026, status: "APPROVED" },
    // April 2026
    { userId: anitaId, carModelId: findCar("Toyota Innova HyCross", "VX HEV"), quantity: 5, month: 4, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Fortuner", "Legender 4x4 AT"), quantity: 3, month: 4, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Camry", "Hybrid"), quantity: 1, month: 4, year: 2026, status: "APPROVED" },
    // May 2026
    { userId: anitaId, carModelId: findCar("Toyota Glanza", "G MT"), quantity: 8, month: 5, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Innova Crysta", "ZX AT"), quantity: 4, month: 5, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Vellfire", "Executive Lounge"), quantity: 1, month: 5, year: 2026, status: "APPROVED" },
    // June 2026 (Current Month)
    { userId: anitaId, carModelId: findCar("Toyota Glanza", "V CVT"), quantity: 3, month: 6, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Urban Cruiser Hyryder", "V Neo Drive"), quantity: 4, month: 6, year: 2026, status: "APPROVED" },
    { userId: anitaId, carModelId: findCar("Toyota Fortuner", "4x2 AT"), quantity: 2, month: 6, year: 2026, status: "PENDING" },

    // Vikram Patel - Sales Logs
    // March 2026
    { userId: vikramId, carModelId: findCar("Toyota Glanza", "G MT"), quantity: 3, month: 3, year: 2026, status: "APPROVED" },
    { userId: vikramId, carModelId: findCar("Toyota Urban Cruiser Hyryder", "V Neo Drive"), quantity: 1, month: 3, year: 2026, status: "APPROVED" },
    // April 2026
    { userId: vikramId, carModelId: findCar("Toyota Innova Crysta", "GX 7-Seater"), quantity: 4, month: 4, year: 2026, status: "APPROVED" },
    { userId: vikramId, carModelId: findCar("Toyota Fortuner", "4x2 AT"), quantity: 2, month: 4, year: 2026, status: "APPROVED" },
    // May 2026
    { userId: vikramId, carModelId: findCar("Toyota Innova HyCross", "ZX(O) HEV"), quantity: 6, month: 5, year: 2026, status: "APPROVED" },
    { userId: vikramId, carModelId: findCar("Toyota Camry", "Hybrid"), quantity: 2, month: 5, year: 2026, status: "APPROVED" },
    // June 2026
    { userId: vikramId, carModelId: findCar("Toyota Glanza", "V CVT"), quantity: 5, month: 6, year: 2026, status: "APPROVED" },
    { userId: vikramId, carModelId: findCar("Toyota Urban Cruiser Hyryder", "S HEV"), quantity: 3, month: 6, year: 2026, status: "PENDING" },
  ];

  for (const log of salesLogsData) {
    await prisma.salesLog.create({ data: log });
  }
  console.log(`✅ Historical Sales Logs seeded: ${salesLogsData.length} entries`);

  await prisma.incentiveSlab.deleteMany({});

  const slabs = [
    { minUnits: 1,  maxUnits: 3,    incentivePerCar: 1000  },
    { minUnits: 4,  maxUnits: 7,    incentivePerCar: 2500  },
    { minUnits: 8,  maxUnits: 12,   incentivePerCar: 5000  },
    { minUnits: 13, maxUnits: 20,   incentivePerCar: 8000  },
    { minUnits: 21, maxUnits: null,  incentivePerCar: 12000 },
  ];

  await prisma.incentiveSlab.createMany({ data: slabs });

  console.log("✅ Incentive slabs seeded: 5 progressive tiers (₹1,000 → ₹12,000/car)");

  await prisma.slabHistoryLog.create({
    data: {
      snapshot: slabs,
      changedBy: adminUser.email,
    },
  });

  console.log("✅ Slab history snapshot recorded");
  console.log("\n🎉 Database seeding complete! Your application is ready for demonstration.");
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin:  admin@nippytoyota.com / admin123");
  console.log("   Sales:  anita.sharma@nippytoyota.com / sales123");
  console.log("   Sales:  vikram.patel@nippytoyota.com / sales123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
