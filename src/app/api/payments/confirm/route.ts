import { createClient } from '@/lib/supabase/client';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { triggerWebhook, WEBHOOK_EVENTS } from '@/lib/webhooks';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, confirmedBy } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Get payment details before confirmation
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*, prices(*, products(*))')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Call the confirm_payment RPC
    const { error: confirmError } = await supabase.rpc('confirm_payment', {
      p_payment_id: paymentId,
      p_confirmed_by: confirmedBy,
    });

    if (confirmError) {
      return NextResponse.json({ error: confirmError.message }, { status: 500 });
    }

    // Get updated payment and subscription info
    const { data: confirmedPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('merchant_id', payment.merchant_id)
      .eq('customer_phone', payment.customer_phone)
      .eq('price_id', payment.price_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Trigger webhooks
    await triggerWebhook(payment.merchant_id, WEBHOOK_EVENTS.PAYMENT_CONFIRMED, {
      payment: {
        id: confirmedPayment?.id,
        reference_code: confirmedPayment?.reference_code,
        amount: confirmedPayment?.amount,
        currency: confirmedPayment?.currency,
        status: 'confirmed',
        customer_phone: confirmedPayment?.customer_phone,
        customer_email: confirmedPayment?.customer_email,
        confirmed_at: new Date().toISOString(),
      },
      product: {
        id: (payment.prices as any)?.products?.id,
        name: (payment.prices as any)?.products?.name,
      },
      price: {
        id: payment.price_id,
        name: (payment.prices as any)?.name,
        billing_cycle: (payment.prices as any)?.billing_cycle,
      },
    });

    // If subscription was created/renewed, trigger that webhook too
    if (subscription) {
      const isNew = new Date(subscription.created_at).getTime() > Date.now() - 60000; // Created in last minute
      
      await triggerWebhook(
        payment.merchant_id, 
        isNew ? WEBHOOK_EVENTS.SUBSCRIPTION_CREATED : WEBHOOK_EVENTS.SUBSCRIPTION_RENEWED,
        {
          subscription: {
            id: subscription.id,
            status: subscription.status,
            customer_phone: subscription.customer_phone,
            customer_email: subscription.customer_email,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
          },
          product: {
            id: (payment.prices as any)?.products?.id,
            name: (payment.prices as any)?.products?.name,
          },
        }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment confirmed',
      webhooks_triggered: true,
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
