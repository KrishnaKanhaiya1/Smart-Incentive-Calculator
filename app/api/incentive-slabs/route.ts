import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../lib/auth";

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const slabs = await prisma.incentiveSlab.findMany({
      orderBy: { minRange: "asc" },
    });
    return NextResponse.json(slabs);
  } catch (error) {
    console.error("Error fetching incentive slabs:", error);
    return NextResponse.json(
      { error: "Failed to fetch incentive slabs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await checkAdminAccess();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { minRange, maxRange, incentiveAmount } = await request.json();

    if (minRange === undefined || incentiveAmount === undefined) {
      return NextResponse.json(
        { error: "minRange and incentiveAmount are required" },
        { status: 400 }
      );
    }

    const slab = await prisma.incentiveSlab.create({
      data: { minRange, maxRange, incentiveAmount },
    });

    return NextResponse.json(slab, { status: 201 });
  } catch (error: any) {
    console.error("Error creating incentive slab:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Slab with this range already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create incentive slab" },
      { status: 500 }
    );
  }
}
