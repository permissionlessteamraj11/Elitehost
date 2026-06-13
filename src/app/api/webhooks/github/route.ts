import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (process.env.GITHUB_WEBHOOK_SECRET) {
    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    if (signature !== digest) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(payload);
  const eventType = request.headers.get('x-github-event');

  // Handle push event
  if (eventType === 'push') {
    const repoUrl = event.repository.html_url;
    const branch = event.ref.replace('refs/heads/', '');

    // Find deployments for this repo and branch with autoDeploy enabled
    // and trigger redeployments
    console.log(`Received push event for ${repoUrl} on branch ${branch}`);
  }

  return NextResponse.json({ success: true });
}
