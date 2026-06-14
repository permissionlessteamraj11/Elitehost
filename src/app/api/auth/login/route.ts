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
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }
    const { identifier, password } = result.data;

    // Check for IP-based lockout
    const attempts = await (db as any).admin_attempts?.find((a: any) => a.ip === ip && new Date(a.created_at) > new Date(Date.now() - 15 * 60 * 1000));
    if (attempts && attempts.length >= 5) {
      const { blockIP } = await import('@/app/actions/platform');
      await blockIP(ip);
      return NextResponse.json({ error: "Too many failed attempts. Your IP has been blocked for 15 minutes." }, { status: 429 });
    }

    const user = await db.users.findOne((u: any) => u.email === identifier || u.mobile === identifier);

    if (!user) {
      await (db as any).admin_attempts?.insert({ ip, identifier, success: false });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.is_banned) {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      await (db as any).admin_attempts?.insert({ ip, identifier, success: false });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Clear failed attempts on success
    await (db as any).admin_attempts?.delete((a: any) => a.ip === ip || a.identifier === identifier);

    const token = await createToken({ userId: user.id, email: user.email, role: user.role, is_banned: !!user.is_banned });
    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1, // 1 hour
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
