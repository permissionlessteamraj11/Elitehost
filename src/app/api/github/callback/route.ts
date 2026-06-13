import { NextResponse } from 'next/server';
import { db } from '@/lib/db/json-db';
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

    // Encrypt token before storing
    const encryptedToken = encrypt(data.access_token);

    // Update user with GitHub token
    await db.users.update((u: any) => u.id === state, {
      github_token: encryptedToken,
      github_connected_at: new Date().toISOString()
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?github=connected`);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
