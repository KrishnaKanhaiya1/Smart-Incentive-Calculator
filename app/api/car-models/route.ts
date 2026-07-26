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
    const carModels = await prisma.carModel.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(carModels);
  } catch (error) {
    console.error("Error fetching car models:", error);
    return NextResponse.json(
      { error: "Failed to fetch car models" },
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
    const { name, baseSuffix, variant } = await request.json();

    if (!name || !baseSuffix || !variant) {
      return NextResponse.json(
        { error: "Name, baseSuffix, and variant are required" },
        { status: 400 }
      );
    }

    const carModel = await prisma.carModel.create({
      data: { name, baseSuffix, variant },
    });

    return NextResponse.json(carModel, { status: 201 });
  } catch (error: any) {
    console.error("Error creating car model:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Car model with this name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create car model" },
      { status: 500 }
    );
  }
}
