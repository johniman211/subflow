import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    
    // Verify admin access
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

    if (!(adminCheck as any)?.is_platform_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get total users (using service role bypasses RLS)
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active subscribers
    const { count: activeSubscribers } = await supabase
      .from('platform_subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    // Get monthly revenue - separated by currency
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyPayments } = await supabase
      .from('platform_payments')
      .select('amount, currency')
      .eq('status', 'confirmed')
      .gte('confirmed_at', startOfMonth.toISOString());

    const monthlyRevenueSSP = (monthlyPayments as any[])
      ?.filter(p => p.currency === 'SSP')
      .reduce((sum, p) => sum + p.amount, 0) || 0;
    
    const monthlyRevenueUSD = (monthlyPayments as any[])
      ?.filter(p => p.currency === 'USD')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    // Get pending payments
    const { count: pendingPayments } = await supabase
      .from('platform_payments')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'matched']);

    // Get recent payments
    const { data: recentPayments } = await supabase
      .from('platform_payments')
      .select('*, users(full_name, email), platform_plans(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeSubscribers: activeSubscribers || 0,
        monthlyRevenueSSP,
        monthlyRevenueUSD,
        pendingPayments: pendingPayments || 0,
      },
      recentPayments: recentPayments || [],
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
