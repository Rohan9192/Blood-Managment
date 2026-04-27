import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required. Used by QR code scanner.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const donor = await prisma.donor.findUnique({
      where: { id },
      select: {
        id: true,
        bloodGroup: true,
        age: true,
        location: true,
        contactNumber: true,
        availability: true,
        status: true,
        lastDonationDate: true,
        donationHistory: {
          select: { id: true, donatedAt: true, units: true },
          orderBy: { donatedAt: "desc" },
        },
        user: {
          select: { name: true },
        },
      },
    });

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    // Only expose approved donors publicly
    if (donor.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Donor profile is not publicly available" },
        { status: 403 }
      );
    }

    return NextResponse.json(donor);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
