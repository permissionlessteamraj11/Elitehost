"use server";

import { db } from "@/lib/db/json-db";
import { getUser } from "@/lib/auth-service";

export async function processCreditPurchase(userId: string, amount: number, credits: number) {
  const { data: user } = (await db.users.from().eq('id', userId)).single();

  if (!user) return { success: false, error: "User not found" };

  await db.users.from().update({
    credit_balance: Number(user.credit_balance || 0) + credits
  }).eq('id', userId);

  if (user.referrer_id) {
    // 30% commission added to wallet_balance
    const commission = amount * 0.30;

    const { data: referrer } = (await db.users.from().eq('id', user.referrer_id)).single();
    if (referrer) {
        await db.users.from().update({
            wallet_balance: Number(referrer.wallet_balance || 0) + commission
        }).eq('id', user.referrer_id);

        // Record the referral event
        await db.referrals.from().update({
            status: 'completed',
            amount: commission // Note: using 'amount' based on my new referrals action logic
        }).eq('referred_user_id', userId);
    }
  }

  return { success: true };
}

export async function submitWithdrawalRequest(amount: number, upiId: string) {
    const user = await getUser();
    if (!user) return { success: false, error: "User not found" };

    if (Number(user.wallet_balance || 0) < amount) {
        return { success: false, error: "Insufficient wallet balance" };
    }

    if (amount < 500) {
        return { success: false, error: "Minimum withdrawal is ₹500" };
    }

    await db.withdrawals.from().insert({
        user_id: user.id,
        amount,
        upi_id: upiId,
        status: 'pending'
    });

    // Deduct from wallet immediately to prevent double spend
    await db.users.from().update({
        wallet_balance: Number(user.wallet_balance) - amount
    }).eq('id', user.id);

    return { success: true };
}
