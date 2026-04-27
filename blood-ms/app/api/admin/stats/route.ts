import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalDonors,
      totalRequests,
      pendingDonors,
      pendingRequests,
      criticalRequests,
      bloodStock,
      recentRequests,
      recentDonors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.donor.count({ where: { status: "APPROVED" } }),
      prisma.request.count(),
      prisma.donor.count({ where: { status: "PENDING" } }),
      prisma.request.count({ where: { status: "PENDING" } }),
      prisma.request.count({ where: { urgency: "CRITICAL", status: "PENDING" } }),
      prisma.bloodStock.findMany({ orderBy: { bloodGroup: "asc" } }),
      prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { requester: { select: { name: true } } },
      }),
      prisma.donor.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const requestsByStatus = await prisma.request.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const requestsByBloodGroup = await prisma.request.groupBy({
      by: ["bloodGroup"],
      _count: { _all: true },
      _sum: { units: true },
    });

    return NextResponse.json({
      totalUsers,
      totalDonors,
      totalRequests,
      pendingDonors,
      pendingRequests,
      criticalRequests,
      bloodStock,
      recentRequests,
      recentDonors,
      requestsByStatus,
      requestsByBloodGroup,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
