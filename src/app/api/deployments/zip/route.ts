import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth-service';
import { scanForMaliciousCode, logSecurityEvent } from '@/lib/security';
import { buildQueue } from '@/services/queues/config';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'data/uploads');

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const buildCommand = formData.get('build_command') as string;
    const deployCommand = formData.get('deploy_command') as string;
    const envVarsRaw = formData.get('env_vars') as string;

    let envVars = [];
    try {
        envVars = JSON.parse(envVarsRaw || '[]');
    } catch (e) {}

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: "Only ZIP files are allowed" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 });
    }

    // Security Scan on metadata
    const securityCheck = scanForMaliciousCode({ name, build_command: buildCommand, deploy_command: deployCommand, env_vars: envVars });
    if (!securityCheck.isSafe) {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      await logSecurityEvent(ip, 'MALICIOUS_ZIP_METADATA_ATTEMPT', {
          userId: user.id,
          pattern: securityCheck.pattern,
          metadata: { name, buildCommand, deployCommand, envVars }
      });
      return NextResponse.json({ error: securityCheck.reason }, { status: 403 });
    }

    // Credit Enforcement
    if (user.credits < 1 && user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Insufficient credits.", code: 'INSUFFICIENT_CREDITS' }, { status: 402 });
    }

    // Deduct credit
    await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } }
    });

    // Save File
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const fileId = crypto.randomUUID();
    const filePath = path.join(UPLOAD_DIR, `${fileId}.zip`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const initialConfig = {
      name: name || "ZIP Deployment",
      projectType: "nodejs",
      runtime: { language: "nodejs", version: "22" },
      source: {
        type: "zip",
        fileId: fileId,
        fileName: file.name
      },
      build: {
        command: buildCommand || null,
      },
      start: {
        command: deployCommand || null,
        port: 3000
      },
      env: {
        public: envVars.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}),
      }
    };

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const plan = await prisma.plan.findFirst();
    if (!plan) return NextResponse.json({ error: "No plans available" }, { status: 500 });

    const deployment = await prisma.deployment.create({
      data: {
        user_id: user.id,
        name: initialConfig.name,
        subdomain: `${initialConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`,
        status: 'PENDING',
        config: JSON.stringify(initialConfig),
        expires_at: expiresAt,
        plan_id: plan.id,
      }
    });

    await prisma.deploymentVersion.create({
        data: {
            deployment_id: deployment.id,
            version: 1,
            config: JSON.stringify(initialConfig),
            changes: "Initial ZIP upload"
        }
    });

    await buildQueue.add('build', { deploymentId: deployment.id, userId: user.id });

    return NextResponse.json({ success: true, deploymentId: deployment.id });
  } catch (error: any) {
    console.error('ZIP Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
