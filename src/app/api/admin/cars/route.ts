import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeAlphanumeric } from "@/lib/sanitize";
import { logAuditEvent } from "@/lib/auditLog";

/** GET /api/admin/cars — Returns all car models. Requires ADMIN role. */
export async function GET(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      await logAuditEvent(user?.userId || "unknown", "ACCESS_DENIED", "car", null, {}, "FAILURE");
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const cars = await prisma.carModel.findMany({
      orderBy: [{ modelName: "asc" }, { variant: "asc" }],
    });

    return NextResponse.json({ cars }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/cars] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch car models." },
      { status: 500 }
    );
  }
}

/** POST /api/admin/cars — Creates a new car model. Requires ADMIN role. */
export async function POST(request: NextRequest) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      await logAuditEvent(user?.userId || "unknown", "ACCESS_DENIED", "car", null, {}, "FAILURE");
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    let { modelName, variant } = body as {
      modelName: unknown;
      variant: unknown;
    };

    // Sanitize inputs
    try {
      modelName = sanitizeAlphanumeric(modelName, 100);
      variant = sanitizeAlphanumeric(variant, 100);
    } catch (err) {
      await logAuditEvent(user.userId, "CREATE_CAR", "car", null, { error: "Invalid input" }, "FAILURE");
      return NextResponse.json(
        { error: "Model name and variant contain invalid characters." },
        { status: 400 }
      );
    }

    if (typeof modelName !== "string" || !modelName.trim()) {
      return NextResponse.json(
        { error: "Model name is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (typeof variant !== "string" || !variant.trim()) {
      return NextResponse.json(
        { error: "Variant is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const trimmedModelName = modelName.trim();
    const trimmedVariant = variant.trim();

    const existing = await prisma.carModel.findUnique({
      where: {
        modelName_variant: {
          modelName: trimmedModelName,
          variant: trimmedVariant,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Car model "${trimmedModelName} — ${trimmedVariant}" already exists.` },
        { status: 409 }
      );
    }

    const car = await prisma.carModel.create({
      data: {
        modelName: trimmedModelName,
        variant: trimmedVariant,
        isActive: true,
      },
    });

    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/cars] Error:", error);
    return NextResponse.json(
      { error: "Failed to create car model." },
      { status: 500 }
    );
  }
}
