import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    
    // Get the requesting user to verify they're an admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is platform admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_platform_admin')
      .eq('id', user.id)
      .single();

    if (!adminCheck?.is_platform_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get plan filter from query params
    const url = new URL(request.url);
    const planFilter = url.searchParams.get('plan');

    // Fetch all users with service role (bypasses RLS)
    let query = supabase
      .from('users')
      .select('*, platform_subscriptions(*, platform_plans(*)), platform_plans(*)')
      .order('created_at', { ascending: false });

    if (planFilter && planFilter !== 'all') {
      query = query.eq('platform_plan_id', planFilter);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch platform plans
    const { data: plans } = await supabase
      .from('platform_plans')
      .select('*')
      .order('sort_order');

    return NextResponse.json({ 
      users: users || [], 
      plans: plans || [],
      total: users?.length || 0,
    });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
