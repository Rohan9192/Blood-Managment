import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["PENDING", "APPROVED", "FULFILLED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isRequester = request.requesterId === session.user.id;

    if (!isAdmin && !isRequester) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── BLOOD STOCK MANAGEMENT ──
    // Deduct stock when admin APPROVES (reserves the blood from inventory)
    if (status === "APPROVED" && isAdmin && request.status === "PENDING") {
      const stock = await prisma.bloodStock.findUnique({
        where: { bloodGroup: request.bloodGroup },
      });
      if (!stock || stock.unitsAvailable < request.units) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${stock?.unitsAvailable ?? 0} unit(s) of ${request.bloodGroup.replace("_"," ")} available.` },
          { status: 400 }
        );
      }
      await prisma.bloodStock.update({
        where: { bloodGroup: request.bloodGroup },
        data: { unitsAvailable: { decrement: request.units } },
      });
    }

    // Restore stock if an APPROVED request is later REJECTED (un-reserve)
    if (status === "REJECTED" && isAdmin && request.status === "APPROVED") {
      await prisma.bloodStock.update({
        where: { bloodGroup: request.bloodGroup },
        data: { unitsAvailable: { increment: request.units } },
      });
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { status },
      include: { requester: { select: { name: true, email: true } } },
    });

    const { sendRequestStatusEmail } = await import("@/lib/mail");
    const { createNotification } = await import("@/lib/notifications");

    const bloodLabel = updated.bloodGroup.replace("_", " ");
    const notifMap: Record<string, { title: string; type: "INFO"|"SUCCESS"|"WARNING"|"CRITICAL" }> = {
      APPROVED:  { title: "Blood Request Approved ✓",  type: "INFO"    },
      FULFILLED: { title: "Blood Delivered! 🩸",         type: "SUCCESS" },
      REJECTED:  { title: "Blood Request Rejected",     type: "WARNING" },
    };

    if (notifMap[updated.status]) {
      await createNotification({
        userId: request.requesterId,
        title: notifMap[updated.status].title,
        message: `Your request for ${request.units} unit(s) of ${bloodLabel} has been ${updated.status.toLowerCase()}.`,
        type: notifMap[updated.status].type,
        link: "/requests",
      });
    }

    await Promise.allSettled([
      sendRequestStatusEmail(updated.requester.email, updated.status, updated.bloodGroup, updated.units),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update request status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
