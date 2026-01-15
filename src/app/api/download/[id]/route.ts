import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const customerPhone = searchParams.get('phone');
  
  const supabase = createServerSupabaseClient();

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Get content
  const { data: content } = await supabase
    .from('content_items')
    .select('*, creators(id, user_id)')
    .eq('id', id)
    .eq('status', 'published')
    .eq('content_type', 'file')
    .single();

  if (!content) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Check access
  const isFreeContent = content.is_free || content.visibility === 'free';
  let hasAccess = false;

  if (isFreeContent) {
    hasAccess = true;
  } else {
    // PREMIUM content - must be authenticated or have valid phone
    if (!userId && !customerPhone) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userPhone = customerPhone;
    
    if (userId && !userPhone) {
      const { data: userData } = await supabase
        .from('users')
        .select('phone')
        .eq('id', userId)
        .single();
      userPhone = userData?.phone;
    }

    if (userPhone && content.product_ids?.length > 0) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('customer_phone', userPhone)
        .in('product_id', content.product_ids)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString())
        .limit(1)
        .single();
      hasAccess = !!subscription;
    }
  }

  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Increment download count
  await supabase.rpc('increment_content_download', { p_content_id: content.id });

  // Log the download view
  try {
    await supabase.from('content_views').insert({
      content_id: content.id,
      creator_id: content.creator_id,
      viewer_user_id: userId || null,
      viewer_phone: customerPhone || null,
      is_premium: !isFreeContent,
    });
  } catch (e) {
    // Ignore view logging errors
  }

  // Redirect to the actual file URL
  // In production, you might want to generate a short-lived signed URL
  return NextResponse.redirect(content.file_url);
}
