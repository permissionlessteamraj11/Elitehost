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

    const newBalance = (Number(user.credit_balance) || 0) + amount;
    await db.users.update((u: any) => u.id === userId, { credit_balance: newBalance });
    return { success: true, newBalance };
}

export async function approvePaymentRequest(requestId: string) {
    const dbTyped = db as any;
    const request = await dbTyped.payment_requests.findOne((r: any) => r.id === requestId);
    if (!request) return { success: false, error: "Request not found" };

    const user = await db.users.findOne((u: any) => u.id === request.user_id);
    if (!user) return { success: false, error: "User not found" };

    // Assuming 1 credit per ₹20 for simplicity, or just using request.credits if defined
    const creditsToAdd = request.credits || Math.floor(request.amount / 20);

    await db.users.update((u: any) => u.id === user.id, {
        credit_balance: (Number(user.credit_balance) || 0) + creditsToAdd
    });

    await dbTyped.payment_requests.update((r: any) => r.id === requestId, { status: 'approved' });
    return { success: true };
}
