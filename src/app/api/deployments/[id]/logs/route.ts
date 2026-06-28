import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VPSManager } from '@/services/vps-manager';
import { verifyAuth } from '@/lib/auth-service';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
    });

    if (!deployment || (deployment.user_id !== session.userId && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    if (!deployment.container_id) {
        return NextResponse.json({ logs: "No container active for this deployment." });
    }

    const logs = await VPSManager.getLogs(deployment.container_id);
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
