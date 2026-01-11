import { createServiceRoleClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Internal function to deliver webhooks - called after payment events
export async function deliverWebhook(
  merchantId: string,
  eventType: string,
  payload: any
) {
  const supabase = createServiceRoleClient() as any;

  // Get all active webhooks for this merchant that listen to this event
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .contains('events', [eventType]);

  if (!webhooks || webhooks.length === 0) {
    return { delivered: 0 };
  }

  const results = [];

  for (const webhook of webhooks) {
    try {
      // Create signature
      const timestamp = Date.now();
      const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
      const signature = crypto
        .createHmac('sha256', (webhook as any).secret)
        .update(signaturePayload)
        .digest('hex');

      // Deliver webhook
      const response = await fetch((webhook as any).url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Losetify-Signature': signature,
          'X-Losetify-Timestamp': timestamp.toString(),
          'X-Losetify-Event': eventType,
        },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          data: payload,
        }),
      });

      // Log delivery
      await supabase.from('webhook_deliveries').insert({
        webhook_id: (webhook as any).id,
        event_type: eventType,
        payload: payload,
        response_status: response.status,
        response_body: await response.text().catch(() => null),
        delivered_at: new Date().toISOString(),
      });

      results.push({ webhookId: (webhook as any).id, success: response.ok });
    } catch (error: any) {
      // Log failed delivery
      await supabase.from('webhook_deliveries').insert({
        webhook_id: (webhook as any).id,
        event_type: eventType,
        payload: payload,
        response_status: 0,
        response_body: error.message,
        delivered_at: null,
      });

      results.push({ webhookId: (webhook as any).id, success: false, error: error.message });
    }
  }

  return { delivered: results.filter(r => r.success).length, total: results.length, results };
}
