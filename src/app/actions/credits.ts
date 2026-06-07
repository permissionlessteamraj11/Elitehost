"use server";

import { supabase } from "@/lib/supabase";

export async function processCreditPurchase(userId: string, amount: number, credits: number) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('credit_balance, referrer_id')
    .eq('id', userId)
    .single();

  if (userError || !user) return { success: false, error: "User not found" };

  const { error: updateError } = await supabase
    .from('users')
    .update({ credit_balance: Number(user.credit_balance) + credits })
    .eq('id', userId);

  if (updateError) return { success: false, error: "Failed to update credits" };

  if (user.referrer_id) {
    // 30% commission added to wallet_balance
    const commission = amount * 0.30;

    const { data: referrer } = await supabase.from('users').select('wallet_balance').eq('id', user.referrer_id).single();
    if (referrer) {
        await supabase.from('users').update({
            wallet_balance: Number(referrer.wallet_balance || 0) + commission
        }).eq('id', user.referrer_id);

        // Record the referral event
        await supabase.from('referrals').update({
            status: 'completed',
            reward_amount: commission
        }).eq('referred_id', userId);
    }
  }

  return { success: true };
}

export async function submitWithdrawalRequest(userId: string, amount: number, upiId: string) {
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

    if (userError || !user) return { success: false, error: "User not found" };

    if (Number(user.wallet_balance) < amount) {
        return { success: false, error: "Insufficient wallet balance" };
    }

    if (amount < 500) {
        return { success: false, error: "Minimum withdrawal is ₹500" };
    }

    const { error: withdrawError } = await supabase.from('withdrawals').insert({
        user_id: userId,
        amount,
        upi_id: upiId,
        status: 'pending'
    });

    if (withdrawError) return { success: false, error: "Failed to submit request" };

    // Deduct from wallet immediately to prevent double spend
    await supabase.from('users').update({
        wallet_balance: Number(user.wallet_balance) - amount
    }).eq('id', userId);

    return { success: true };
}
