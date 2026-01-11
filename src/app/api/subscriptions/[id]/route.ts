import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// PATCH /api/subscriptions/[id] - Update subscription (pause, resume, cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, reason, resume_at } = body;

    // Verify subscription belongs to merchant
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, merchant_id, status')
      .eq('id', params.id)
      .single();

    if (!subscription || (subscription as any).merchant_id !== user.id) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    let updateData: any = { updated_at: now };

    switch (action) {
      case 'pause':
        if ((subscription as any).status !== 'active') {
          return Response.json({ error: 'Only active subscriptions can be paused' }, { status: 400 });
        }
        updateData.paused_at = now;
        updateData.resume_at = resume_at || null;
        updateData.status = 'paused';
        break;

      case 'resume':
        if ((subscription as any).status !== 'paused') {
          return Response.json({ error: 'Only paused subscriptions can be resumed' }, { status: 400 });
        }
        updateData.paused_at = null;
        updateData.resume_at = null;
        updateData.status = 'active';
        break;

      case 'cancel':
        if ((subscription as any).status === 'cancelled') {
          return Response.json({ error: 'Subscription is already cancelled' }, { status: 400 });
        }
        updateData.cancelled_at = now;
        updateData.cancelled_reason = reason || null;
        updateData.status = 'cancelled';
        break;

      case 'reactivate':
        if ((subscription as any).status !== 'cancelled' && (subscription as any).status !== 'expired') {
          return Response.json({ error: 'Only cancelled or expired subscriptions can be reactivated' }, { status: 400 });
        }
        updateData.cancelled_at = null;
        updateData.cancelled_reason = null;
        updateData.status = 'active';
        updateData.current_period_start = now;
        // Extend period by 1 month by default
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        updateData.current_period_end = endDate.toISOString();
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', params.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, action, subscription_id: params.id });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
