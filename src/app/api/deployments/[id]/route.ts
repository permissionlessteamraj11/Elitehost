import { NextResponse } from 'next/server';
import { db } from '@/lib/db/json-db';
import { getUser } from '@/lib/auth-service';
import { createDeploymentVersion, rollbackDeployment, getDeploymentVersions } from '@/lib/db/versioning';
import { buildQueue } from '@/services/queues/config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: deploymentId } = await params;
    const deployment = await db.deployments.findOne((d: any) => d.id === deploymentId && d.user_id === user.id);

    if (!deployment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const versions = await getDeploymentVersions(deploymentId);

    return NextResponse.json({ success: true, deployment, versions });
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

    const deployment = await db.deployments.findOne((d: any) => d.id === deploymentId && d.user_id === user.id);
    if (!deployment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Create new version
    const newVersion = await createDeploymentVersion(deploymentId, user.id, config, changes);

    // Update main deployment config
    await db.deployments.update((d: any) => d.id === deploymentId, {
      config: newVersion.config,
      updated_at: new Date().toISOString()
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
      const restored = await rollbackDeployment(deploymentId, version);
      await buildQueue.add('redeploy', { deploymentId, userId: user.id });
      return NextResponse.json({ success: true, config: restored.config });
    } else if (action === 'redeploy') {
      await buildQueue.add('redeploy', { deploymentId, userId: user.id });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
