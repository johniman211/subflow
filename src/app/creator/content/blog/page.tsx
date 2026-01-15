'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Share2,
  ExternalLink,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'published';
  view_count: number;
  is_free: boolean;
  created_at: string;
  published_at: string | null;
}

export default function BlogPostsPage() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorUsername, setCreatorUsername] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: creator } = await supabase
      .from('creators')
      .select('id, username')
      .eq('user_id', user.id)
      .single();

    if (!creator) {
      setLoading(false);
      return;
    }

    setCreatorUsername(creator.username);

    const { data } = await supabase
      .from('content_items')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('content_type', 'blog_post')
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }

    setLoading(false);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyShareLink = (post: BlogPost) => {
    navigator.clipboard.writeText(`https://payssd.com/c/${creatorUsername}/post/${post.slug}`);
    alert('Share link copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Blog Posts
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            {posts.length} posts · {posts.filter(p => p.status === 'published').length} published
          </p>
        </div>
        <Link
          href="/creator/content/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          New Post
        </Link>
      </div>

      <div className={cn(
        "flex items-center gap-4 p-4 rounded-xl border",
        theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex-1 relative">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg border",
              theme === 'dark' 
                ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-400' 
                : 'bg-gray-50 border-gray-300'
            )}
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <FileText className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No blog posts yet
          </h3>
          <p className={cn("mb-6", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Write your first blog post
          </p>
          <Link
            href="/creator/content/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
          >
            <Plus className="h-5 w-5" />
            Create Post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                theme === 'dark' 
                  ? 'bg-dark-800 border-dark-700 hover:border-dark-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 bg-blue-500/20">
                <FileText className="h-6 w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn("font-medium truncate", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {post.title}
                  </h3>
                  {post.status === 'published' ? (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Clock className="h-3 w-3" /> Draft
                    </span>
                  )}
                  {post.is_free && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">Free</span>
                  )}
                </div>
                <p className={cn("text-sm truncate", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                  {post.description || 'No description'}
                </p>
              </div>

              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {post.view_count}
                  </p>
                  <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Views</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyShareLink(post)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                  )}
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <Link
                  href={`/creator/content/blog/${post.id}/edit`}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                  )}
                >
                  <Edit className="h-4 w-4" />
                </Link>
                {post.status === 'published' && (
                  <Link
                    href={`/c/${creatorUsername}/post/${post.slug}`}
                    target="_blank"
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                    )}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
