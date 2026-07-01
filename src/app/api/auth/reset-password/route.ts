import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    const user = await prisma.user.findFirst({
        where: {
            reset_token: token,
            reset_expires: { gte: new Date() }
        }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        reset_token: null,
        reset_expires: null
      }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
