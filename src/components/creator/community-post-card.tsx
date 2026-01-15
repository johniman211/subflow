'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Pin, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { PostShareButton } from './post-share-button';
import { CommentSection } from './comment-section';
import { createClient } from '@/lib/supabase/client';

interface Post {
  id: string;
  title: string | null;
  body: string;
  is_pinned: boolean;
  is_creator_post: boolean;
  author_name: string | null;
  like_count: number;
  created_at: string;
}

interface Creator {
  id: string;
  display_name: string;
  username: string;
}

interface CommunityPostCardProps {
  post: Post;
  creator: Creator;
  username: string;
}

export function CommunityPostCard({ post, creator, username }: CommunityPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  const supabase = createClient();

  // Load comment count on mount
  useEffect(() => {
    const loadCount = async () => {
      const { count } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      setCommentCount(count || 0);
      setIsLoadingCount(false);
    };
    loadCount();
  }, [post.id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-dark-900/50 border border-dark-800 rounded-2xl overflow-hidden hover:border-dark-700 transition-colors">
      <div className="p-5 sm:p-6">
        {post.is_pinned && (
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium mb-3">
            <Pin className="h-3.5 w-3.5" />
            Pinned Post
          </div>
        )}
        
        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              post.is_creator_post 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-dark-700'
            }`}>
              <span className="text-white font-bold text-sm">
                {post.is_creator_post ? creator.display_name?.charAt(0) : post.author_name?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">
                  {post.is_creator_post ? creator.display_name : post.author_name || 'Member'}
                </p>
                {post.is_creator_post && (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                    Creator
                  </span>
                )}
              </div>
              <p className="text-dark-500 text-sm">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Post Content */}
        {post.title && (
          <Link 
            href={`/c/${username}/community/post/${post.id}`}
            className="block"
          >
            <h3 className="text-lg font-semibold text-white mb-2 hover:text-purple-400 transition-colors">
              {post.title}
            </h3>
          </Link>
        )}
        
        <p className="text-dark-200 whitespace-pre-wrap leading-relaxed">
          {post.body.length > 300 ? (
            <>
              {post.body.slice(0, 300)}...
              <Link 
                href={`/c/${username}/community/post/${post.id}`}
                className="text-purple-400 hover:text-purple-300 ml-1"
              >
                Read more
              </Link>
            </>
          ) : post.body}
        </p>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-dark-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-dark-400 text-sm">
              <Heart className="h-4 w-4" />
              {post.like_count}
            </span>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-dark-400 hover:text-white text-sm transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              {isLoadingCount ? '...' : commentCount}
              {showComments ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href={`/c/${username}/community/post/${post.id}`}
              className="text-dark-400 hover:text-white text-sm px-3 py-1.5 hover:bg-dark-700 rounded-lg transition-colors"
            >
              View Post
            </Link>
            <PostShareButton 
              postId={post.id} 
              creatorUsername={username} 
              postTitle={post.title || undefined}
            />
          </div>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <CommentSection
            postId={post.id}
            creatorName={creator.display_name}
            isLoggedIn={false}
          />
        </div>
      )}
    </div>
  );
}
