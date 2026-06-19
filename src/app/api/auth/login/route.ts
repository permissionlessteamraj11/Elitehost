import { db } from "@/lib/db/json-db";
import { comparePassword, createToken } from "@/lib/auth-service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      console.error('Login validation failed:', result.error.format());
      return NextResponse.json({
        error: "Invalid input",
        details: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }, { status: 400 });
    }
    const { identifier, password } = result.data;

    // Check for IP-based lockout (15 min window)
    const dbTyped = db as any;
    const attempts = dbTyped.admin_attempts ? await dbTyped.admin_attempts.find((a: any) => a.ip === ip && new Date(a.created_at) > new Date(Date.now() - 15 * 60 * 1000)) : [];
    if (attempts && attempts.length >= 5) {
      const { blockIP } = await import('@/app/actions/platform');
      await blockIP(ip);
      return NextResponse.json({ error: "Too many failed attempts. Your IP has been blocked for 15 minutes." }, { status: 429 });
    }

    const user = await db.users.findOne((u: any) => u.email === identifier || u.mobile === identifier);

    if (!user) {
      if (dbTyped.admin_attempts) {
        await dbTyped.admin_attempts.insert({ ip, identifier, success: false });
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.is_banned) {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      if (dbTyped.admin_attempts) {
        await dbTyped.admin_attempts.insert({ ip, identifier, success: false });
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Clear failed attempts on success
    if (dbTyped.admin_attempts) {
      await dbTyped.admin_attempts.delete((a: any) => a.ip === ip || a.identifier === identifier);
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role, is_banned: !!user.is_banned });
    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1, // 1 hour
    });

    const { password: _, password_plain: __, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Critical login error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json({
      error: "An internal server error occurred",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
