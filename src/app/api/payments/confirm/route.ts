import { createClient } from '@/lib/supabase/client';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { triggerWebhook, WEBHOOK_EVENTS } from '@/lib/webhooks';
import { notifyAdmin, notifyMerchant, notifyCustomer } from '@/lib/notification-service';

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

    // Send platform notifications
    try {
      const productName = (payment.prices as any)?.products?.name || 'Product';
      const amount = (confirmedPayment as any)?.amount || payment.amount;
      const currency = (confirmedPayment as any)?.currency || payment.currency;
      const customerPhone = (payment as any).customer_phone;
      const customerEmail = (payment as any).customer_email;

      // Notify admin about confirmed payment
      await notifyAdmin('payment.confirmed', {
        reference_code: (confirmedPayment as any)?.reference_code,
        amount,
        currency,
        customer_name: customerPhone,
        customer_phone: customerPhone,
        product_name: productName,
      }, ['email']);

      // Notify customer about confirmed payment
      if (customerPhone) {
        await notifyCustomer(
          customerPhone,
          customerEmail,
          'payment.confirmed',
          {
            reference_code: (confirmedPayment as any)?.reference_code,
            amount,
            currency,
            product_name: productName,
            period_end: (subscription as any)?.current_period_end,
          },
          ['sms', 'whatsapp']
        );
      }
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment confirmed',
      webhooks_triggered: true,
      notifications_sent: true,
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
