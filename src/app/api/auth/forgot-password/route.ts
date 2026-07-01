import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, don't reveal if user exists
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: token,
        reset_expires: expires
      }
    });

    // In production, send email via Resend
    console.log(`[EMAIL MOCK] Password reset link for ${email}: http://localhost:3000/auth/reset-password?token=${token}`);

    return NextResponse.json({ success: true, message: "Reset link sent successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
