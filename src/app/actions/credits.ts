"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";

export async function processCreditPurchase(userId: string, amount: number, credits: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) return { success: false, error: "User not found" };

  await prisma.user.update({
    where: { id: userId },
    data: {
        paid_credits: { increment: credits },
        credits: { increment: credits }
    }
  });

  if (user.referred_by) {
    const commission = amount * 0.30;
    const referrer = await prisma.user.findUnique({ where: { id: user.referred_by } });
    if (referrer) {
        await prisma.user.update({
            where: { id: user.referred_by },
            data: { wallet_balance: { increment: commission } }
        });

        await prisma.referral.updateMany({
            where: { referred_user_id: userId },
            data: { status: 'completed', amount: commission }
        });
    }
  }

  return { success: true };
}

export async function submitWithdrawalRequest(amount: number, upiId: string) {
    const user = await getUser();
    if (!user) return { success: false, error: "User not found" };

    const pendingWithdrawals = await prisma.withdrawal.findMany({
        where: { user_id: user.id, status: 'PENDING' }
    });
    const pendingTotal = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);

    if (user.wallet_balance - pendingTotal < amount) {
        return { success: false, error: "Insufficient available balance" };
    }

    if (amount < 100) {
        return { success: false, error: "Minimum withdrawal is ₹100" };
    }

    await prisma.withdrawal.create({
        data: {
            user_id: user.id,
            amount,
            method: 'UPI',
            details: JSON.stringify({ upi_id: upiId }),
            status: 'PENDING'
        }
    });

    return { success: true };
}
