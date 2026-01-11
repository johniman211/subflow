import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Cron job to expire pending payments after 24 hours
// Runs every 30 minutes
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  try {
    // Find and expire pending payments that are past their expiry time
    const { data: expiredPayments, error } = await supabase
      .from('payments')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())
      .select('id, reference_code, customer_phone');

    if (error) {
      console.error('Error expiring payments:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      expired_count: expiredPayments?.length || 0,
      expired_payments: expiredPayments?.map(p => p.reference_code) || [],
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
