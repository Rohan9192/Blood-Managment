import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // Check if user already exists in main User db
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Verify OTP was completed successfully
    const otpRecord = await prisma.otpVerification.findUnique({ where: { email } });
    if (!otpRecord || !otpRecord.isVerified) {
      return NextResponse.json({ error: "Please verify your email before creating an account" }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role,
        emailVerified: new Date() // they passed the OTP check!
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Clean up OTP record
    await prisma.otpVerification.delete({ where: { email } });

    return NextResponse.json({ message: "Account created successfully", user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
