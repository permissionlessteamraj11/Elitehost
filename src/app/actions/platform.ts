"use server";

import { prisma } from "@/lib/prisma";

export async function getPlatformSetting(key: string) {
  const setting = await prisma.platformSetting.findUnique({
    where: { key }
  });

  if (!setting) return null;
  return JSON.parse(setting.value as string);
}

export async function updatePlatformSetting(key: string, value: any) {
  await prisma.platformSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value), updated_at: new Date() },
    create: { key, value: JSON.stringify(value), updated_at: new Date() }
  });

  return { success: true };
}

export async function getPendingWithdrawals() {
    return await prisma.withdrawal.findMany({
        where: { status: 'PENDING' },
        include: { user: true }
    });
}

export async function updateWithdrawalStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    if (status === 'APPROVED') {
        const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
        if (withdrawal) {
            const user = await prisma.user.findUnique({ where: { id: withdrawal.user_id } });
            if (user) {
                if (user.wallet_balance < withdrawal.amount) {
                    return { success: false, error: "User has insufficient balance now." };
                }
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        wallet_balance: user.wallet_balance - withdrawal.amount
                    }
                });
            }
        }
    }

    await prisma.withdrawal.update({
        where: { id },
        data: { status }
    });

    return { success: true };
}

export async function getAdminData() {
    const [users, projects, deployments, payments] = await Promise.all([
        prisma.user.findMany(),
        prisma.project.findMany(),
        prisma.deployment.findMany(),
        prisma.payment.findMany()
    ]);

    return {
        users,
        projects,
        paymentRequests: payments,
        userCount: users.length,
        projectCount: projects.length,
        deployCount: deployments.filter((d: any) => d.status === 'READY').length,
    };
}

export async function updateUserCredits(userId: string, amount: number) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            paid_credits: { increment: amount },
            credits: { increment: amount }
        }
    });
    return { success: true, newBalance: user.credits };
}

export async function banUser(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { is_banned: true }
    });
    return { success: true };
}

export async function blockIP(ip: string, reason?: string) {
    await prisma.bannedIP.upsert({
        where: { ip },
        update: { reason },
        create: { ip, reason }
    });
    return { success: true };
}

export async function unbanUser(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { is_banned: false }
    });
    return { success: true };
}

export async function getBannedIPs() {
    return await prisma.bannedIP.findMany();
}

export async function removeBannedIP(ip: string) {
    await prisma.bannedIP.delete({ where: { ip } });
    return { success: true };
}

import { processCreditPurchase } from "./credits";

export async function approvePaymentRequest(requestId: string) {
    const request = await prisma.payment.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Request not found" };

    if (request.status !== 'PENDING') return { success: false, error: "Request already processed" };

    const creditsToAdd = request.credits || Math.floor(request.amount / 20);
    const res = await processCreditPurchase(request.user_id, request.amount, creditsToAdd);

    if (res.success) {
        await prisma.payment.update({
            where: { id: requestId },
            data: { status: 'APPROVED' }
        });
        return { success: true };
    }

    return { success: false, error: res.error };
}
