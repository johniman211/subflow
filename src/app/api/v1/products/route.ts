import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth';

// GET /api/v1/products
// List all products for the merchant
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return apiError(auth.error!, 401);
  }

  try {
    const supabase = createServiceRoleClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('*, prices(*)')
      .eq('merchant_id', auth.merchantId!)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Products fetch error:', error);
      return apiError('Failed to fetch products', 500);
    }

    return apiSuccess({
      products: products?.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        product_type: product.product_type,
        image_url: product.image_url,
        created_at: product.created_at,
        prices: product.prices?.filter((p: any) => p.is_active).map((price: any) => ({
          id: price.id,
          name: price.name,
          amount: price.amount,
          currency: price.currency,
          billing_cycle: price.billing_cycle,
          trial_days: price.trial_days,
        })),
      })) || [],
    });
  } catch (error: any) {
    console.error('Products error:', error);
    return apiError('Internal server error', 500);
  }
}
