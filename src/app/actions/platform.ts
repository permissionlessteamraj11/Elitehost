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
    if (status === 'approved') {
        const withdrawal = await db.withdrawals.findOne((w: any) => w.id === id);
        if (withdrawal) {
            const user = await db.users.findOne((u: any) => u.id === withdrawal.user_id);
            if (user) {
                if (Number(user.wallet_balance) < Number(withdrawal.amount)) {
                    return { success: false, error: "User has insufficient balance now." };
                }
                await db.users.update((u: any) => u.id === user.id, {
                    wallet_balance: Number(user.wallet_balance) - Number(withdrawal.amount)
                });
            }
        }
    }

    await db.withdrawals.update((w: any) => w.id === id, { status });

    return { success: true };
}

export async function getAdminData() {
    const users = await db.users.read();
    const projects = await db.projects.read();
    const deployments = await db.deployments.read();
    const paymentRequests = await (db as any).payment_requests?.read() || [];

    return {
        users,
        projects,
        paymentRequests,
        userCount: users.length,
        projectCount: projects.length,
        deployCount: deployments.filter((d: any) => d.status === 'ready').length,
    };
}

export async function updateUserCredits(userId: string, amount: number) {
    const user = await db.users.findOne((u: any) => u.id === userId);
    if (!user) return { success: false, error: "User not found" };

    // Admin added credits are considered paid credits
    const newBalance = (Number(user.paid_credits) || 0) + amount;
    await db.users.update((u: any) => u.id === userId, { paid_credits: newBalance });
    return { success: true, newBalance };
}

export async function banUser(userId: string) {
    await db.users.update((u: any) => u.id === userId, { is_banned: true });
    return { success: true };
}

export async function blockIP(ip: string) {
    await db.banned_ips.insert({ ip, created_at: new Date().toISOString() });
    return { success: true };
}

export async function unbanUser(userId: string) {
    await db.users.update((u: any) => u.id === userId, { is_banned: false });
    return { success: true };
}

import { processCreditPurchase } from "./credits";

export async function approvePaymentRequest(requestId: string) {
    const dbTyped = db as any;
    const request = await dbTyped.payment_requests.findOne((r: any) => r.id === requestId);
    if (!request) return { success: false, error: "Request not found" };

    const user = await db.users.findOne((u: any) => u.id === request.user_id);
    if (!user) return { success: false, error: "User not found" };

    // Use processCreditPurchase to handle balance and referrals (commission)
    const creditsToAdd = request.credits || Math.floor(request.amount / 20);
    const res = await processCreditPurchase(user.id, request.amount, creditsToAdd);

    if (res.success) {
        await dbTyped.payment_requests.update((r: any) => r.id === requestId, { status: 'approved' });
        return { success: true };
    }

    return { success: false, error: res.error };
}
