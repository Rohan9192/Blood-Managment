import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BLOOD_GROUPS = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"] as const;

// Simple linear regression: returns predicted value at x = forecastDays
function linearRegression(points: { x: number; y: number }[]): number {
  const n = points.length;
  if (n === 0) return 0;
  if (n === 1) return points[0].y;

  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return sumY / n;

  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return Math.max(0, slope * 7 + intercept); // 7-day forecast
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all fulfilled requests in the last 30 days
    const recentRequests = await prisma.request.findMany({
      where: {
        status: "FULFILLED",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { bloodGroup: true, units: true, createdAt: true },
    });

    // Get current stock
    const stockData = await prisma.bloodStock.findMany();
    const stockMap  = Object.fromEntries(stockData.map((s) => [s.bloodGroup, s.unitsAvailable]));

    const predictions = BLOOD_GROUPS.map((bg) => {
      const groupRequests = recentRequests.filter((r) => r.bloodGroup === bg);

      // Build daily demand points for regression
      const dailyMap: Record<number, number> = {};
      groupRequests.forEach((r) => {
        const dayIndex = Math.floor(
          (r.createdAt.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
        );
        dailyMap[dayIndex] = (dailyMap[dayIndex] ?? 0) + r.units;
      });

      const points = Object.entries(dailyMap).map(([x, y]) => ({ x: Number(x), y }));
      const avgDailyDemand = points.length > 0
        ? points.reduce((s, p) => s + p.y, 0) / 30
        : 0;

      const predictedWeeklyDemand = Math.round(linearRegression(points));
      const currentStock           = stockMap[bg] ?? 0;
      const daysOfSupply           = avgDailyDemand > 0
        ? Math.floor(currentStock / avgDailyDemand)
        : 999;

      const risk: "CRITICAL" | "HIGH" | "MODERATE" | "SAFE" =
        daysOfSupply < 3   ? "CRITICAL" :
        daysOfSupply < 7   ? "HIGH"     :
        daysOfSupply < 14  ? "MODERATE" : "SAFE";

      return {
        bloodGroup: bg,
        currentStock,
        predictedWeeklyDemand,
        avgDailyDemand: Math.round(avgDailyDemand * 10) / 10,
        daysOfSupply: daysOfSupply === 999 ? null : daysOfSupply,
        trend: points.length >= 2
          ? (points[points.length - 1].y > points[0].y ? "INCREASING" : "DECREASING")
          : "STABLE",
        risk,
        totalRequestsLast30Days: groupRequests.length,
      };
    });

    // Sort by risk severity
    const riskOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, SAFE: 3 };
    predictions.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

    return NextResponse.json({
      predictions,
      generatedAt: new Date().toISOString(),
      dataRangedays: 30,
    });
  } catch (error) {
    console.error("AI Prediction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
