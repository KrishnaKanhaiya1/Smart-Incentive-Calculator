import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { quantity } = await request.json();

    if (quantity === undefined) {
      return NextResponse.json(
        { error: "quantity is required" },
        { status: 400 }
      );
    }

    const entry = await prisma.salesEntry.findUnique({
      where: { id: params.id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Sales entry not found" },
        { status: 404 }
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

    const updatedEntry = await prisma.salesEntry.update({
      where: { id: params.id },
      data: {
        quantity,
        calculatedIncentive,
      },
      include: { carModel: true },
    });

    return NextResponse.json(updatedEntry);
  } catch (error: any) {
    console.error("Error updating sales entry:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Sales entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update sales entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await prisma.salesEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Sales entry deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting sales entry:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Sales entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete sales entry" },
      { status: 500 }
    );
  }
}
