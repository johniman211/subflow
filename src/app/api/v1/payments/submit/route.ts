import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateReferenceCode, getPaymentExpiryDate } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, price_id, customer_phone, customer_email, payment_method } = body;

    if (!product_id || !price_id || !customer_phone) {
      return NextResponse.json(
        { error: 'product_id, price_id, and customer_phone are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get price details
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('*, products(merchant_id)')
      .eq('id', price_id)
      .single();

    if (priceError || !price) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

    // Generate reference code
    const referenceCode = generateReferenceCode();
    const expiresAt = getPaymentExpiryDate(24);

    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        merchant_id: price.products.merchant_id,
        price_id: price_id,
        customer_phone: customer_phone,
        customer_email: customer_email || null,
        reference_code: referenceCode,
        amount: price.amount,
        currency: price.currency,
        payment_method: payment_method || 'mtn_momo',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // Get merchant payment details
    const { data: merchant } = await supabase
      .from('users')
      .select('mtn_momo_number, bank_name, bank_account_number, bank_account_name')
      .eq('id', price.products.merchant_id)
      .single();

    return NextResponse.json({
      payment_id: payment.id,
      reference_code: referenceCode,
      amount: price.amount,
      currency: price.currency,
      expires_at: expiresAt.toISOString(),
      payment_instructions: {
        mtn_momo_number: merchant?.mtn_momo_number,
        bank_name: merchant?.bank_name,
        bank_account_number: merchant?.bank_account_number,
        bank_account_name: merchant?.bank_account_name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
