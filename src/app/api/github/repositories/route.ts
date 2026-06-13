import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-service';
import { decrypt } from '@/lib/security';

export async function GET() {
  const user = await getUser();
  if (!user || !user.github_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 401 });
  }

  try {
    const token = decrypt(user.github_token);

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EliteHosting-App'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories from GitHub');
    }

    const repos = await response.json();

    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
      private: repo.private,
      description: repo.description,
      language: repo.language,
      updated_at: repo.updated_at,
      default_branch: repo.default_branch
    }));

    return NextResponse.json({ success: true, repositories: formattedRepos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
