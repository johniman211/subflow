'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  post_id: string;
  author_phone: string;
  author_name: string | null;
  body: string;
  is_creator_reply: boolean;
  like_count: number;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  creatorName: string;
  userPhone?: string | null;
  userName?: string | null;
  isLoggedIn: boolean;
}

export function CommentSection({ postId, creatorName, userPhone, userName, isLoggedIn }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(userName || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isLoggedIn && !authorName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          author_phone: userPhone || 'anonymous',
          author_name: authorName.trim() || userName || 'Anonymous',
          body: newComment.trim(),
          is_creator_reply: false,
        })
        .select()
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-4 pt-4 border-t border-dark-700">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-dark-400" />
        <span className="text-sm font-medium text-dark-300">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 text-dark-400 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 bg-dark-800/30 rounded-xl">
          <MessageSquare className="h-8 w-8 text-dark-600 mx-auto mb-2" />
          <p className="text-dark-500 text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                comment.is_creator_reply 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-dark-700'
              }`}>
                <span className="text-white text-xs font-medium">
                  {comment.author_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">
                    {comment.is_creator_reply ? creatorName : comment.author_name || 'Anonymous'}
                  </span>
                  {comment.is_creator_reply && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                      Creator
                    </span>
                  )}
                  <span className="text-dark-500 text-xs">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-dark-200 text-sm">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {!isLoggedIn && !userName && (
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm placeholder:text-dark-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm placeholder:text-dark-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </form>
    </div>
  );
}
