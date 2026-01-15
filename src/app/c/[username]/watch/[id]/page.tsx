import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Lock, ArrowLeft, Calendar, Eye } from 'lucide-react';
import { PaywallModal } from '@/components/creator/paywall-modal';
import { ContentWatermark } from '@/components/creator/content-watermark';
import { ShareButton } from '@/components/creator/share-button';

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

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (!creator) notFound();

  const { data: content } = await supabase
    .from('content_items')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('id', id)
    .eq('status', 'published')
    .eq('content_type', 'video')
    .single();

  if (!content) notFound();

  await supabase.rpc('increment_content_view', { p_content_id: content.id });

  let hasAccess = content.is_free;
  
  if (!hasAccess && customerPhone) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('customer_phone', customerPhone)
      .in('product_id', content.product_ids || [])
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .limit(1)
      .single();
    hasAccess = !!subscription;
  }

  let products: any[] = [];
  if (!hasAccess && content.product_ids?.length > 0) {
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

  const shareUrl = `https://payssd.com/c/${username}/watch/${id}`;

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
        {hasAccess ? (
          <>
            <ContentWatermark customerPhone={customerPhone || 'Guest'} creatorName={creator.display_name} />
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
