import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth-service';
import { buildQueue } from '@/services/queues/config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: deploymentId } = await params;
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId, user_id: user.id },
        include: { versions: true }
    });

    if (!deployment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, deployment, versions: deployment.versions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: deploymentId } = await params;
    const { config, changes } = await request.json();

    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId, user_id: user.id } });
    if (!deployment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existingVersions = await prisma.deploymentVersion.count({ where: { deployment_id: deploymentId } });

    const newVersion = await prisma.deploymentVersion.create({
        data: {
            deployment_id: deploymentId,
            version: existingVersions + 1,
            config: typeof config === 'string' ? config : JSON.stringify(config),
            changes
        }
    });

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        config: typeof config === 'string' ? config : JSON.stringify(config),
      }
    });

    return NextResponse.json({ success: true, version: newVersion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: deploymentId } = await params;
    const { action, version } = await request.json();

    if (action === 'rollback') {
      const versionRecord = await prisma.deploymentVersion.findFirst({
          where: { deployment_id: deploymentId, version }
      });
      if (!versionRecord) return NextResponse.json({ error: "Version not found" }, { status: 404 });

      await prisma.deployment.update({
          where: { id: deploymentId },
          data: { config: versionRecord.config }
      });
      await buildQueue.add('build', { deploymentId, userId: user.id });
      return NextResponse.json({ success: true, config: versionRecord.config });
    } else if (action === 'redeploy') {
      await buildQueue.add('build', { deploymentId, userId: user.id });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
