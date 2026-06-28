"use server";

import { prisma } from "@/lib/prisma";
import { VPSManager } from "@/services/vps-manager";
import { revalidatePath } from "next/cache";

export async function checkExpirations() {
  const now = new Date();

  // Find expired deployments that are still READY or BUILDING
  const expired = await prisma.deployment.findMany({
    where: {
      expires_at: { lt: now },
      status: { in: ['READY', 'BUILDING'] }
    }
  });

  for (const dep of expired) {
    if (dep.container_id) {
        await VPSManager.stopContainer(dep.container_id);
    }
    await prisma.deployment.update({
        where: { id: dep.id },
        data: { status: 'SUSPENDED', error_message: 'Plan expired' }
    });
  }

  return { suspendedCount: expired.length };
}

export async function renewDeployment(userId: string, deploymentId: string) {
    try {
        const deployment = await prisma.deployment.findUnique({
            where: { id: deploymentId },
            include: { plan: true }
        });
        if (!deployment || deployment.user_id !== userId) throw new Error("Not found");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.credits < deployment.plan.price) throw new Error("Insufficient credits");

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { credits: { decrement: deployment.plan.price } }
            }),
            prisma.deployment.update({
                where: { id: deploymentId },
                data: {
                    expires_at: new Date(deployment.expires_at!.getTime() + 30 * 24 * 60 * 60 * 1000),
                    status: deployment.status === 'SUSPENDED' ? 'READY' : deployment.status
                }
            })
        ]);

        if (deployment.status === 'SUSPENDED' && deployment.container_id) {
            await VPSManager.startContainer(deployment.container_id);
        }

        revalidatePath('/dashboard/deployments');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
