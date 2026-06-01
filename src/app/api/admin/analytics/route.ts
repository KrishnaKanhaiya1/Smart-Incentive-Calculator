import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

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

    // Fetch slabs to calculate payout dynamically
    const slabs = await prisma.incentiveSlab.findMany({
      orderBy: { minUnits: "asc" },
    });

    // Helper: flat-rate calculator based on dynamic slabs
    const getIncentive = (quantity: number) => {
      if (quantity <= 0 || slabs.length === 0) return 0;
      const currentTier = [...slabs]
        .sort((a, b) => a.minUnits - b.minUnits)
        .find((slab) => {
          if (slab.maxUnits === null) return quantity >= slab.minUnits;
          return quantity >= slab.minUnits && quantity <= slab.maxUnits;
        });
      const rate = currentTier ? currentTier.incentivePerCar : 0;
      return quantity * rate;
    };

    // Fetch all users with role SALES to ensure they are on the leaderboard
    const salesUsers = await prisma.user.findMany({
      where: { role: "SALES" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Fetch all approved sales logs with user and car model details
    const salesLogs = await prisma.salesLog.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        carModel: {
          select: {
            id: true,
            modelName: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 1. Leaderboard (Sales officers sorted by units sold / payout)
    const officerMap: Record<string, { id: string; name: string; email: string; units: number; payout: number }> = {};
    for (const u of salesUsers) {
      officerMap[u.id] = {
        id: u.id,
        name: u.name,
        email: u.email,
        units: 0,
        payout: 0,
      };
    }
    
    // 2. Monthly Trend (Units & payout grouped by month/year)
    const trendMap: Record<string, { month: number; year: number; label: string; units: number; payout: number }> = {};
    
    // 3. Model Distribution (Units & payout by model)
    const modelMap: Record<string, { name: string; variant: string; units: number; payout: number }> = {};

    for (const log of salesLogs) {
      const { user: salesUser, carModel, quantity, month, year } = log;
      const incentive = getIncentive(quantity);

      // Leaderboard calculation
      if (salesUser && salesUser.role === "SALES") {
        if (!officerMap[salesUser.id]) {
          officerMap[salesUser.id] = {
            id: salesUser.id,
            name: salesUser.name,
            email: salesUser.email,
            units: 0,
            payout: 0,
          };
        }
        officerMap[salesUser.id].units += quantity;
        officerMap[salesUser.id].payout += incentive;
      }

      // Trend calculation
      const trendKey = `${year}-${String(month).padStart(2, "0")}`;
      if (!trendMap[trendKey]) {
        const monthLabel = new Date(year, month - 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        trendMap[trendKey] = {
          month,
          year,
          label: monthLabel,
          units: 0,
          payout: 0,
        };
      }
      trendMap[trendKey].units += quantity;
      trendMap[trendKey].payout += incentive;

      // Model calculation
      if (carModel) {
        const modelKey = `${carModel.modelName} (${carModel.variant})`;
        if (!modelMap[modelKey]) {
          modelMap[modelKey] = {
            name: carModel.modelName,
            variant: carModel.variant,
            units: 0,
            payout: 0,
          };
        }
        modelMap[modelKey].units += quantity;
        modelMap[modelKey].payout += incentive;
      }
    }

    const leaderboard = Object.values(officerMap).sort((a, b) => b.payout - a.payout);
    const trends = Object.values(trendMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const modelStats = Object.values(modelMap).sort((a, b) => b.units - a.units);

    // Compute totals
    const totalUnits = salesLogs.reduce((acc, log) => acc + log.quantity, 0);
    const totalPayout = leaderboard.reduce((acc, off) => acc + off.payout, 0);

    return NextResponse.json(
      {
        totalUnits,
        totalPayout,
        leaderboard,
        trends,
        modelStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/admin/analytics] Database error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard analytics." },
      { status: 500 }
    );
  }
}
