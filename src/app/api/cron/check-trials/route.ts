import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// This cron job checks for expired trials and downgrades users to free plan
// Should be run daily via Vercel Cron or external cron service
// GET /api/cron/check-trials

export async function GET(request: Request) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();

    // Get free plan ID
    const { data: freePlan } = await supabase
      .from('platform_plans')
      .select('id')
      .eq('slug', 'free')
      .single();

    if (!freePlan) {
      return NextResponse.json({ error: 'Free plan not found' }, { status: 500 });
    }

    // Find expired trials
    const { data: expiredTrials, error: fetchError } = await supabase
      .from('platform_subscriptions')
      .select('id, user_id')
      .eq('status', 'trialing')
      .lt('trial_end', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired trials:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredTrials || expiredTrials.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No expired trials found',
        processed: 0 
      });
    }

    let processed = 0;
    let errors: string[] = [];

    // Process each expired trial
    for (const subscription of expiredTrials) {
      try {
        // Update subscription to expired
        await supabase
          .from('platform_subscriptions')
          .update({
            status: 'expired',
            plan_id: freePlan.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        // Downgrade user to free plan
        await supabase
          .from('users')
          .update({ platform_plan_id: freePlan.id })
          .eq('id', subscription.user_id);

        processed++;
      } catch (err: any) {
        errors.push(`User ${subscription.user_id}: ${err.message}`);
      }
    }

    // Also check for expired paid subscriptions
    const { data: expiredPaid } = await supabase
      .from('platform_subscriptions')
      .select('id, user_id')
      .eq('status', 'active')
      .lt('current_period_end', new Date().toISOString());

    if (expiredPaid && expiredPaid.length > 0) {
      for (const subscription of expiredPaid) {
        try {
          // Mark as past_due first (gives grace period)
          await supabase
            .from('platform_subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          processed++;
        } catch (err: any) {
          errors.push(`Paid sub ${subscription.user_id}: ${err.message}`);
        }
      }
    }

    // Check for past_due subscriptions older than 7 days - downgrade to free
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: oldPastDue } = await supabase
      .from('platform_subscriptions')
      .select('id, user_id')
      .eq('status', 'past_due')
      .lt('current_period_end', sevenDaysAgo.toISOString());

    if (oldPastDue && oldPastDue.length > 0) {
      for (const subscription of oldPastDue) {
        try {
          await supabase
            .from('platform_subscriptions')
            .update({
              status: 'expired',
              plan_id: freePlan.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          await supabase
            .from('users')
            .update({ platform_plan_id: freePlan.id })
            .eq('id', subscription.user_id);

          processed++;
        } catch (err: any) {
          errors.push(`Past due ${subscription.user_id}: ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Cron check-trials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
