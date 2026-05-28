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
    const commission = amount * 0.20;

    const { data: referrer } = await supabase.from('users').select('credit_balance').eq('id', user.referrer_id).single();
    if (referrer) {
        await supabase.from('users').update({
            credit_balance: Number(referrer.credit_balance) + (commission / 10)
        }).eq('id', user.referrer_id);
    }
  }

  return { success: true };
}

export async function submitWithdrawalRequest(userId: string, amount: number, upiId: string) {
    return { success: true };
}
