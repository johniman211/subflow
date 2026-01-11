import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth';

// POST /api/v1/access/check
// Check if a customer has active access to a product
export async function POST(request: Request) {
  // Authenticate API key
  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return apiError(auth.error!, 401);
  }

  try {
    const body = await request.json();
    const { product_id, customer_phone } = body;

    if (!product_id || !customer_phone) {
      return apiError('product_id and customer_phone are required');
    }

    const supabase = createServiceRoleClient();

    // Verify product belongs to this merchant
    const { data: product } = await supabase
      .from('products')
      .select('id, merchant_id')
      .eq('id', product_id)
      .single();

    if (!product || product.merchant_id !== auth.merchantId) {
      return apiError('Product not found', 404);
    }

    // Get subscription access info using the new function
    const { data: accessResult, error } = await supabase.rpc('get_subscription_access_info', {
      p_product_id: product_id,
      p_customer_phone: customer_phone,
    });

    if (error) {
      console.error('Access check error:', error);
      return apiError('Failed to check access', 500);
    }

    const result = accessResult?.[0];

    if (!result) {
      return apiSuccess({
        has_access: false,
        subscription: null,
        message: 'No subscription found for this customer',
      });
    }

    return apiSuccess({
      has_access: result.has_access,
      subscription: {
        id: result.subscription_id,
        status: result.status,
        current_period_end: result.current_period_end,
        grace_period_end: result.grace_period_end,
        days_remaining: result.days_remaining,
        is_renewable: result.is_renewable,
        product_type: result.product_type,
      },
    });
  } catch (error: any) {
    console.error('Access check error:', error);
    return apiError('Internal server error', 500);
  }
}
