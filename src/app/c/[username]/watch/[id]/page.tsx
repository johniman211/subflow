import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Lock, ArrowLeft, Calendar, Eye, Play, Video } from 'lucide-react';
import { PaywallModal } from '@/components/creator/paywall-modal';
import { ContentWatermark } from '@/components/creator/content-watermark';
import { ShareButton } from '@/components/creator/share-button';
import { AuthWall } from '@/components/creator/auth-wall';
import { headers } from 'next/headers';

export default async function VideoWatchPage({
  params,
  searchParams,
}: {
  params: { username: string; id: string };
  searchParams: { phone?: string };
}) {
  const { username, id } = params;
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

  if (!creator) notFound();

  // Check if id is a UUID or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Try to find content by UUID first, then by slug
  let content;
  if (isUUID) {
    const { data } = await supabase
      .from('content_items')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('id', id)
      .eq('status', 'published')
      .eq('content_type', 'video')
      .single();
    content = data;
  }
  
  if (!content) {
    const { data } = await supabase
      .from('content_items')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('slug', id)
      .eq('status', 'published')
      .eq('content_type', 'video')
      .single();
    content = data;
  }

  if (!content) notFound();

  // Determine access based on new logic
  const isFreeContent = content.is_free || content.visibility === 'free';
  let accessDecision: 'granted' | 'auth_required' | 'paywall' = 'granted';
  let hasAccess = false;

  if (isFreeContent) {
    // FREE content - anyone can access
    hasAccess = true;
    accessDecision = 'granted';
    // Log anonymous view
    await supabase.rpc('increment_content_view', { p_content_id: content.id });
  } else {
    // PREMIUM content
    if (!userId && !customerPhone) {
      // Not logged in and no phone - show auth wall
      accessDecision = 'auth_required';
      hasAccess = false;
    } else {
      // Check entitlement
      let userPhone = customerPhone;
      
      // Try to get phone from user record if logged in
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

      if (hasAccess) {
        accessDecision = 'granted';
        // Log premium view with user info
        await supabase.rpc('increment_content_view', { p_content_id: content.id });
      } else {
        accessDecision = 'paywall';
      }
    }
  }

  // Get products for paywall
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

  const headersList = headers();
  const currentUrl = `https://payssd.com/c/${username}/watch/${id}`;
  const shareUrl = currentUrl;

  // Fetch related videos from the same creator
  const { data: relatedVideos } = await supabase
    .from('content_items')
    .select('id, title, description, video_platform, is_free, view_count, published_at')
    .eq('creator_id', creator.id)
    .eq('content_type', 'video')
    .eq('status', 'published')
    .neq('id', id)
    .order('published_at', { ascending: false })
    .limit(10);

  const getEmbedUrl = () => {
    switch (content.video_platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${content.video_embed_id}?rel=0&modestbranding=1`;
      case 'facebook':
        return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${content.video_embed_id}&show_text=false`;
      default:
        return null;
    }
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {accessDecision === 'granted' ? (
          <>
            <ContentWatermark customerPhone={customerPhone || user?.email || 'Viewer'} creatorName={creator.display_name} />
            <div className="relative bg-black rounded-xl overflow-hidden mb-6">
              {embedUrl ? (
                <iframe src={embedUrl} className="w-full aspect-video" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-dark-800">
                  <p className="text-dark-400">Video player not available</p>
                </div>
              )}
            </div>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{content.title}</h1>
              <div className="flex items-center gap-4 text-dark-400 text-sm mb-4">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(content.published_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{content.view_count} views</span>
              </div>
              {content.description && <p className="text-dark-300">{content.description}</p>}
            </div>
          </>
        ) : accessDecision === 'auth_required' ? (
          <>
            <div className="relative bg-dark-800 rounded-xl overflow-hidden mb-6">
              <div className="w-full aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-16 w-16 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400 text-lg">Premium Content</p>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{content.title}</h1>
              {content.description && <p className="text-dark-300 mb-8">{content.description}</p>}
            </div>
            <AuthWall 
              contentTitle={content.title}
              creatorName={creator.display_name}
              redirectUrl={currentUrl}
              contentType="video"
            />
          </>
        ) : (
          <>
            <div className="relative bg-dark-800 rounded-xl overflow-hidden mb-6">
              <div className="w-full aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-16 w-16 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400 text-lg">This video is for subscribers only</p>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{content.title}</h1>
              <div className="flex items-center gap-2 text-amber-400 text-sm mb-4"><Lock className="h-4 w-4" />Premium Content</div>
              {content.description && <p className="text-dark-300 mb-8">{content.description}</p>}
            </div>
            <PaywallModal creatorName={creator.display_name} creatorUsername={username} contentTitle={content.title} contentType="video" products={products} />
          </>
        )}

        {/* Related Videos Section */}
        {relatedVideos && relatedVideos.length > 0 && (
          <div className="mt-12 pt-8 border-t border-dark-800">
            <h2 className="text-xl font-bold text-white mb-6">More from {creator.display_name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedVideos.map((video: any) => (
                <Link
                  key={video.id}
                  href={`/c/${username}/watch/${video.id}${customerPhone ? `?phone=${customerPhone}` : ''}`}
                  className="group block bg-dark-900/50 border border-dark-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
                >
                  <div className="relative aspect-video bg-dark-800 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                    <Video className="h-12 w-12 text-dark-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                    </div>
                    {!video.is_free && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500/90 rounded text-xs font-medium text-white flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-white line-clamp-2 group-hover:text-purple-400 transition-colors mb-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-dark-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.view_count} views
                      </span>
                      <span className="capitalize">{video.video_platform}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

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
