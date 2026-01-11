import { deliverWebhook } from '@/lib/webhooks';

// POST /api/v1/webhooks/deliver - Internal endpoint for testing
export async function POST(request: Request) {
  // This endpoint is for internal testing only
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { merchant_id, event_type, payload } = await request.json();
  const result = await deliverWebhook(merchant_id, event_type, payload);
  return Response.json(result);
}
