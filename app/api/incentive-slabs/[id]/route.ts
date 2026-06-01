import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await checkAdminAccess();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { minRange, maxRange, incentiveAmount } = await request.json();

    const slab = await prisma.incentiveSlab.update({
      where: { id: params.id },
      data: { minRange, maxRange, incentiveAmount },
    });

    return NextResponse.json(slab);
  } catch (error: any) {
    console.error("Error updating incentive slab:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Incentive slab not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update incentive slab" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await checkAdminAccess();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await prisma.incentiveSlab.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Incentive slab deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting incentive slab:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Incentive slab not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete incentive slab" },
      { status: 500 }
    );
  }
}
