import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/security';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user.id

  if (!code || !state) {
    return NextResponse.json({ error: "Invalid callback parameters" }, { status: 400 });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error_description }, { status: 400 });
    }

    const encryptedToken = encrypt(data.access_token);

    // Get GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${data.access_token}` }
    });
    const githubUser = await userRes.json();

    await prisma.user.update({
      where: { id: state },
      data: {
        github_token: encryptedToken,
      }
    });

    await prisma.githubAccount.upsert({
        where: { github_id: githubUser.id.toString() },
        update: {
            access_token: encryptedToken,
            username: githubUser.login,
            avatar_url: githubUser.avatar_url
        },
        create: {
            user_id: state,
            github_id: githubUser.id.toString(),
            username: githubUser.login,
            avatar_url: githubUser.avatar_url,
            access_token: encryptedToken
        }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard/settings?github=connected`);
  } catch (error: any) {
    console.error('GitHub Callback Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
