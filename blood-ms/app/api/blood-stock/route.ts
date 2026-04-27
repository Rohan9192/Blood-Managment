import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Auto-seed any missing blood group rows so stock is never empty
    const ALL_GROUPS = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"] as const;
    const existing = await prisma.bloodStock.findMany();
    const existingGroups = new Set(existing.map(e => e.bloodGroup));
    const missing = ALL_GROUPS.filter(g => !existingGroups.has(g));
    if (missing.length > 0) {
      await prisma.bloodStock.createMany({
        data: missing.map(bloodGroup => ({ bloodGroup, unitsAvailable: 0 })),
        skipDuplicates: true,
      });
    }
    const stock = await prisma.bloodStock.findMany({ orderBy: { bloodGroup: "asc" } });
    return NextResponse.json(stock, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Get blood stock error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { bloodGroup, units, operation } = await req.json();

    if (!bloodGroup || units === undefined) {
      return NextResponse.json({ error: "bloodGroup and units are required" }, { status: 400 });
    }

    let updatedStock;
    if (operation === "increment") {
      updatedStock = await prisma.bloodStock.upsert({
        where: { bloodGroup },
        create: { bloodGroup, unitsAvailable: Math.max(0, units) },
        update: { unitsAvailable: { increment: units } },
      });
    } else if (operation === "decrement") {
      // Prevent going below 0
      const current = await prisma.bloodStock.findUnique({ where: { bloodGroup } });
      const newVal = Math.max(0, (current?.unitsAvailable ?? 0) - units);
      updatedStock = await prisma.bloodStock.upsert({
        where: { bloodGroup },
        create: { bloodGroup, unitsAvailable: 0 },
        update: { unitsAvailable: newVal },
      });
    } else {
      // "set" — absolute value
      updatedStock = await prisma.bloodStock.upsert({
        where: { bloodGroup },
        create: { bloodGroup, unitsAvailable: Math.max(0, units) },
        update: { unitsAvailable: Math.max(0, units) },
      });
    }

    return NextResponse.json(updatedStock);
  } catch (error) {
    console.error("Update blood stock error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
