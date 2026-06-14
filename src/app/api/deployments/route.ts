import { NextResponse } from 'next/server';
import { db } from '@/lib/db/json-db';
import { getUser } from '@/lib/auth-service';
import { scanForMaliciousCode, decrypt } from '@/lib/security';
import { createDeploymentVersion } from '@/lib/db/versioning';
import { buildQueue } from '@/services/queues/config';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deployments = await db.deployments.find((d: any) => d.user_id === user.id);

    // Auto-expire check
    const now = new Date();
    for (const d of deployments) {
      if (d.status === 'ready' && d.expires_at && new Date(d.expires_at) < now) {
        await db.deployments.update((item: any) => item.id === d.id, { status: 'expired' });
        d.status = 'expired';
      }
    }

    return NextResponse.json({ success: true, deployments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await request.json();

    // Security Scan
    const securityCheck = scanForMaliciousCode(payload);
    if (!securityCheck.isSafe) {
      return NextResponse.json({ error: securityCheck.reason }, { status: 403 });
    }

    // Credit Enforcement: Strictly 1 credit per deployment
    const paidCredits = Number(user.paid_credits || 0);
    const freeCredits = Number(user.credit_balance || 0);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (paidCredits >= 1) {
      await db.users.update((u: any) => u.id === user.id, { paid_credits: paidCredits - 1 });
    } else if (freeCredits >= 1) {
      await db.users.update((u: any) => u.id === user.id, { credit_balance: freeCredits - 1 });
    } else {
      // For Admin users, we allow deployment for testing even with 0 credits
      if (user.role !== 'admin') {
          return NextResponse.json({ error: "Insufficient credits. Please buy credits to deploy.", code: 'INSUFFICIENT_CREDITS' }, { status: 402 });
      }
    }

    // Source Configuration
    const sourceConfig: any = {
        type: payload.method || "github",
        repoUrl: payload.repoUrl || "",
        branch: payload.branch || "main",
        autoDeploy: payload.method === 'github'
    };

    if (payload.method === 'github_public') {
        sourceConfig.type = 'github';
        sourceConfig.isPublic = true;
    } else if (payload.method === 'github') {
        if (!user.github_token) {
            return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
        }
    }

    // Default configuration from payload
    const initialConfig = {
      name: payload.name || "My Awesome App",
      projectType: payload.framework?.toLowerCase() || "nodejs",
      runtime: { language: "nodejs", version: "22" },
      source: sourceConfig,
      build: {
        command: payload.build_command || null,
        installCommand: null,
        outputDir: null
      },
      start: {
        command: payload.deploy_command || null,
        healthCheckPath: "/",
        port: 3000
      },
      env: {
        public: (payload.env_vars || []).reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}),
        secret: {}
      }
    };

    const deployment = await db.deployments.insert({
      user_id: user.id,
      name: initialConfig.name,
      status: 'pending',
      config: initialConfig,
      expires_at: expiresAt,
      is_free: false,
    });

    // Create initial version
    await createDeploymentVersion(deployment.id, user.id, initialConfig, "Initial deployment");

    // Add to build queue
    await buildQueue.add('build', { deploymentId: deployment.id, userId: user.id });

    return NextResponse.json({ success: true, deploymentId: deployment.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
