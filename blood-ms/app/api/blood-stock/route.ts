import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stock = await prisma.bloodStock.findMany({
      orderBy: { bloodGroup: "asc" },
    });
    return NextResponse.json(stock);
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
        create: { bloodGroup, unitsAvailable: units },
        update: { unitsAvailable: { increment: units } },
      });
    } else if (operation === "decrement") {
      updatedStock = await prisma.bloodStock.upsert({
        where: { bloodGroup },
        create: { bloodGroup, unitsAvailable: 0 },
        update: { unitsAvailable: { decrement: units } },
      });
    } else {
      // Set absolute value
      updatedStock = await prisma.bloodStock.upsert({
        where: { bloodGroup },
        create: { bloodGroup, unitsAvailable: units },
        update: { unitsAvailable: units },
      });
    }

    return NextResponse.json(updatedStock);
  } catch (error) {
    console.error("Update blood stock error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
