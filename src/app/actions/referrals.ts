"use server";

import { db } from "@/lib/db/json-db";
import { getUser } from "@/lib/auth-service";

export async function getReferralStats() {
    const user = await getUser();
    if (!user) return null;

    const referrals = await db.referrals.find((r: any) => r.referrer_id === user.id);

    // Enrich with referred user info
    const allUsers = await db.users.read();
    const enrichedReferrals = referrals.map((r: any) => ({
        ...r,
        referred: allUsers.find((u: any) => u.id === r.referred_user_id)
    }));

    return {
        referrals: enrichedReferrals,
        stats: {
            totalRefers: referrals.length,
            activeRefers: referrals.filter((r: any) => r.status === 'completed').length,
            totalEarnings: referrals.reduce((acc: number, r: any) => acc + (r.status === 'completed' ? Number(r.amount || 0) : 0), 0),
            walletBalance: Number(user.wallet_balance || 0)
        }
    };
}
