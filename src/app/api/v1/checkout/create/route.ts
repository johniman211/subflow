import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateApiKey, apiError, apiSuccess } from '@/lib/api-auth';
import { generateReferenceCode } from '@/lib/utils';

// POST /api/v1/checkout/create
// Creates a checkout session and returns checkout URL or payment details
export async function POST(request: NextRequest) {
  // Authenticate API key
  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return apiError(auth.error!, 401);
  }

  try {
    const body = await request.json();
    const { 
      price_id, 
      customer_phone, 
      customer_email,
      success_url,
      cancel_url,
      metadata 
    } = body;

    // Validate required fields
    if (!price_id) {
      return apiError('price_id is required');
    }
    if (!customer_phone) {
      return apiError('customer_phone is required');
    }

    const supabase = createServiceRoleClient();

    // Get price and verify it belongs to the merchant
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('*, products!inner(id, name, merchant_id, product_type)')
      .eq('id', price_id)
      .single();

    if (priceError || !price) {
      return apiError('Price not found', 404);
    }

    // Verify price belongs to this merchant
    if ((price as any).products.merchant_id !== auth.merchantId) {
      return apiError('Price not found', 404);
    }

    // Generate reference code
    const referenceCode = generateReferenceCode();

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        merchant_id: auth.merchantId!,
        price_id: price_id,
        customer_phone,
        customer_email: customer_email || null,
        reference_code: referenceCode,
        amount: price.amount,
        currency: price.currency,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          ...metadata,
          success_url,
          cancel_url,
          source: 'api',
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return apiError('Failed to create checkout session', 500);
    }

    // Get merchant payment details
    const { data: merchant } = await supabase
      .from('users')
      .select('business_name, mtn_momo_number, bank_name_ssp, bank_account_number_ssp, bank_account_name_ssp, bank_name_usd, bank_account_number_usd, bank_account_name_usd')
      .eq('id', auth.merchantId!)
      .single();

    // Build checkout URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '';
    const checkoutUrl = `${baseUrl}/checkout/${(price as any).products.id}?payment=${payment.id}`;

    return apiSuccess({
      checkout_session: {
        id: payment.id,
        url: checkoutUrl,
        reference_code: referenceCode,
        amount: price.amount,
        currency: price.currency,
        expires_at: payment.expires_at,
        product: {
          id: (price as any).products.id,
          name: (price as any).products.name,
          type: (price as any).products.product_type,
        },
        price: {
          id: price.id,
          name: price.name,
          billing_cycle: price.billing_cycle,
        },
        payment_methods: {
          mtn_momo: merchant?.mtn_momo_number ? {
            number: merchant.mtn_momo_number,
            name: merchant?.business_name,
          } : null,
          bank_transfer: {
            ssp: merchant?.bank_account_number_ssp ? {
              bank_name: merchant.bank_name_ssp,
              account_number: merchant.bank_account_number_ssp,
              account_name: merchant.bank_account_name_ssp,
            } : null,
            usd: merchant?.bank_account_number_usd ? {
              bank_name: merchant.bank_name_usd,
              account_number: merchant.bank_account_number_usd,
              account_name: merchant.bank_account_name_usd,
            } : null,
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return apiError('Internal server error', 500);
  }
}
