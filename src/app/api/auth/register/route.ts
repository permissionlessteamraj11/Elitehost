import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth-service";
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: "Invalid input",
        details: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }, { status: 400 });
    }

    const { email, password, username, referralCode } = result.data;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    let referrerId = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referral_code: referralCode } });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const freePlanSetting = await prisma.platformSetting.findUnique({ where: { key: 'free_plan_enabled' } });
    const freePlanEnabled = freePlanSetting ? JSON.parse(freePlanSetting.value as string) : true;
    const initialCredits = freePlanEnabled === true ? 2 : 0;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        username,
        referral_code: userReferralCode,
        referred_by: referrerId,
        credits: initialCredits,
      }
    });

    if (referrerId) {
      await prisma.referral.create({
        data: {
          referrer_id: referrerId,
          referred_user_id: user.id,
          status: 'pending',
          amount: 0
        }
      });
    }

    await createSession(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Critical registration error:', error);
    return NextResponse.json({
      error: "An internal server error occurred",
    }, { status: 500 });
  }
}
