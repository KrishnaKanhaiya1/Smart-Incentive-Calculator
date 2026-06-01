import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeAlphanumeric } from "@/lib/sanitize";
import { logAuditEvent } from "@/lib/auditLog";

/** PUT /api/admin/cars/:id — Updates a car model by ID. Requires ADMIN role. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  const user = await getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    await logAuditEvent(user?.userId || "unknown", "ACCESS_DENIED", "car", null, {}, "FAILURE");
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();
    let { modelName, variant, isActive } = body as {
      modelName?: unknown;
      variant?: unknown;
      isActive?: unknown;
    };

    // Sanitize inputs if they are provided
    try {
      if (modelName !== undefined) {
        modelName = sanitizeAlphanumeric(modelName, 100);
      }
      if (variant !== undefined) {
        variant = sanitizeAlphanumeric(variant, 100);
      }
    } catch (err) {
      await logAuditEvent(user.userId, "UPDATE_CAR", "car", id, { error: "Invalid alphanumeric characters in inputs" }, "FAILURE");
      return NextResponse.json(
        { error: "Model name and variant contain invalid characters." },
        { status: 400 }
      );
    }

    const existingCar = await prisma.carModel.findUnique({
      where: { id },
    });

    if (!existingCar) {
      await logAuditEvent(user.userId, "UPDATE_CAR", "car", id, { error: "Car model not found" }, "FAILURE");
      return NextResponse.json(
        { error: "Car model not found." },
        { status: 404 }
      );
    }

    const updateData: { modelName?: string; variant?: string; isActive?: boolean } = {};

    if (typeof modelName === "string" && modelName.trim()) {
      updateData.modelName = modelName.trim();
    }

    if (typeof variant === "string" && variant.trim()) {
      updateData.variant = variant.trim();
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const finalModelName = updateData.modelName ?? existingCar.modelName;
    const finalVariant = updateData.variant ?? existingCar.variant;

    if (updateData.modelName !== undefined || updateData.variant !== undefined) {
      const duplicate = await prisma.carModel.findUnique({
        where: {
          modelName_variant: {
            modelName: finalModelName,
            variant: finalVariant,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        await logAuditEvent(user.userId, "UPDATE_CAR", "car", id, { error: "Duplicate vehicle model variant configuration" }, "FAILURE");
        return NextResponse.json(
          { error: `Car model "${finalModelName} — ${finalVariant}" already exists.` },
          { status: 409 }
        );
      }
    }

    const updatedCar = await prisma.carModel.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent(user.userId, "UPDATE_CAR", "car", id, {
      modelName: updatedCar.modelName,
      variant: updatedCar.variant,
      isActive: updatedCar.isActive,
    }, "SUCCESS");

    return NextResponse.json({ car: updatedCar }, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/cars/[id]] Error:", error);
    await logAuditEvent(user.userId, "UPDATE_CAR", "car", id, { error: "Database transaction or system crash" }, "FAILURE");
    return NextResponse.json(
      { error: "Failed to update car model." },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/cars/:id — Deletes a car model by ID. Requires ADMIN role. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limitResponse = rateLimit(request);
  if (limitResponse) return limitResponse;

  const user = await getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    await logAuditEvent(user?.userId || "unknown", "ACCESS_DENIED", "car", null, {}, "FAILURE");
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const existingCar = await prisma.carModel.findUnique({
      where: { id },
    });

    if (!existingCar) {
      await logAuditEvent(user.userId, "DELETE_CAR", "car", id, { error: "Car model not found" }, "FAILURE");
      return NextResponse.json(
        { error: "Car model not found." },
        { status: 404 }
      );
    }

    await prisma.carModel.delete({ where: { id } });

    await logAuditEvent(user.userId, "DELETE_CAR", "car", id, {
      modelName: existingCar.modelName,
      variant: existingCar.variant,
    }, "SUCCESS");

    return NextResponse.json(
      { message: "Car model deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/admin/cars/[id]] Error:", error);
    await logAuditEvent(user.userId, "DELETE_CAR", "car", id, { error: "Database transaction or system crash" }, "FAILURE");
    return NextResponse.json(
      { error: "Failed to delete car model." },
      { status: 500 }
    );
  }
}
