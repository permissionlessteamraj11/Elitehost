import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-service';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * File Manager API
 */
export async function GET(req: Request) {
  try {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const deploymentId = searchParams.get('deploymentId');
    const path = searchParams.get('path') || '/';

    if (!deploymentId) return NextResponse.json({ error: 'Missing deploymentId' }, { status: 400 });

    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    if (!deployment || (deployment.user_id !== session.userId && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!deployment.container_id) return NextResponse.json({ error: 'Container not running' }, { status: 400 });

    const { stdout } = await execFileAsync('docker', ['exec', deployment.container_id, 'ls', '-F', path]);
    const files = stdout.trim().split('\n').filter(Boolean).map(f => ({
        name: f,
        isDir: f.endsWith('/')
    }));

    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { deploymentId, path } = await req.json();

    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    if (!deployment || (deployment.user_id !== session.userId && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await execFileAsync('docker', ['exec', deployment.container_id!, 'rm', '-rf', path]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAuth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { deploymentId, path, content } = await req.json();

        const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
        if (!deployment || (deployment.user_id !== session.userId && session.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Write content to file using sh -c and printf to handle multiline/special chars
        await execFileAsync('docker', [
            'exec',
            deployment.container_id!,
            'sh', '-c',
            `printf "%s" "$1" > "$2"`,
            '--',
            content,
            path
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
