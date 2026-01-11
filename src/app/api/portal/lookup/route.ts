import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// POST /api/portal/lookup
// Public endpoint for customers to look up their subscriptions
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/\s+/g, '');
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '+211' + normalizedPhone.substring(1);
      } else if (normalizedPhone.startsWith('211')) {
        normalizedPhone = '+' + normalizedPhone;
      }
    }

    const supabase = createServiceRoleClient();

    // Fetch subscriptions for this phone number
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        current_period_start,
        current_period_end,
        products(id, name, merchant_id),
        prices(name, amount, currency, billing_cycle),
        users!subscriptions_merchant_id_fkey(business_name)
      `)
      .eq('customer_phone', normalizedPhone)
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('Subscription lookup error:', subError);
      return Response.json({ error: 'Failed to lookup subscriptions' }, { status: 500 });
    }

    // Fetch payment history
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select(`
        id,
        reference_code,
        amount,
        currency,
        status,
        created_at,
        prices(products(name))
      `)
      .eq('customer_phone', normalizedPhone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (payError) {
      console.error('Payment lookup error:', payError);
    }

    // Transform subscriptions data
    const transformedSubs = subscriptions?.map((sub: any) => {
      const periodEnd = new Date(sub.current_period_end);
      const now = new Date();
      const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: sub.id,
        status: sub.status,
        product_name: sub.products?.name || 'Unknown Product',
        product_id: sub.products?.id,
        price_name: sub.prices?.name || 'Unknown Plan',
        amount: sub.prices?.amount || 0,
        currency: sub.prices?.currency || 'SSP',
        billing_cycle: sub.prices?.billing_cycle || 'monthly',
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        days_remaining: daysRemaining,
        merchant_name: sub.users?.business_name || 'Unknown Business',
      };
    }) || [];

    // Transform payments data
    const transformedPayments = payments?.map((payment: any) => ({
      id: payment.id,
      reference_code: payment.reference_code,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      created_at: payment.created_at,
      product_name: payment.prices?.products?.name || 'Unknown Product',
    })) || [];

    return Response.json({
      subscriptions: transformedSubs,
      payments: transformedPayments,
    });
  } catch (error: any) {
    console.error('Portal lookup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
