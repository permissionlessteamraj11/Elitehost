import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-service';

export async function GET(req: Request) {
    try {
        const session = await verifyAuth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const deploymentId = searchParams.get('deploymentId');

        if (!deploymentId) return NextResponse.json({ error: 'Missing deploymentId' }, { status: 400 });

        const deployment = await prisma.deployment.findUnique({
            where: { id: deploymentId },
            include: { plan: true }
        });

        if (!deployment || (deployment.user_id !== session.userId && session.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({
            usage: deployment.resource_usage || { cpu: '0%', mem: '0MB / 0MB', net: '0B / 0B', block: '0B / 0B' },
            limits: {
                cpu: deployment.plan.cpu_percent,
                ram: deployment.plan.ram_mb
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
