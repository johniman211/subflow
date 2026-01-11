import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, data, merchant_id } = body;

    if (!event_type || !data || !merchant_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Get active webhooks for this merchant and event
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('merchant_id', merchant_id)
      .eq('is_active', true)
      .contains('events', [event_type]);

    if (!webhooks || webhooks.length === 0) {
      return NextResponse.json({ message: 'No webhooks configured' });
    }

    // Deliver to each webhook
    const deliveryPromises = webhooks.map(async (webhook: any) => {
      const payload = {
        event: event_type,
        data: data,
        timestamp: new Date().toISOString(),
      };

      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Losetify-Signature': signature,
          },
          body: JSON.stringify(payload),
        });

        // Log delivery
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          event_type: event_type,
          payload: payload,
          response_status: response.status,
          response_body: await response.text().catch(() => null),
          delivered_at: new Date().toISOString(),
        });

        return { webhook_id: webhook.id, success: response.ok };
      } catch (error: any) {
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          event_type: event_type,
          payload: payload,
          response_status: null,
          response_body: error.message,
        });

        return { webhook_id: webhook.id, success: false, error: error.message };
      }
    });

    const results = await Promise.all(deliveryPromises);

    return NextResponse.json({ deliveries: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
