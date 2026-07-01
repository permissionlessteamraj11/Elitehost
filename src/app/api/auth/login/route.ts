import { prisma } from "@/lib/prisma";
import { comparePassword, createSession, logAudit } from "@/lib/auth-service";
import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: "Invalid input",
        details: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }, { status: 400 });
    }
    const { identifier, password } = result.data;

    // Check for IP-based lockout (15 min window)
    const attempts = await prisma.adminAttempt.findMany({
        where: {
            ip,
            success: false,
            created_at: { gte: new Date(Date.now() - 15 * 60 * 1000) }
        }
    });

    if (attempts.length >= 5) {
        return NextResponse.json({ error: "Too many failed attempts. Your IP has been temporarily blocked." }, { status: 429 });
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        }
    });

    if (!user) {
      await prisma.adminAttempt.create({ data: { ip, identifier, success: false } });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.is_banned) {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      await prisma.adminAttempt.create({ data: { ip, identifier, success: false } });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Clear failed attempts on success
    await prisma.adminAttempt.deleteMany({ where: { OR: [{ ip }, { identifier }] } });

    await createSession(user.id, user.role, body.rememberMe);
    await logAudit(user.id, 'LOGIN', { ip });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Critical login error:', error);
    return NextResponse.json({
      error: "An internal server error occurred",
    }, { status: 500 });
  }
}
