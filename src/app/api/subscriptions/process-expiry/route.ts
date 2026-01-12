import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const GRACE_PERIOD_DAYS = 7;

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Verify API key for cron jobs (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    // 1. Mark subscriptions as "past_due" if period ended but within grace period
    const { data: pastDueSubs, error: pastDueError } = await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('status', 'active')
      .lt('current_period_end', now.toISOString())
      .gt('current_period_end', gracePeriodEnd.toISOString())
      .select('id');

    // 2. Mark subscriptions as "expired" if past grace period
    const { data: expiredSubs, error: expiredError } = await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .in('status', ['active', 'past_due'])
      .lt('current_period_end', gracePeriodEnd.toISOString())
      .select('id');

    if (pastDueError || expiredError) {
      return NextResponse.json({ 
        error: 'Failed to process subscriptions',
        details: { pastDueError, expiredError }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      processed: {
        markedPastDue: pastDueSubs?.length || 0,
        markedExpired: expiredSubs?.length || 0,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error processing subscription expiry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to process subscription expiry',
    gracePeriodDays: GRACE_PERIOD_DAYS,
  });
}
