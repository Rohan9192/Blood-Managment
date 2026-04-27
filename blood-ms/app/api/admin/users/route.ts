import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role && role !== "ALL") where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          donor: { select: { id: true, bloodGroup: true, status: true, availability: true } },
          requests: { select: { id: true }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
    }

    // action: "approve_donor" | "reject_donor"
    if (action === "approve_donor" || action === "reject_donor") {
      const status = action === "approve_donor" ? "APPROVED" : "REJECTED";
      const donor = await prisma.donor.update({
        where: { userId },
        data: { status },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        userId: donor.user.id,
        title: status === "APPROVED" ? "🎉 Donor Profile Approved!" : "Donor Profile Rejected",
        message: status === "APPROVED"
          ? "Your donor profile has been verified and approved. You can now receive donation requests."
          : "Your donor profile was reviewed and could not be approved at this time. Please contact support.",
        type: status === "APPROVED" ? "SUCCESS" : "WARNING",
        link: "/profile",
      });

      return NextResponse.json(donor);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
