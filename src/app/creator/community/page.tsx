'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Plus,
  MessageSquare,
  Heart,
  MessageCircle,
  Pin,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react';

interface CommunityPost {
  id: string;
  title: string;
  body: string;
  author_name: string;
  author_phone: string;
  is_pinned: boolean;
  is_creator_post: boolean;
  like_count: number;
  created_at: string;
}

export default function CommunityPage() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!creator) {
      setLoading(false);
      return;
    }

    setCreatorId(creator.id);

    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .eq('creator_id', creator.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }

    setLoading(false);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const supabase = createClient();
    await supabase.from('community_posts').delete().eq('id', postId);
    setPosts(posts.filter(p => p.id !== postId));
  };

  const likePost = async (postId: string) => {
    const supabase = createClient();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newLikeCount = post.like_count + 1;
    await supabase
      .from('community_posts')
      .update({ like_count: newLikeCount })
      .eq('id', postId);

    setPosts(posts.map(p => 
      p.id === postId ? { ...p, like_count: newLikeCount } : p
    ));
  };

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const togglePin = async (postId: string, currentlyPinned: boolean) => {
    const supabase = createClient();
    await supabase
      .from('community_posts')
      .update({ is_pinned: !currentlyPinned })
      .eq('id', postId);
    
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, is_pinned: !currentlyPinned } : p
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Community
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Connect with your subscribers
          </p>
        </div>
        <Link
          href="/creator/community/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          New Post
        </Link>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <MessageSquare className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No community posts yet
          </h3>
          <p className={cn("mb-6", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Start engaging with your subscribers
          </p>
          <Link
            href="/creator/community/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
          >
            <Plus className="h-5 w-5" />
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={cn(
                "p-6 rounded-xl border",
                post.is_pinned 
                  ? theme === 'dark' 
                    ? 'bg-purple-500/10 border-purple-500/30' 
                    : 'bg-purple-50 border-purple-200'
                  : theme === 'dark' 
                    ? 'bg-dark-800 border-dark-700' 
                    : 'bg-white border-gray-200'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    post.is_creator_post 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : theme === 'dark' ? 'bg-dark-700' : 'bg-gray-200'
                  )}>
                    <span className="text-white font-bold text-sm">
                      {post.author_name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {post.author_name || 'Anonymous'}
                      {post.is_creator_post && (
                        <span className="ml-2 text-xs text-purple-400">Creator</span>
                      )}
                    </p>
                    <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.is_pinned && (
                    <Pin className="h-4 w-4 text-purple-400" />
                  )}
                  <div className="relative group">
                    <button className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                    )}>
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <div className={cn(
                      "absolute right-0 mt-1 w-40 rounded-xl border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10",
                      theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
                    )}>
                      <button
                        onClick={() => togglePin(post.id, post.is_pinned)}
                        className={cn(
                          "w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors",
                          theme === 'dark' ? 'hover:bg-dark-700 text-white' : 'hover:bg-gray-100'
                        )}
                      >
                        <Pin className="h-4 w-4" />
                        {post.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {post.title && (
                <h3 className={cn("font-semibold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {post.title}
                </h3>
              )}
              <p className={cn("whitespace-pre-wrap", theme === 'dark' ? 'text-dark-300' : 'text-gray-700')}>
                {post.body}
              </p>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-700">
                <button 
                  onClick={() => likePost(post.id)}
                  className={cn(
                    "flex items-center gap-1 text-sm transition-colors cursor-pointer",
                    theme === 'dark' ? 'text-dark-400 hover:text-pink-400' : 'text-gray-500 hover:text-pink-500'
                  )}
                >
                  <Heart className="h-4 w-4" />
                  {post.like_count}
                </button>
                <button 
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  className={cn(
                    "flex items-center gap-1 text-sm transition-colors cursor-pointer",
                    theme === 'dark' ? 'text-dark-400 hover:text-purple-400' : 'text-gray-500 hover:text-purple-500'
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  Reply
                </button>
              </div>

              {replyingTo === post.id && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border resize-none mb-3",
                      theme === 'dark' 
                        ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                        : 'bg-gray-50 border-gray-300'
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm",
                        theme === 'dark' ? 'bg-dark-700 text-white' : 'bg-gray-200'
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert('Reply feature coming soon!');
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-4 py-2 rounded-lg text-sm bg-purple-500 text-white"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
