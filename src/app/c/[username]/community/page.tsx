import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Lock, ArrowLeft, MessageSquare, Heart, Pin, Calendar } from 'lucide-react';
import { ShareButton } from '@/components/creator/share-button';
import { AuthWall } from '@/components/creator/auth-wall';
import { PaywallModal } from '@/components/creator/paywall-modal';

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { phone?: string };
}) {
  const { username } = params;
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

  // Community is premium by default
  const communityIsPremium = creator.community_is_premium !== false;
  let accessDecision: 'granted' | 'auth_required' | 'paywall' = 'granted';

  if (!communityIsPremium) {
    accessDecision = 'granted';
  } else {
    // PREMIUM community
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

      // Check if user has any active subscription with this creator
      let hasAccess = false;
      if (userPhone) {
        const { data: creatorProducts } = await supabase
          .from('products')
          .select('id')
          .eq('merchant_id', creator.user_id)
          .eq('is_active', true);

        if (creatorProducts && creatorProducts.length > 0) {
          const productIds = creatorProducts.map(p => p.id);
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('customer_phone', userPhone)
            .in('product_id', productIds)
            .eq('status', 'active')
            .gte('current_period_end', new Date().toISOString())
            .limit(1)
            .single();
          hasAccess = !!subscription;
        }
      }

      accessDecision = hasAccess ? 'granted' : 'paywall';
    }
  }

  // Get products for paywall
  let products: any[] = [];
  if (accessDecision === 'paywall') {
    const { data: productData } = await supabase
      .from('products')
      .select('id, name, merchant_id')
      .eq('merchant_id', creator.user_id)
      .eq('is_active', true);
    
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

  // Get community posts if access granted
  let posts: any[] = [];
  if (accessDecision === 'granted') {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .eq('creator_id', creator.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    posts = data || [];
  }

  const currentUrl = `https://payssd.com/c/${username}/community`;
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
          <ShareButton url={shareUrl} title={`${creator.display_name}'s Community`} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {creator.display_name}'s Community
          </h1>
          <p className="text-dark-400">
            {communityIsPremium ? 'Members-only discussions and updates' : 'Join the conversation'}
          </p>
        </div>

        {accessDecision === 'granted' ? (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-dark-900/50 border border-dark-800 rounded-2xl">
                <MessageSquare className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <p className="text-dark-400">No posts yet</p>
                <p className="text-dark-500 text-sm mt-2">Check back later for updates from {creator.display_name}</p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-dark-900/50 border border-dark-800 rounded-2xl p-6"
                >
                  {post.is_pinned && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-3">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {post.is_creator_post ? creator.display_name?.charAt(0) : post.author_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {post.is_creator_post ? creator.display_name : post.author_name || 'Member'}
                        {post.is_creator_post && (
                          <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Creator</span>
                        )}
                      </p>
                      <p className="text-dark-500 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {post.title && (
                    <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                  )}
                  
                  <p className="text-dark-200 whitespace-pre-wrap">{post.body}</p>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-800">
                    <span className="flex items-center gap-1 text-dark-400 text-sm">
                      <Heart className="h-4 w-4" />
                      {post.like_count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : accessDecision === 'auth_required' ? (
          <AuthWall 
            contentTitle={`${creator.display_name}'s Community`}
            creatorName={creator.display_name}
            redirectUrl={currentUrl}
            contentType="community"
          />
        ) : (
          <PaywallModal 
            creatorName={creator.display_name}
            creatorUsername={username}
            contentTitle="Community Access"
            contentType="post"
            products={products}
          />
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
          <p className="text-dark-500 text-sm">Members-only community · Powered by PaySSD</p>
        </div>
      </footer>
    </div>
  );
}
