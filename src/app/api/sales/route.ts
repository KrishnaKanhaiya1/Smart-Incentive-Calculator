import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

/** GET /api/sales — Returns active car models, slabs, and saved sales logs for the authenticated user. */
export async function GET(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const [cars, slabs] = await prisma.$transaction([
      prisma.carModel.findMany({ where: { isActive: true }, orderBy: { modelName: "asc" } }),
      prisma.incentiveSlab.findMany({ orderBy: { minUnits: "asc" } }),
    ]);

    // Use the authenticated user's ID — no more client-supplied userId
    if (monthParam && yearParam) {
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);

      if (
        !isNaN(month) && month >= 1 && month <= 12 &&
        !isNaN(year) && year >= 2000
      ) {
        const logs = await prisma.salesLog.findMany({
          where: {
            userId: user.userId,
            month,
            year,
          },
          select: {
            carModelId: true,
            quantity: true,
            status: true,
          },
        });

        return NextResponse.json(
          { cars, slabs, savedRecords: logs },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ cars, slabs }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/sales] Database error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard configuration." },
      { status: 500 }
    );
  }
}

/** POST /api/sales — Atomic upsert for monthly sales logs. Requires authenticated user. */
export async function POST(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { month, year, records } = body as {
      month: number;
      year: number;
      records: { carModelId: string; quantity: number }[];
    };

    // Use authenticated user's ID — prevent IDOR
    const userId = user.userId;

    if (
      typeof month !== "number" || month < 1 || month > 12 ||
      typeof year !== "number" || year < 2000 ||
      !Array.isArray(records)
    ) {
      return NextResponse.json(
        { error: "Invalid payload. Required: month (1-12), year, records array." },
        { status: 400 }
      );
    }

    const allRecords = records.map((r) => ({
      carModelId: r.carModelId,
      quantity: Math.max(0, Math.floor(Number(r.quantity) || 0)),
    })).filter((r) => typeof r.carModelId === "string" && r.carModelId.trim());

    const validRecords = allRecords.filter((r) => r.quantity > 0);
    const zeroRecords = allRecords.filter((r) => r.quantity === 0);

    const operations = [];

    // Upsert records with quantity > 0
    for (const record of validRecords) {
      operations.push(
        prisma.salesLog.upsert({
          where: {
            userId_carModelId_month_year: {
              userId,
              carModelId: record.carModelId,
              month: Math.floor(month),
              year: Math.floor(year),
            },
          },
          update: { quantity: record.quantity, status: "PENDING" },
          create: {
            userId,
            carModelId: record.carModelId,
            month: Math.floor(month),
            year: Math.floor(year),
            quantity: record.quantity,
            status: "PENDING",
          },
        })
      );
    }

    // Delete records that were set back to 0 (cleanup stale data)
    for (const record of zeroRecords) {
      operations.push(
        prisma.salesLog.deleteMany({
          where: {
            userId,
            carModelId: record.carModelId,
            month: Math.floor(month),
            year: Math.floor(year),
          },
        })
      );
    }

    if (operations.length === 0) {
      return NextResponse.json(
        { message: "No changes to save." },
        { status: 200 }
      );
    }

    await prisma.$transaction(operations);
    return NextResponse.json(
      { message: "Monthly sales logs committed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/sales] Transaction error:", error);
    return NextResponse.json(
      { error: "Failed to save sales records. Please retry." },
      { status: 500 }
    );
  }
}
