import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../../lib/auth";

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
    const { name, baseSuffix, variant } = await request.json();

    const carModel = await prisma.carModel.update({
      where: { id: params.id },
      data: { name, baseSuffix, variant },
    });

    return NextResponse.json(carModel);
  } catch (error: any) {
    console.error("Error updating car model:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Car model not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update car model" },
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
    await prisma.carModel.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Car model deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting car model:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Car model not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete car model" },
      { status: 500 }
    );
  }
}
