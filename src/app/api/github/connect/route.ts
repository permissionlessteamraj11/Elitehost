import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-service';

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://elitehosting.in";
  const redirectUri = `${appUrl}/api/github/callback`;
  const scope = 'repo,read:user,user:email';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${user.id}`;

  return NextResponse.redirect(githubAuthUrl);
}
