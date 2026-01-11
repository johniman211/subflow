import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { smsService } from '@/lib/sms';
import { whatsappService } from '@/lib/whatsapp';

// This endpoint should be called by a cron job (e.g., Vercel Cron, external service)
// Recommended: Run daily at midnight

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const results = {
    processed: 0,
    statusUpdates: { expired: 0, past_due: 0 },
    expiringSoon: [] as any[],
    errors: [] as string[],
  };

  try {
    // 1. Process all subscription statuses
    const { data: processResult, error: processError } = await supabase
      .rpc('process_subscription_statuses');

    if (processError) {
      results.errors.push(`Status processing error: ${processError.message}`);
    } else if (processResult && processResult.length > 0) {
      results.processed = processResult[0].processed;
      results.statusUpdates.expired = processResult[0].expired;
      results.statusUpdates.past_due = processResult[0].past_due;
    }

    // 2. Get subscriptions expiring in 3 days (for notifications)
    const { data: expiring, error: expiringError } = await supabase
      .rpc('get_expiring_subscriptions', { p_days_ahead: 3 });

    if (expiringError) {
      results.errors.push(`Expiring fetch error: ${expiringError.message}`);
    } else {
      results.expiringSoon = expiring || [];
      
      // Send renewal reminders for expiring subscriptions
      for (const sub of results.expiringSoon) {
        try {
          await sendRenewalReminder(sub);
        } catch (e: any) {
          results.errors.push(`Reminder error for ${sub.subscription_id}: ${e.message}`);
        }
      }
    }

    // 3. Get expired subscriptions for follow-up
    const { data: expired, error: expiredError } = await supabase
      .rpc('get_expired_subscriptions');

    if (!expiredError && expired) {
      // Send expiration notices for recently expired (within 1 day)
      const recentlyExpired = expired.filter((s: any) => s.days_expired <= 1);
      for (const sub of recentlyExpired) {
        try {
          await sendExpirationNotice(sub);
        } catch (e: any) {
          results.errors.push(`Expiration notice error for ${sub.subscription_id}: ${e.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
    }, { status: 500 });
  }
}

// Send renewal reminder to customer via SMS, WhatsApp, and Email
async function sendRenewalReminder(subscription: any) {
  const renewUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/checkout/${subscription.product_id}`;
  const daysLeft = Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  console.log('📧 Renewal reminder:', {
    phone: subscription.customer_phone,
    product: subscription.product_name,
    expires: subscription.current_period_end,
    daysLeft,
  });

  // Send SMS notification
  if (subscription.customer_phone) {
    try {
      await smsService.sendSubscriptionRenewalReminder(subscription.customer_phone, {
        productName: subscription.product_name,
        daysLeft,
        renewUrl,
      });
    } catch (e) {
      console.warn('SMS reminder failed:', e);
    }
  }

  // Send WhatsApp notification
  if (subscription.customer_phone) {
    try {
      await whatsappService.sendSubscriptionRenewalReminder(subscription.customer_phone, {
        productName: subscription.product_name,
        daysLeft,
        renewUrl,
        merchantName: subscription.merchant_name || 'SubFlow',
      });
    } catch (e) {
      console.warn('WhatsApp reminder failed:', e);
    }
  }

  // Send email notification
  if (subscription.customer_email && process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SubFlow <notifications@resend.dev>',
        to: [subscription.customer_email],
        subject: `⏰ Your ${subscription.product_name} subscription expires in ${daysLeft} days`,
        html: `
          <h2>Subscription Expiring Soon</h2>
          <p>Hi there,</p>
          <p>Your subscription to <strong>${subscription.product_name}</strong> will expire on <strong>${new Date(subscription.current_period_end).toLocaleDateString()}</strong>.</p>
          <p>To continue enjoying access, please renew your subscription.</p>
          <p><strong>Renewal Amount:</strong> ${subscription.currency} ${subscription.amount}</p>
          <p><a href="${renewUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px;">Renew Now</a></p>
          <p>Thank you for being a valued customer!</p>
        `,
      }),
    });
  }
}

// Send expiration notice to customer via SMS, WhatsApp, and Email
async function sendExpirationNotice(subscription: any) {
  const renewUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/checkout/${subscription.product_id}`;

  console.log('📧 Expiration notice:', {
    phone: subscription.customer_phone,
    product: subscription.product_name,
    expired: subscription.expired_at,
  });

  // Send SMS notification
  if (subscription.customer_phone) {
    try {
      await smsService.sendSubscriptionExpired(subscription.customer_phone, {
        productName: subscription.product_name,
        renewUrl,
      });
    } catch (e) {
      console.warn('SMS expiration notice failed:', e);
    }
  }

  // Send WhatsApp notification
  if (subscription.customer_phone) {
    try {
      await whatsappService.sendSubscriptionExpired(subscription.customer_phone, {
        productName: subscription.product_name,
        renewUrl,
        merchantName: subscription.merchant_name || 'SubFlow',
      });
    } catch (e) {
      console.warn('WhatsApp expiration notice failed:', e);
    }
  }

  // Send email notification
  if (subscription.customer_email && process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SubFlow <notifications@resend.dev>',
        to: [subscription.customer_email],
        subject: `❌ Your ${subscription.product_name} subscription has expired`,
        html: `
          <h2>Subscription Expired</h2>
          <p>Hi there,</p>
          <p>Your subscription to <strong>${subscription.product_name}</strong> has expired.</p>
          <p>To regain access, please renew your subscription.</p>
          <p><strong>Renewal Amount:</strong> ${subscription.currency} ${subscription.amount}</p>
          <p><a href="${renewUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px;">Resubscribe Now</a></p>
          <p>We hope to see you back soon!</p>
        `,
      }),
    });
  }
}

// Manual trigger endpoint for testing
export async function POST(request: NextRequest) {
  // Same logic as GET but for manual testing
  return GET(request);
}
