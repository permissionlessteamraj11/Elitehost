import { db } from "@/lib/db/json-db";
import { hashPassword, createToken } from "@/lib/auth-service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    const existingEmail = await db.users.findOne((u: any) => u.email === email);
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const existingUser = await db.users.findOne((u: any) => u.username === username);
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const user = await db.users.insert({
      email,
      password: hashed,
      username,
      role: "user",
      credit_balance: 2.0,
      wallet_balance: 0,
    });

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
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
