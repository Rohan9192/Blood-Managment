import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { donorEmails, bloodGroup, units, location } = await req.json();

    if (!donorEmails || donorEmails.length === 0) {
      return NextResponse.json({ error: "No donors selected" }, { status: 400 });
    }

    const t = getTransporter();
    const emailPromises = donorEmails.map((email: string) =>
      t.sendMail({
        from: '"BloodLink Emergency" <no-reply@bloodlink.com>',
        to: email,
        subject: `🚨 URGENT: Emergency Blood Donation Request - ${bloodGroup}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fff0f0; border: 2px solid #e11d48; padding: 24px; border-radius: 12px;">
            <h2 style="color: #e11d48; margin: 0 0 16px;">🚨 Emergency Blood Request</h2>
            <p style="font-size: 16px;">A critical blood shortage has been detected. Your blood type is urgently needed!</p>
            <div style="background: #fff; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #e11d48;">
              <p><strong>Blood Group Required:</strong> ${bloodGroup.replace("_", " ")}</p>
              <p><strong>Units Needed:</strong> ${units}</p>
              <p><strong>Location:</strong> ${location}</p>
            </div>
            <p>If you are able to donate, please contact the blood bank immediately or log in to your BloodLink dashboard to register your availability.</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">You received this because you are a registered BloodLink donor. To opt out, contact support.</p>
          </div>
        `,
      })
    );

    await Promise.allSettled(emailPromises);

    return NextResponse.json({ 
      message: `Emergency broadcast sent to ${donorEmails.length} donors`,
      count: donorEmails.length,
    });
  } catch (error) {
    console.error("Emergency broadcast error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
