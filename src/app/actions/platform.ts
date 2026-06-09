"use server";

import { db } from "@/lib/db/json-db";

export async function getPlatformSetting(key: string) {
  const { data } = await db.platform_settings.from()
    .eq('key', key);

  const setting = data[0];
  if (!setting) return null;
  return setting.value;
}

export async function updatePlatformSetting(key: string, value: any) {
  await db.platform_settings.from()
    .upsert({ key, value, updated_at: new Date().toISOString() });

  return { success: true };
}

export async function getPendingWithdrawals() {
    const { data } = await db.withdrawals.from()
        .eq('status', 'pending');

    const users = await db.users.read();
    return data.map((w: any) => ({
        ...w,
        users: users.find((u: any) => u.id === w.user_id)
    }));
}

export async function updateWithdrawalStatus(id: string, status: 'approved' | 'rejected') {
    if (status === 'rejected') {
        const { data: withdrawal } = (await db.withdrawals.from().eq('id', id)).single();
        if (withdrawal) {
            const { data: user } = (await db.users.from().eq('id', withdrawal.user_id)).single();
            if (user) {
                await db.users.from().update({
                    wallet_balance: Number(user.wallet_balance) + Number(withdrawal.amount)
                }).eq('id', withdrawal.user_id);
            }
        }
    }

    await db.withdrawals.from()
        .update({ status })
        .eq('id', id);

    return { success: true };
}

export async function getAdminData() {
    const users = await db.users.read();
    const projects = await db.projects.read();
    const deployments = await db.deployments.read();

    return {
        users,
        projects,
        userCount: users.length,
        projectCount: projects.length,
        deployCount: deployments.filter((d: any) => d.status === 'ready').length,
    };
}
