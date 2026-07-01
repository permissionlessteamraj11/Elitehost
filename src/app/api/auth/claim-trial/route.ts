import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.trial_claimed) {
      return NextResponse.json({ error: "Trial already claimed" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
          credits: { increment: 2 },
          trial_claimed: true
      }
    });

    await prisma.trialClaim.create({
      data: {
          user_id: user.id,
          expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000)
      }
    });

    await prisma.transaction.create({
      data: {
          user_id: user.id,
          amount: 2,
          type: 'TRIAL_CLAIM',
          description: '3-hour free trial credits'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
