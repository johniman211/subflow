import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { 
  notifyMerchantPaymentPending,
  notifyAdminPaymentPending,
} from '@/lib/platform-notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceCode, transactionId, proofUrl } = body;

    if (!referenceCode) {
      return NextResponse.json({ error: 'Reference code is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Only mark as "matched" if customer provides transaction proof
    // Otherwise keep as "pending" but record that customer claims to have paid
    const hasProof = transactionId || proofUrl;
    const newStatus = hasProof ? 'matched' : 'pending';

    // Update payment with proof details
    const { data, error } = await supabase
      .from('payments')
      .update({
        transaction_id: transactionId || null,
        proof_url: proofUrl || null,
        status: newStatus,
        matched_at: hasProof ? new Date().toISOString() : null,
      })
      .eq('reference_code', referenceCode)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Payment update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Payment not found or already processed' }, { status: 404 });
    }

    // Send notifications for payment pending
    try {
      // Get payment with product info
      const { data: paymentDetails } = await supabase
        .from('payments')
        .select('*, prices(*, products(*))')
        .eq('id', data.id)
        .single();

      if (paymentDetails) {
        const productName = (paymentDetails as any).prices?.products?.name || 'Product';
        const amount = (paymentDetails as any).amount;
        const currency = (paymentDetails as any).currency;
        const customerPhone = (paymentDetails as any).customer_phone;
        const referenceCode = (paymentDetails as any).reference_code;

        // Get merchant info
        const { data: merchant } = await supabase
          .from('users')
          .select('email, phone, business_name, full_name')
          .eq('id', (paymentDetails as any).merchant_id)
          .single();

        const merchantEmail = (merchant as any)?.email;
        const merchantPhone = (merchant as any)?.phone;
        const merchantName = (merchant as any)?.business_name || (merchant as any)?.full_name || 'Merchant';

        // Notify merchant about pending payment
        if (merchantEmail) {
          await notifyMerchantPaymentPending({
            merchantEmail,
            merchantPhone,
            merchantName,
            customerPhone,
            amount,
            currency,
            productName,
            referenceCode,
          });
        }

        // Notify admin about pending payment
        await notifyAdminPaymentPending({
          merchantName,
          customerPhone,
          amount,
          currency,
          productName,
          referenceCode,
        });
      }
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    return NextResponse.json({ success: true, payment: data });
  } catch (error: any) {
    console.error('Payment submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
