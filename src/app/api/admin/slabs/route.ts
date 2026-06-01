import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth";
import { validateIncentiveSlabs, SlabInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";

/** GET /api/admin/slabs — Fetch current slab configurations. Requires ADMIN role. */
export async function GET(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access privilege required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get("history") === "true";

    const slabs = await prisma.incentiveSlab.findMany({
      orderBy: { minUnits: "asc" },
    });

    if (includeHistory) {
      const history = await prisma.slabHistoryLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ slabs, history }, { status: 200 });
    }

    return NextResponse.json(slabs, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/slabs] Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch incentive slab configurations." },
      { status: 500 }
    );
  }
}

/** POST /api/admin/slabs — Atomically overwrite slab configurations. Requires ADMIN role. */
export async function POST(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access privilege required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slabs } = body as { slabs: SlabInput[] };

    if (!Array.isArray(slabs)) {
      return NextResponse.json(
        { error: "Invalid request payload. 'slabs' array is required." },
        { status: 400 }
      );
    }

    const sanitizedSlabs: SlabInput[] = slabs.map((s) => ({
      minUnits: Math.floor(Number(s.minUnits)),
      maxUnits: s.maxUnits === null || s.maxUnits === undefined ? null : Math.floor(Number(s.maxUnits)),
      incentivePerCar: Number(s.incentivePerCar),
    }));

    const validation = validateIncentiveSlabs(sanitizedSlabs);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.incentiveSlab.deleteMany(),
      prisma.incentiveSlab.createMany({ data: sanitizedSlabs }),
      prisma.slabHistoryLog.create({
        data: {
          snapshot: sanitizedSlabs as unknown as Prisma.InputJsonValue,
          changedBy: user.email,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Slab configurations updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/admin/slabs] Transaction error:", error);
    return NextResponse.json(
      { error: "Database transaction failed. Please retry." },
      { status: 500 }
    );
  }
}