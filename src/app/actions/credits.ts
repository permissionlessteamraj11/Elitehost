"use server";

import { db } from "@/lib/db/json-db";
import { getUser } from "@/lib/auth-service";

export async function processCreditPurchase(userId: string, amount: number, credits: number) {
  const user = await db.users.findOne((u: any) => u.id === userId);

  if (!user) return { success: false, error: "User not found" };

  await db.users.update((u: any) => u.id === userId, {
    credit_balance: Number(user.credit_balance || 0) + credits
  });

  if (user.referrer_id) {
    // 30% commission added to wallet_balance
    const commission = amount * 0.30;

    const referrer = await db.users.findOne((u: any) => u.id === user.referrer_id);
    if (referrer) {
        await db.users.update((u: any) => u.id === user.referrer_id, {
            wallet_balance: Number(referrer.wallet_balance || 0) + commission
        });

        // Record the referral event
        await db.referrals.update((r: any) => r.referred_user_id === userId, {
            status: 'completed',
            amount: commission
        });
    }
  }

  return { success: true };
}

export async function submitWithdrawalRequest(amount: number, upiId: string) {
    const user = await getUser();
    if (!user) return { success: false, error: "User not found" };

    // Calculate pending withdrawals to check actual available balance
    const pendingWithdrawals = await db.withdrawals.find((w: any) => w.user_id === user.id && w.status === 'pending');
    const pendingTotal = pendingWithdrawals.reduce((acc: number, w: any) => acc + Number(w.amount), 0);

    if (Number(user.wallet_balance || 0) - pendingTotal < amount) {
        return { success: false, error: "Insufficient available balance (subtracting pending requests)" };
    }

    if (amount < 100) {
        return { success: false, error: "Minimum withdrawal is ₹100" };
    }

    await db.withdrawals.insert({
        user_id: user.id,
        amount,
        upi_id: upiId,
        status: 'pending'
    });

    return { success: true };
}
