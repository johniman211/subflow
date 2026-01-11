import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceCode, transactionId, proofUrl } = body;

    if (!referenceCode) {
      return NextResponse.json({ error: 'Reference code is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Update payment to matched status
    const { data, error } = await supabase
      .from('payments')
      .update({
        transaction_id: transactionId || null,
        proof_url: proofUrl || null,
        status: 'matched',
        matched_at: new Date().toISOString(),
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

    return NextResponse.json({ success: true, payment: data });
  } catch (error: any) {
    console.error('Payment submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
