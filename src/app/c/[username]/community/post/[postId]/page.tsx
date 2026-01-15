import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Heart, Pin, Calendar, MessageSquare } from 'lucide-react';
import { ShareButton } from '@/components/creator/share-button';
import { CommentSection } from '@/components/creator/comment-section';

export default async function CommunityPostPage({
  params,
}: {
  params: { username: string; postId: string };
}) {
  const { username, postId } = params;
  const supabase = createServerSupabaseClient();

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Get user phone if logged in
  let userPhone: string | null = null;
  let userName: string | null = null;
  if (userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('phone, full_name')
      .eq('id', userId)
      .single();
    userPhone = userData?.phone || null;
    userName = userData?.full_name || null;
  }

  // Get creator
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (!creator) notFound();

  // Get the post
  const { data: post } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .eq('creator_id', creator.id)
    .single();

  if (!post) notFound();

  // Check access for premium community
  const communityIsPremium = creator.community_is_premium !== false;
  let hasAccess = !communityIsPremium;

  if (communityIsPremium && userPhone) {
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

  const currentUrl = `https://payssd.com/c/${username}/community/post/${postId}`;
  const shareTitle = post.title || `Post by ${creator.display_name}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/c/${username}/community`} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href={`/c/${username}`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{creator.display_name?.charAt(0) || 'C'}</span>
              </div>
              <span className="font-medium text-white">{creator.display_name}</span>
            </Link>
          </div>
          <ShareButton url={currentUrl} title={shareTitle} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!hasAccess && communityIsPremium ? (
          <div className="text-center py-16 bg-dark-900/50 border border-dark-800 rounded-2xl">
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Members Only</h2>
            <p className="text-dark-400 mb-6">Subscribe to access this community post</p>
            <Link 
              href={`/c/${username}`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              View Subscription Options
            </Link>
          </div>
        ) : (
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-6">
            {post.is_pinned && (
              <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-3">
                <Pin className="h-3 w-3" />
                Pinned Post
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {post.is_creator_post ? creator.display_name?.charAt(0) : post.author_name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">
                    {post.is_creator_post ? creator.display_name : post.author_name || 'Member'}
                  </p>
                  {post.is_creator_post && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Creator</span>
                  )}
                </div>
                <p className="text-dark-500 text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.created_at)}
                </p>
              </div>
            </div>

            {post.title && (
              <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
            )}
            
            <div className="prose prose-invert max-w-none">
              <p className="text-dark-200 whitespace-pre-wrap text-lg leading-relaxed">{post.body}</p>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-dark-700">
              <span className="flex items-center gap-1.5 text-dark-400 text-sm">
                <Heart className="h-4 w-4" />
                {post.like_count} likes
              </span>
            </div>

            {/* Comment Section */}
            <CommentSection 
              postId={postId}
              creatorName={creator.display_name}
              userPhone={userPhone}
              userName={userName}
              isLoggedIn={!!userId}
            />
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
          <p className="text-dark-500 text-sm">Members-only community · Powered by PaySSD</p>
        </div>
      </footer>
    </div>
  );
}
