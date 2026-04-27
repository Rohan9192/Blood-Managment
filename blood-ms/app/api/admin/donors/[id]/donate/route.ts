import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const donor = await prisma.donor.findUnique({ where: { id } });
    if (!donor) return NextResponse.json({ error: "Donor not found" }, { status: 404 });

    if (donor.status !== "APPROVED") {
      return NextResponse.json({ error: "Donor is not approved" }, { status: 400 });
    }

    // Check 90 day eligibility
    if (donor.lastDonationDate) {
      const daysSince = Math.floor((Date.now() - donor.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 90) {
        return NextResponse.json({ error: `Donor must wait ${90 - daysSince} more days before donating again` }, { status: 400 });
      }
    }

    // Log donation and update blood stock in one transaction
    const now = new Date();
    const [donationRecord] = await prisma.$transaction([
      prisma.donationHistory.create({
        data: {
          donorId: id,
          units: 1,
          donatedAt: now,
        },
      }),
      prisma.donor.update({
        where: { id },
        data: { lastDonationDate: now },
      }),
      prisma.bloodStock.update({
        where: { bloodGroup: donor.bloodGroup },
        data: { unitsAvailable: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ message: "Donation logged and blood stock updated!", donation: donationRecord });
  } catch (error) {
    console.error("Log donation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
