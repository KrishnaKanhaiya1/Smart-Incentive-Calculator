import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const where: any = {};
    if (month !== undefined) where.month = month;
    if (year !== undefined) where.year = year;
    if (role !== "ADMIN") {
      where.userId = userId;
    }

    const entries = await prisma.salesEntry.findMany({
      where,
      include: {
        carModel: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching sales entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { month, year, carModelId, quantity } = await request.json();

    if (!month || !year || !carModelId || quantity === undefined) {
      return NextResponse.json(
        { error: "month, year, carModelId, and quantity are required" },
        { status: 400 }
      );
    }

    // Get the applicable incentive slab
    const slab = await prisma.incentiveSlab.findFirst({
      where: {
        minRange: { lte: quantity },
        OR: [
          { maxRange: null },
          { maxRange: { gte: quantity } }
        ]
      },
    });

    const calculatedIncentive = slab ? slab.incentiveAmount * quantity : 0;
    const userId = (session.user as any).id;

    // Use upsert to handle updates cleanly and avoid P2002 errors
    const entry = await prisma.salesEntry.upsert({
      where: {
        userId_month_year_carModelId: {
          userId,
          month,
          year,
          carModelId,
        },
      },
      update: {
        quantity,
        calculatedIncentive,
      },
      create: {
        userId,
        month,
        year,
        carModelId,
        quantity,
        calculatedIncentive,
      },
      include: { carModel: true },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error("Error creating/updating sales entry:", error);
    return NextResponse.json(
      { error: "Failed to save sales entry" },
      { status: 500 }
    );
  }
}
