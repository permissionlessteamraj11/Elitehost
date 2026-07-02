import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

export async function claimTrial() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  if (user.trial_claimed) {
    throw new Error("Trial already claimed");
  }

  // Claim 2 credits as trial
  await prisma.user.update({
    where: { id: user.id },
    data: {
        credits: { increment: 2 },
        trial_claimed: true
    }
  });

  await prisma.trialClaim.create({
    data: {
        user_id: user.id,
        expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
    }
  });

  await prisma.transaction.create({
    data: {
        user_id: user.id,
        amount: 2,
        type: 'TRIAL_CLAIM',
        description: '3-hour free trial credits'
    }
  });

  // Schedule cleanup job here if using a dedicated queue
  // For now we assume a cron job or manual check handles expiration

  revalidatePath('/dashboard/credits');
  return { success: true };
}
