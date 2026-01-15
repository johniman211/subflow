import { createServerSupabaseClient } from '@/lib/supabase/server';

export type AccessDecision = 
  | { access: 'granted'; reason: 'free' | 'entitled' }
  | { access: 'auth_required'; reason: 'premium_no_auth'; redirectUrl: string }
  | { access: 'paywall'; reason: 'not_entitled'; products: any[] }
  | { access: 'denied'; reason: 'not_found' | 'not_published' };

export interface ContentAccessParams {
  contentId: string;
  userId?: string | null;
  userPhone?: string | null;
  currentUrl: string;
}

export interface CommunityAccessParams {
  creatorId: string;
  userId?: string | null;
  userPhone?: string | null;
  currentUrl: string;
}

export async function getContentAccessDecision(params: ContentAccessParams): Promise<AccessDecision> {
  const { contentId, userId, userPhone, currentUrl } = params;
  const supabase = createServerSupabaseClient();

  // 1. Load content
  const { data: content } = await supabase
    .from('content_items')
    .select('*, creators(id, user_id, display_name, username)')
    .eq('id', contentId)
    .single();

  if (!content) {
    // Try by slug
    const { data: contentBySlug } = await supabase
      .from('content_items')
      .select('*, creators(id, user_id, display_name, username)')
      .eq('slug', contentId)
      .single();
    
    if (!contentBySlug) {
      return { access: 'denied', reason: 'not_found' };
    }
    
    return getContentAccessDecisionInternal(contentBySlug, userId, userPhone, currentUrl, supabase);
  }

  return getContentAccessDecisionInternal(content, userId, userPhone, currentUrl, supabase);
}

async function getContentAccessDecisionInternal(
  content: any,
  userId: string | null | undefined,
  userPhone: string | null | undefined,
  currentUrl: string,
  supabase: any
): Promise<AccessDecision> {
  // Check if published
  if (content.status !== 'published') {
    return { access: 'denied', reason: 'not_published' };
  }

  // 2. If content is FREE, allow access
  if (content.is_free || content.visibility === 'free') {
    return { access: 'granted', reason: 'free' };
  }

  // 3. Content is PREMIUM - check auth
  if (!userId) {
    // No logged-in user -> Auth Wall
    const encodedUrl = encodeURIComponent(currentUrl);
    return { 
      access: 'auth_required', 
      reason: 'premium_no_auth',
      redirectUrl: `/auth/login?next=${encodedUrl}`
    };
  }

  // 4. User is logged in - check entitlement
  const isEntitled = await checkUserEntitlement(userId, userPhone, content.product_ids, supabase);

  if (!isEntitled) {
    // Get products for paywall
    const products = await getProductsWithPrices(content.product_ids, supabase);
    return { access: 'paywall', reason: 'not_entitled', products };
  }

  // 5. User is entitled - grant access
  return { access: 'granted', reason: 'entitled' };
}

export async function getCommunityAccessDecision(params: CommunityAccessParams): Promise<AccessDecision> {
  const { creatorId, userId, userPhone, currentUrl } = params;
  const supabase = createServerSupabaseClient();

  // Get creator
  const { data: creator } = await supabase
    .from('creators')
    .select('*, users!creators_user_id_fkey(id)')
    .eq('id', creatorId)
    .single();

  if (!creator) {
    return { access: 'denied', reason: 'not_found' };
  }

  // Check if community is premium (default true)
  const communityIsPremium = creator.community_is_premium !== false;

  if (!communityIsPremium) {
    return { access: 'granted', reason: 'free' };
  }

  // Community is premium - check auth
  if (!userId) {
    const encodedUrl = encodeURIComponent(currentUrl);
    return { 
      access: 'auth_required', 
      reason: 'premium_no_auth',
      redirectUrl: `/auth/login?next=${encodedUrl}`
    };
  }

  // Check if user has any active subscription with this creator
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, product_id, products(name)')
    .eq('customer_phone', userPhone)
    .eq('status', 'active')
    .gte('current_period_end', new Date().toISOString());

  // Filter to only subscriptions for this creator's products
  const { data: creatorProducts } = await supabase
    .from('products')
    .select('id')
    .eq('merchant_id', creator.user_id);

  const creatorProductIds = creatorProducts?.map((p: any) => p.id) || [];
  const hasAccess = subscriptions?.some((s: any) => creatorProductIds.includes(s.product_id));

  if (!hasAccess) {
    // Get all products from this creator for paywall
    const products = await getCreatorProductsWithPrices(creator.user_id, supabase);
    return { access: 'paywall', reason: 'not_entitled', products };
  }

  return { access: 'granted', reason: 'entitled' };
}

async function checkUserEntitlement(
  userId: string,
  userPhone: string | null | undefined,
  productIds: string[],
  supabase: any
): Promise<boolean> {
  if (!productIds || productIds.length === 0) {
    return false;
  }

  // If we have user phone, check subscriptions
  if (userPhone) {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('customer_phone', userPhone)
      .in('product_id', productIds)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      return true;
    }
  }

  // Also try to get phone from user record
  const { data: user } = await supabase
    .from('users')
    .select('phone')
    .eq('id', userId)
    .single();

  if (user?.phone && user.phone !== userPhone) {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('customer_phone', user.phone)
      .in('product_id', productIds)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      return true;
    }
  }

  return false;
}

async function getProductsWithPrices(productIds: string[], supabase: any) {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, merchant_id')
    .in('id', productIds)
    .eq('is_active', true);

  if (!products) return [];

  const productsWithPrices = await Promise.all(
    products.map(async (product: any) => {
      const { data: prices } = await supabase
        .from('prices')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('amount', { ascending: true })
        .limit(1);

      return { ...product, price: prices?.[0] };
    })
  );

  return productsWithPrices;
}

async function getCreatorProductsWithPrices(merchantUserId: string, supabase: any) {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, merchant_id')
    .eq('merchant_id', merchantUserId)
    .eq('is_active', true);

  if (!products) return [];

  const productsWithPrices = await Promise.all(
    products.map(async (product: any) => {
      const { data: prices } = await supabase
        .from('prices')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('amount', { ascending: true })
        .limit(1);

      return { ...product, price: prices?.[0] };
    })
  );

  return productsWithPrices;
}

export async function logContentView(params: {
  contentId: string;
  viewerUserId?: string | null;
  viewerPhone?: string | null;
  isPremium: boolean;
  ipHash?: string;
  userAgent?: string;
}) {
  const supabase = createServerSupabaseClient();
  
  // Get content to find creator_id
  const { data: content } = await supabase
    .from('content_items')
    .select('creator_id')
    .eq('id', params.contentId)
    .single();

  if (!content) return null;

  const { data } = await supabase
    .from('content_views')
    .insert({
      content_id: params.contentId,
      creator_id: content.creator_id,
      viewer_user_id: params.viewerUserId || null,
      viewer_phone: params.viewerPhone || null,
      is_premium: params.isPremium,
      ip_hash: params.ipHash || null,
      user_agent: params.userAgent || null,
    })
    .select('id')
    .single();

  // Also increment view count
  await supabase.rpc('increment_content_view', { p_content_id: params.contentId });

  return data?.id;
}
