"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserBan(userId: string, isBanned: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { is_banned: !isBanned },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: isBanned ? 'UNBAN_USER' : 'BAN_USER',
        user_id: userId, // In a real app, this should be the admin's ID
        metadata: JSON.stringify({ target_user_id: userId })
      }
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adjustUserCredits(userId: string, amount: number) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADJUST_CREDITS',
        user_id: userId,
        metadata: JSON.stringify({ amount })
      }
    });

    revalidatePath('/admin');
    return { success: true, newBalance: user.credits };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDashboardStats() {
  const [userCount, deploymentCount, activeDeploymentCount, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.deployment.count(),
    prisma.deployment.count({ where: { status: 'READY' } }),
    prisma.payment.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true }
    })
  ]);

  return {
    userCount,
    deploymentCount,
    activeDeploymentCount,
    revenue: totalRevenue._sum.amount || 0
  };
}
