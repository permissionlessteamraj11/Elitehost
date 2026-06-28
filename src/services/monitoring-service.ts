import { prisma } from '@/lib/prisma';
import { VPSManager } from './vps-manager';

export class MonitoringService {
  /**
   * Sync container stats for all active deployments and enforce limits
   */
  static async syncAllStats() {
    const activeDeployments = await prisma.deployment.findMany({
      where: {
        status: 'READY',
        container_id: { not: null }
      },
      include: { plan: true }
    });

    for (const deployment of activeDeployments) {
      if (!deployment.container_id) continue;

      const stats = await VPSManager.getStats(deployment.container_id);
      if (stats) {
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: {
            resource_usage: stats as any,
            updated_at: new Date()
          }
        });

        // Auto-suspend logic for resource abuse
        const cpuValue = parseFloat(stats.cpu.replace('%', ''));
        // Docker limit is enforced at kernel level, but we can detect high usage here for logs/alerts
        if (cpuValue > (deployment.plan.cpu_percent * 100 * 0.95)) {
            console.warn(`High CPU usage on ${deployment.id}: ${cpuValue}%`);
        }
      }
    }
  }

  static async suspendDeployment(id: string, reason: string) {
    const deployment = await prisma.deployment.findUnique({ where: { id } });
    if (deployment?.container_id) {
        await VPSManager.stopContainer(deployment.container_id);
    }

    await prisma.deployment.update({
        where: { id },
        data: {
            status: 'SUSPENDED',
            error_message: reason
        }
    });
  }
}
