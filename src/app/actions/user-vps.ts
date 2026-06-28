"use server";

import { prisma } from "@/lib/prisma";
import { VPSManager } from "@/services/vps-manager";
import { revalidatePath } from "next/cache";
import { verifyAuth } from "@/lib/auth-service";

export async function purchasePlan(planId: string, subdomain: string, name: string) {
  try {
    const session = await verifyAuth();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!user || !plan) throw new Error("User or Plan not found");
    if (user.credits < plan.price) throw new Error("Insufficient credits");

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: plan.price } }
      });

      await tx.payment.create({
        data: {
          user_id: user.id,
          amount: plan.price,
          credits: 0,
          transaction_id: `BUY-${Date.now()}`,
          status: 'APPROVED',
        }
      });

      const deployment = await tx.deployment.create({
        data: {
          user_id: user.id,
          plan_id: plan.id,
          name: name,
          subdomain: subdomain,
          status: 'PENDING',
          config: {
            image: 'nginx:alpine',
            env: {}
          },
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      return deployment;
    });

    revalidatePath('/dashboard');
    return { success: true, deployment: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deployApplication(deploymentId: string) {
  try {
    const session = await verifyAuth();
    if (!session) throw new Error("Unauthorized");

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { plan: true }
    });

    if (!deployment || deployment.user_id !== session.userId) throw new Error("Unauthorized");
    if (deployment.status === 'READY') return { success: true, message: "Already deployed" };

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'BUILDING' }
    });

    const containerName = `elite-${deployment.subdomain}-${deployment.id.slice(0, 4)}`;

    // Find an available port on the host
    const port = await VPSManager.findAvailablePort(20000, 30000);

    const containerId = await VPSManager.createContainer({
      name: containerName,
      image: (deployment.config as any).image || 'nginx:alpine',
      memoryLimit: `${deployment.plan.ram_mb}m`,
      cpuLimit: deployment.plan.cpu_percent,
      ports: { container: 80, host: port },
      env: (deployment.config as any).env
    });

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'READY',
        container_id: containerId,
        port: port,
        deployed_at: new Date()
      }
    });

    revalidatePath('/dashboard/deployments');
    return { success: true, containerId };
  } catch (error: any) {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'ERROR', error_message: error.message }
    });
    return { success: false, error: error.message };
  }
}
