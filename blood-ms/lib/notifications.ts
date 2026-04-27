import { prisma } from "@/lib/prisma";

type NotifType = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export async function createNotification({
  userId,
  title,
  message,
  type = "INFO",
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type?: NotifType;
  link?: string;
}) {
  try {
    return await prisma.notification.create({
      data: { userId, title, message, type, link },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

// Notify all ADMINs
export async function notifyAdmins({
  title,
  message,
  type = "INFO",
  link,
}: {
  title: string;
  message: string;
  type?: NotifType;
  link?: string;
}) {
  try {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await prisma.notification.createMany({
      data: admins.map((a) => ({ userId: a.id, title, message, type, link })),
    });
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
