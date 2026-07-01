import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.email_verified) {
        return NextResponse.json({ success: true, message: "Email already verified." });
    }

    // In a real app, send a code/link to email.
    // Here we provide the ready-infrastructure
    console.log(`[EMAIL MOCK] Verification link for ${user.email}: http://localhost:3000/api/auth/verify-email?token=ready-token`);

    return NextResponse.json({ success: true, message: "Verification email sent." });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    // Simple verification logic for demonstration
    if (token === 'ready-token') {
        const user = await getUser();
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { email_verified: new Date() }
            });
            return NextResponse.redirect(new URL('/dashboard?verified=true', req.url));
        }
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
}
