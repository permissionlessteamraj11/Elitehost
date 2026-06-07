"use server";

import { supabase } from "@/lib/supabase";

export async function getPlatformSetting(key: string) {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) return null;
  return data.value;
}

export async function updatePlatformSetting(key: string, value: any) {
  const { error } = await supabase
    .from('platform_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getPendingWithdrawals() {
    const { data, error } = await supabase
        .from('withdrawals')
        .select('*, users(username, email)')
        .eq('status', 'pending');

    if (error) return [];
    return data;
}

export async function updateWithdrawalStatus(id: string, status: 'approved' | 'rejected') {
    // If rejected, refund the wallet
    if (status === 'rejected') {
        const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('id', id).single();
        if (withdrawal) {
            const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', withdrawal.user_id).single();
            if (user) {
                await supabase.from('users').update({
                    wallet_balance: Number(user.wallet_balance) + Number(withdrawal.amount)
                }).eq('id', withdrawal.user_id);
            }
        }
    }

    const { error } = await supabase
        .from('withdrawals')
        .update({ status })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
