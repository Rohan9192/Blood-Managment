import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { donorSchema } from "@/lib/validations";
import { getCompatibleGroups } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const location = searchParams.get("location");
    const compatible = searchParams.get("compatible") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: "APPROVED",
      availability: true,
    };

    if (bloodGroup && bloodGroup !== "ALL") {
      if (compatible) {
        // Expand to all medically compatible donor groups
        const compatibleGroups = getCompatibleGroups(bloodGroup);
        where.bloodGroup = { in: compatibleGroups };
      } else {
        where.bloodGroup = bloodGroup;
      }
    }
    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.donor.count({ where }),
    ]);

    return NextResponse.json({
      donors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get donors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = donorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingDonor = await prisma.donor.findUnique({
      where: { userId: session.user.id },
    });

    if (existingDonor) {
      return NextResponse.json({ error: "Donor profile already exists" }, { status: 409 });
    }

    const donor = await prisma.donor.create({
      data: {
        userId: session.user.id!,
        bloodGroup: parsed.data.bloodGroup,
        age: parsed.data.age,
        location: parsed.data.location,
        contactNumber: parsed.data.contactNumber,
        lastDonationDate: parsed.data.lastDonationDate
          ? new Date(parsed.data.lastDonationDate)
          : null,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(donor, { status: 201 });
  } catch (error) {
    console.error("Create donor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
