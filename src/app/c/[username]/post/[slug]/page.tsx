import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Lock, ArrowLeft, Calendar, Eye } from 'lucide-react';
import { PaywallModal } from '@/components/creator/paywall-modal';
import { ContentWatermark } from '@/components/creator/content-watermark';
import { ShareButton } from '@/components/creator/share-button';
import { AuthWall } from '@/components/creator/auth-wall';

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: { username: string; slug: string };
  searchParams: { phone?: string };
}) {
  const { username, slug } = params;
  const customerPhone = searchParams.phone;
  const supabase = createServerSupabaseClient();

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (!creator) {
    notFound();
  }

  const { data: content } = await supabase
    .from('content_items')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!content) {
    notFound();
  }

  // Determine access based on new logic
  const isFreeContent = content.is_free || content.visibility === 'free';
  let accessDecision: 'granted' | 'auth_required' | 'paywall' = 'granted';

  if (isFreeContent) {
    accessDecision = 'granted';
    await supabase.rpc('increment_content_view', { p_content_id: content.id });
  } else {
    // PREMIUM content
    if (!userId && !customerPhone) {
      accessDecision = 'auth_required';
    } else {
      let userPhone = customerPhone;
      
      if (userId && !userPhone) {
        const { data: userData } = await supabase
          .from('users')
          .select('phone')
          .eq('id', userId)
          .single();
        userPhone = userData?.phone;
      }

      let hasAccess = false;
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

      if (hasAccess) {
        accessDecision = 'granted';
        await supabase.rpc('increment_content_view', { p_content_id: content.id });
      } else {
        accessDecision = 'paywall';
      }
    }
  }

  let products: any[] = [];
  if (accessDecision === 'paywall' && content.product_ids?.length > 0) {
    const { data: productData } = await supabase
      .from('products')
      .select('id, name, merchant_id')
      .in('id', content.product_ids);
    
    if (productData) {
      for (const product of productData) {
        const { data: prices } = await supabase
          .from('prices')
          .select('*')
          .eq('product_id', product.id)
          .eq('is_active', true)
          .order('amount', { ascending: true })
          .limit(1);
        
        products.push({ ...product, price: prices?.[0] });
      }
    }
  }

  const currentUrl = `https://payssd.com/c/${username}/post/${slug}`;
  const shareUrl = currentUrl;

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/c/${username}`} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href={`/c/${username}`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{creator.display_name?.charAt(0) || 'C'}</span>
              </div>
              <span className="font-medium text-white">{creator.display_name}</span>
            </Link>
          </div>
          <ShareButton url={shareUrl} title={content.title} />
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{content.title}</h1>
          <div className="flex items-center gap-4 text-dark-400 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(content.published_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {content.view_count} views
            </span>
            {!content.is_free && (
              <span className="flex items-center gap-1 text-amber-400">
                <Lock className="h-4 w-4" />
                Premium
              </span>
            )}
          </div>
        </header>

        {content.preview_content && (
          <div className="prose prose-invert prose-lg max-w-none mb-8">
            <div className="text-dark-200 leading-relaxed whitespace-pre-wrap">{content.preview_content}</div>
          </div>
        )}

        {accessDecision === 'granted' ? (
          <div className="relative">
            <ContentWatermark customerPhone={customerPhone || user?.email || 'Viewer'} creatorName={creator.display_name} />
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-dark-200 leading-relaxed whitespace-pre-wrap">{content.body_content || ''}</div>
            </div>
          </div>
        ) : accessDecision === 'auth_required' ? (
          <div className="relative">
            {content.body_content && (
              <div className="relative overflow-hidden max-h-32">
                <div className="text-dark-200 leading-relaxed whitespace-pre-wrap blur-sm select-none">
                  {content.body_content.slice(0, 300)}...
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/50 to-dark-950" />
              </div>
            )}
            <AuthWall 
              contentTitle={content.title}
              creatorName={creator.display_name}
              redirectUrl={currentUrl}
              contentType="post"
            />
          </div>
        ) : (
          <div className="relative">
            {content.body_content && (
              <div className="relative overflow-hidden max-h-64">
                <div className="text-dark-200 leading-relaxed whitespace-pre-wrap blur-sm select-none">
                  {content.body_content.slice(0, 500)}...
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/50 to-dark-950" />
              </div>
            )}
            <PaywallModal 
              creatorName={creator.display_name}
              creatorUsername={username}
              contentTitle={content.title}
              contentType="post"
              products={products}
            />
          </div>
        )}
      </article>

      <footer className="bg-dark-900 border-t border-dark-800 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-[#F7C500] rounded-full flex items-center justify-center">
              <span className="text-[#333] font-black text-[8px] italic">PAY</span>
            </div>
            <span className="text-white font-black text-sm italic">SSD</span>
          </div>
          <p className="text-dark-500 text-sm">Premium content · Powered by PaySSD</p>
        </div>
      </footer>
    </div>
  );
}
