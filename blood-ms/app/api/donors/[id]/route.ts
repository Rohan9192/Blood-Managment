import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { donorSchema } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        donationHistory: { orderBy: { donatedAt: "desc" }, take: 10 },
      },
    });

    if (!donor) return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    return NextResponse.json(donor);
  } catch (error) {
    console.error("Get donor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const donor = await prisma.donor.findUnique({ where: { id } });
    if (!donor) return NextResponse.json({ error: "Donor not found" }, { status: 404 });

    const isOwner = donor.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Admin can update status
    if (isAdmin && body.status) {
      const updated = await prisma.donor.update({
        where: { id },
        data: { status: body.status },
        include: { user: { select: { name: true, email: true } } },
      });
      return NextResponse.json(updated);
    }

    // Availability toggle
    if (typeof body.availability === "boolean") {
      const updated = await prisma.donor.update({
        where: { id },
        data: { availability: body.availability },
        include: { user: { select: { name: true, email: true } } },
      });
      return NextResponse.json(updated);
    }

    const parsed = donorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.donor.update({
      where: { id },
      data: {
        bloodGroup: parsed.data.bloodGroup,
        age: parsed.data.age,
        location: parsed.data.location,
        contactNumber: parsed.data.contactNumber,
        lastDonationDate: parsed.data.lastDonationDate ? new Date(parsed.data.lastDonationDate) : null,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update donor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.donor.delete({ where: { id } });
    return NextResponse.json({ message: "Donor deleted" });
  } catch (error) {
    console.error("Delete donor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
