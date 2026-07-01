"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";

export async function getReferralStats() {
    const user = await getUser();
    if (!user) return null;

    const referrals = await prisma.referral.findMany({
        where: { referrer_id: user.id },
        include: { referred_user: true }
    });

    return {
        referrals: referrals,
        stats: {
            totalRefers: referrals.length,
            activeRefers: referrals.filter((r: any) => r.status === 'completed').length,
            totalEarnings: referrals.reduce((acc: number, r: any) => acc + (r.status === 'completed' ? Number(r.amount || 0) : 0), 0),
            walletBalance: user.wallet_balance
        }
    };
}
