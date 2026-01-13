import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  notifyMerchantSubscriptionExpiring,
  notifyMerchantSubscriptionExpired,
  notifyCustomerSubscriptionExpiring,
  notifyCustomerSubscriptionExpired,
} from '@/lib/platform-notifications';

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

    // Send notifications for expiring subscriptions (7 days before)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { data: expiringSoon } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*)), users!subscriptions_merchant_id_fkey(email, phone, business_name, full_name)')
      .eq('status', 'active')
      .gt('current_period_end', now.toISOString())
      .lt('current_period_end', sevenDaysFromNow.toISOString());

    // Send notifications for each expiring subscription
    let notificationsSent = 0;
    if (expiringSoon && expiringSoon.length > 0) {
      for (const sub of expiringSoon) {
        try {
          const productName = (sub as any).prices?.products?.name || 'Subscription';
          const merchantEmail = (sub as any).users?.email;
          const merchantPhone = (sub as any).users?.phone;
          const merchantName = (sub as any).users?.business_name || (sub as any).users?.full_name || 'Merchant';
          const customerPhone = (sub as any).customer_phone;
          const expiryDate = (sub as any).current_period_end;
          const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

          // Notify merchant
          if (merchantEmail) {
            await notifyMerchantSubscriptionExpiring({
              merchantEmail,
              merchantPhone,
              merchantName,
              customerPhone,
              productName,
              expiryDate,
              daysUntilExpiry,
            });
          }

          // Notify customer
          if (customerPhone) {
            await notifyCustomerSubscriptionExpiring({
              customerPhone,
              productName,
              merchantName,
              expiryDate,
              daysUntilExpiry,
            });
          }

          notificationsSent++;
        } catch (notifyError) {
          console.error('Notification error for subscription:', (sub as any).id, notifyError);
        }
      }
    }

    // Send notifications for expired subscriptions
    let expiredNotificationsSent = 0;
    if (expiredSubs && expiredSubs.length > 0) {
      // Get full details for expired subscriptions
      const expiredIds = expiredSubs.map((s: any) => s.id);
      const { data: expiredDetails } = await supabase
        .from('subscriptions')
        .select('*, prices(*, products(*)), users!subscriptions_merchant_id_fkey(email, phone, business_name, full_name)')
        .in('id', expiredIds);

      if (expiredDetails) {
        for (const sub of expiredDetails) {
          try {
            const productName = (sub as any).prices?.products?.name || 'Subscription';
            const merchantEmail = (sub as any).users?.email;
            const merchantPhone = (sub as any).users?.phone;
            const merchantName = (sub as any).users?.business_name || (sub as any).users?.full_name || 'Merchant';
            const customerPhone = (sub as any).customer_phone;

            // Notify merchant
            if (merchantEmail) {
              await notifyMerchantSubscriptionExpired({
                merchantEmail,
                merchantPhone,
                merchantName,
                customerPhone,
                productName,
              });
            }

            // Notify customer
            if (customerPhone) {
              await notifyCustomerSubscriptionExpired({
                customerPhone,
                productName,
                merchantName,
              });
            }

            expiredNotificationsSent++;
          } catch (notifyError) {
            console.error('Notification error for expired subscription:', (sub as any).id, notifyError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: {
        markedPastDue: pastDueSubs?.length || 0,
        markedExpired: expiredSubs?.length || 0,
        expiringNotificationsSent: notificationsSent,
        expiredNotificationsSent,
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
