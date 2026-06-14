import { db } from "@/lib/db/json-db";
import { hashPassword, createToken } from "@/lib/auth-service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Zod Validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { email, mobile, password, username, referralCode } = result.data;

    const existingEmail = await db.users.findOne((u: any) => u.email === email);
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const existingUser = await db.users.findOne((u: any) => u.username === username);
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    let referrerId = null;
    if (referralCode) {
      const referrer = await db.users.findOne((u: any) => u.referral_code === referralCode);
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const user = await db.users.insert({
      email,
      mobile,
      password: hashed,
      username,
      referral_code: userReferralCode,
      referrer_id: referrerId,
      role: "user",
      credit_balance: 0,
      paid_credits: 0,
      wallet_balance: 0,
    });

    if (referrerId) {
      await db.referrals.insert({
        referrer_id: referrerId,
        referred_user_id: user.id,
        status: 'pending',
        amount: 0
      });
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role, is_banned: false });
    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1, // 1 hour
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
