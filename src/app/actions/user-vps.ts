"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-service";
import { VPSManager } from "@/services/vps-manager";
import { buildQueue } from "@/services/queues/config";
import { revalidatePath } from "next/cache";

export async function stopDeployment(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const deployment = await prisma.deployment.findUnique({
    where: { id, user_id: user.id }
  });

  if (!deployment || !deployment.container_id) throw new Error("Deployment not found or not active");

  await VPSManager.stopContainer(deployment.container_id);
  await prisma.deployment.update({
    where: { id },
    data: { status: 'STOPPED' }
  });

  revalidatePath('/dashboard/deployments');
  return { success: true };
}

export async function startDeployment(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const deployment = await prisma.deployment.findUnique({
      where: { id, user_id: user.id }
    });

    if (!deployment || !deployment.container_id) throw new Error("Deployment not found or not active");

    await VPSManager.startContainer(deployment.container_id);
    await prisma.deployment.update({
      where: { id },
      data: { status: 'READY' }
    });

    revalidatePath('/dashboard/deployments');
    return { success: true };
}

export async function restartDeployment(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const deployment = await prisma.deployment.findUnique({
      where: { id, user_id: user.id }
    });

    if (!deployment || !deployment.container_id) throw new Error("Deployment not found or not active");

    await VPSManager.restartContainer(deployment.container_id);
    await prisma.deployment.update({
        where: { id },
        data: { status: 'READY' }
    });

    revalidatePath('/dashboard/deployments');
    return { success: true };
}

export async function deleteDeployment(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const deployment = await prisma.deployment.findUnique({
      where: { id, user_id: user.id }
    });

    if (!deployment) throw new Error("Deployment not found");

    if (deployment.container_id) {
        await VPSManager.deleteContainer(deployment.container_id);
    }

    await prisma.deployment.delete({ where: { id } });

    revalidatePath('/dashboard/deployments');
    return { success: true };
}

export async function redeploy(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const deployment = await prisma.deployment.findUnique({
      where: { id, user_id: user.id }
    });

    if (!deployment) throw new Error("Deployment not found");

    await prisma.deployment.update({
        where: { id },
        data: { status: 'PENDING', logs: "" }
    });

    await buildQueue.add('build', { deploymentId: id, userId: user.id });

    revalidatePath('/dashboard/deployments');
    return { success: true };
}
