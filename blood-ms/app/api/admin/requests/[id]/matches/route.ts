import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Blood compatibility map: which donor groups can give to which recipients
const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  A_POS:  ["A_POS", "A_NEG", "O_POS", "O_NEG"],
  A_NEG:  ["A_NEG", "O_NEG"],
  B_POS:  ["B_POS", "B_NEG", "O_POS", "O_NEG"],
  B_NEG:  ["B_NEG", "O_NEG"],
  AB_POS: ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"],
  AB_NEG: ["A_NEG", "B_NEG", "AB_NEG", "O_NEG"],
  O_POS:  ["O_POS", "O_NEG"],
  O_NEG:  ["O_NEG"],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const compatibleGroups = BLOOD_COMPATIBILITY[request.bloodGroup] ?? [request.bloodGroup];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const donors = await prisma.donor.findMany({
      where: {
        bloodGroup: { in: compatibleGroups as any },
        status: "APPROVED",
        availability: true,
        OR: [
          { lastDonationDate: null },
          { lastDonationDate: { lt: threeMonthsAgo } },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
        donationHistory: { select: { donatedAt: true } },
      },
      orderBy: { lastDonationDate: "asc" }, // prioritize those who donated longest ago
    });

    // Score each donor: more time since last donation = higher score
    const scoredDonors = donors.map((donor) => {
      const daysSinceLastDonation = donor.lastDonationDate
        ? Math.floor((Date.now() - donor.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // never donated = top priority

      const totalDonations = donor.donationHistory.length;

      // Exact blood match gets priority bonus
      const isExactMatch = donor.bloodGroup === request.bloodGroup;

      const score = daysSinceLastDonation + totalDonations * 5 + (isExactMatch ? 100 : 0);

      return {
        id: donor.id,
        userId: donor.userId,
        name: donor.user.name,
        email: donor.user.email,
        bloodGroup: donor.bloodGroup,
        location: donor.location,
        age: donor.age,
        totalDonations,
        lastDonationDate: donor.lastDonationDate,
        daysSinceLastDonation,
        isExactMatch,
        score,
      };
    });

    // Sort descending by score (best match first)
    scoredDonors.sort((a, b) => b.score - a.score);

    return NextResponse.json({ 
      requestBloodGroup: request.bloodGroup,
      compatibleGroups,
      matches: scoredDonors.slice(0, 20), // top 20 matches
    });

  } catch (error) {
    console.error("Donor matching error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
