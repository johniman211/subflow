import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth';

// GET /api/v1/subscriptions
// List all subscriptions for the merchant
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return apiError(auth.error!, 401);
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const customer_phone = url.searchParams.get('customer_phone');
    const product_id = url.searchParams.get('product_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const supabase = createServiceRoleClient();

    let query = supabase
      .from('subscriptions')
      .select('*, products(id, name, product_type), prices(id, name, amount, currency, billing_cycle)')
      .eq('merchant_id', auth.merchantId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (customer_phone) {
      query = query.eq('customer_phone', customer_phone);
    }
    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    const { data: subscriptions, error, count } = await query;

    if (error) {
      console.error('Subscriptions fetch error:', error);
      return apiError('Failed to fetch subscriptions', 500);
    }

    return apiSuccess({
      subscriptions: subscriptions?.map((sub: any) => ({
        id: sub.id,
        status: sub.status,
        customer_phone: sub.customer_phone,
        customer_email: sub.customer_email,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        trial_end: sub.trial_end,
        cancelled_at: sub.cancelled_at,
        created_at: sub.created_at,
        product: sub.products,
        price: sub.prices,
      })) || [],
      pagination: {
        limit,
        offset,
        total: count,
      },
    });
  } catch (error: any) {
    console.error('Subscriptions error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST /api/v1/subscriptions/cancel
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return apiError(auth.error!, 401);
  }

  try {
    const body = await request.json();
    const { subscription_id, cancel_immediately } = body;

    if (!subscription_id) {
      return apiError('subscription_id is required');
    }

    const supabase = createServiceRoleClient();

    // Verify subscription belongs to merchant
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, merchant_id, status')
      .eq('id', subscription_id)
      .single();

    if (!subscription || (subscription as any).merchant_id !== auth.merchantId) {
      return apiError('Subscription not found', 404);
    }

    if ((subscription as any).status === 'cancelled') {
      return apiError('Subscription is already cancelled');
    }

    // Cancel subscription
    const updateData: any = {
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (cancel_immediately) {
      updateData.status = 'cancelled';
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscription_id);

    if (error) {
      console.error('Cancel subscription error:', error);
      return apiError('Failed to cancel subscription', 500);
    }

    return apiSuccess({
      message: cancel_immediately 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at period end',
      subscription_id,
      cancelled_at: updateData.cancelled_at,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return apiError('Internal server error', 500);
  }
}
