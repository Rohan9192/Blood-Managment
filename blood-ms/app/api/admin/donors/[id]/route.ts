import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        donationHistory: { orderBy: { donatedAt: "desc" } },
      },
    });

    if (!donor) return NextResponse.json({ error: "Donor not found" }, { status: 404 });

    return NextResponse.json(donor);
  } catch (error) {
    console.error("Admin get donor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
