import { prisma } from "@/lib/prisma";
import { VPSManager } from "@/services/vps-manager";

export async function cleanupExpiredDeployments() {
  const now = new Date();

  // 1. Expire trials
  const expiredTrials = await prisma.trialClaim.findMany({
    where: { expires_at: { lt: now } },
    include: { user: true }
  });

  for (const trial of expiredTrials) {
      // Find deployments for this user that were trial-based
      const deployments = await prisma.deployment.findMany({
          where: { user_id: trial.user_id, is_free: true, status: { not: 'EXPIRED' } }
      });

      for (const d of deployments) {
          if (d.container_id) {
              await VPSManager.stopContainer(d.container_id);
          }
          await prisma.deployment.update({
              where: { id: d.id },
              data: { status: 'EXPIRED' }
          });
      }
      // Delete the trial claim so it doesn't process again
      await prisma.trialClaim.delete({ where: { id: trial.id } });
  }

  // 2. Generic deployment expiration
  const expiredDeployments = await prisma.deployment.findMany({
      where: { expires_at: { lt: now }, status: { notIn: ['EXPIRED', 'STOPPED'] } }
  });

  for (const d of expiredDeployments) {
      if (d.container_id) {
          await VPSManager.stopContainer(d.container_id);
      }
      await prisma.deployment.update({
          where: { id: d.id },
          data: { status: 'EXPIRED' }
      });
  }
}
