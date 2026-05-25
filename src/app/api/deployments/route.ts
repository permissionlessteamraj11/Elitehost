import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buildQueue } from '@/services/queues/config';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // In a real app, you would verify the session here
    // const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('deployments')
      .insert({
        project_id: payload.projectId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger the build worker
    await buildQueue.add('build-job', {
      deploymentId: data.id,
      projectId: payload.projectId,
      config: payload.config
    });

    return NextResponse.json({ success: true, deploymentId: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
