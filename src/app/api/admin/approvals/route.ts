import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    // Fetch all sales logs with PENDING status
    const pendingLogs = await prisma.salesLog.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        carModel: {
          select: {
            id: true,
            modelName: true,
            variant: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group them by userId, month, year
    const groups: Record<string, {
      userId: string;
      userName: string;
      userEmail: string;
      month: number;
      year: number;
      records: { carModelId: string; carModelName: string; carVariant: string; quantity: number; logId: string }[];
    }> = {};

    for (const log of pendingLogs) {
      const key = `${log.userId}-${log.month}-${log.year}`;
      if (!groups[key]) {
        groups[key] = {
          userId: log.userId,
          userName: log.user?.name || "Unknown",
          userEmail: log.user?.email || "",
          month: log.month,
          year: log.year,
          records: []
        };
      }
      groups[key].records.push({
        carModelId: log.carModelId,
        carModelName: log.carModel?.modelName || "",
        carVariant: log.carModel?.variant || "",
        quantity: log.quantity,
        logId: log.id
      });
    }

    return NextResponse.json(Object.values(groups), { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/approvals] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, month, year, action, records } = body;

    if (!userId || !month || !year || !action) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (action === "APPROVE") {
      const operations = [];

      // If admin updated the quantities during approval
      if (Array.isArray(records)) {
        for (const r of records) {
          const qty = Math.max(0, Math.floor(Number(r.quantity) || 0));
          if (qty > 0) {
            operations.push(
              prisma.salesLog.upsert({
                where: {
                  userId_carModelId_month_year: {
                    userId,
                    carModelId: r.carModelId,
                    month,
                    year,
                  }
                },
                update: { quantity: qty, status: "APPROVED" },
                create: {
                  userId,
                  carModelId: r.carModelId,
                  month,
                  year,
                  quantity: qty,
                  status: "APPROVED"
                }
              })
            );
          } else {
            // Delete if set to 0
            operations.push(
              prisma.salesLog.deleteMany({
                where: {
                  userId,
                  carModelId: r.carModelId,
                  month,
                  year,
                }
              })
            );
          }
        }
      }

      // Also bulk-approve any other logs for this user/month/year
      operations.push(
        prisma.salesLog.updateMany({
          where: {
            userId,
            month,
            year,
          },
          data: { status: "APPROVED" }
        })
      );

      await prisma.$transaction(operations);
      return NextResponse.json({ message: "Sales logs approved successfully." }, { status: 200 });

    } else if (action === "REJECT") {
      // Set status to REJECTED
      await prisma.salesLog.updateMany({
        where: {
          userId,
          month,
          year,
        },
        data: { status: "REJECTED" }
      });

      return NextResponse.json({ message: "Sales logs rejected." }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/admin/approvals] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
