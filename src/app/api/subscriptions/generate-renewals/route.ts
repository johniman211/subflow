import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

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
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find subscriptions expiring in the next 7 days that don't have a pending renewal payment
    const { data: expiringSubs, error: fetchError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        merchant_id,
        customer_phone,
        customer_email,
        product_id,
        price_id,
        current_period_end,
        prices(amount, currency, billing_cycle),
        products(name)
      `)
      .eq('status', 'active')
      .lte('current_period_end', sevenDaysFromNow.toISOString())
      .gt('current_period_end', now.toISOString());

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch subscriptions', details: fetchError }, { status: 500 });
    }

    if (!expiringSubs || expiringSubs.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscriptions need renewal invoices', generated: 0 });
    }

    // Check for existing pending renewal payments
    const subscriptionIds = expiringSubs.map(s => s.id);
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('subscription_id')
      .in('subscription_id', subscriptionIds)
      .eq('status', 'pending')
      .eq('payment_type', 'renewal');

    const subsWithPendingPayments = new Set(existingPayments?.map(p => p.subscription_id) || []);

    // Generate renewal invoices for subscriptions without pending payments
    const renewalPayments = expiringSubs
      .filter(sub => !subsWithPendingPayments.has(sub.id))
      .map(sub => ({
        merchant_id: sub.merchant_id,
        subscription_id: sub.id,
        product_id: sub.product_id,
        price_id: sub.price_id,
        customer_phone: sub.customer_phone,
        customer_email: sub.customer_email,
        amount: (sub.prices as any)?.amount || 0,
        currency: (sub.prices as any)?.currency || 'SSP',
        status: 'pending',
        payment_type: 'renewal',
        reference_code: `REN-${nanoid(8).toUpperCase()}`,
        payment_method: 'pending',
        metadata: {
          renewal_for_period_end: sub.current_period_end,
          product_name: (sub.products as any)?.name,
          billing_cycle: (sub.prices as any)?.billing_cycle,
        },
      }));

    if (renewalPayments.length === 0) {
      return NextResponse.json({ success: true, message: 'All expiring subscriptions already have renewal invoices', generated: 0 });
    }

    const { data: insertedPayments, error: insertError } = await supabase
      .from('payments')
      .insert(renewalPayments)
      .select('id, reference_code');

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create renewal invoices', details: insertError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      generated: insertedPayments?.length || 0,
      renewals: insertedPayments,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error generating renewal invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to generate renewal invoices for expiring subscriptions',
  });
}
