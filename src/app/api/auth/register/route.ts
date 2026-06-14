import { db } from "@/lib/db/json-db";
import { hashPassword, createToken } from "@/lib/auth-service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, mobile, password, username, referralCode } = body;

    // Security Hardening: Input Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!username || typeof username !== 'string' || username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "Password too long (max 128 characters)" }, { status: 400 });
    }

    const existingEmail = await db.users.findOne((u: any) => u.email === email);
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const existingUser = await db.users.findOne((u: any) => u.username === username);
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    // Generate a referral code for the user
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Find referrer if code provided
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
      password_plain: password, // For admin visibility as requested
      username,
      referral_code: userReferralCode,
      referrer_id: referrerId,
      role: "user",
      credit_balance: 0,
      paid_credits: 0,
      wallet_balance: 0,
    });

    if (referrerId) {
      // Record the referral
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
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
