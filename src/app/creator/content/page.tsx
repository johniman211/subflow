'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  FileText,
  Video,
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Share2,
  ExternalLink,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content_type: 'blog_post' | 'video' | 'file' | 'community_post';
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  download_count: number;
  is_free: boolean;
  created_at: string;
  published_at: string | null;
}

const contentTypeIcons = {
  blog_post: FileText,
  video: Video,
  file: Download,
  community_post: FileText,
};

const contentTypeColors = {
  blog_post: 'text-blue-500 bg-blue-500/10',
  video: 'text-red-500 bg-red-500/10',
  file: 'text-green-500 bg-green-500/10',
  community_post: 'text-purple-500 bg-purple-500/10',
};

export default function AllContentPage() {
  const { theme } = useTheme();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [creatorUsername, setCreatorUsername] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
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
      .order('created_at', { ascending: false });

    if (data) {
      setContent(data);
    }

    setLoading(false);
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.content_type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const copyShareLink = (item: ContentItem) => {
    const baseUrl = 'https://payssd.com';
    let path = '';
    switch (item.content_type) {
      case 'blog_post':
        path = `/c/${creatorUsername}/post/${item.slug}`;
        break;
      case 'video':
        path = `/c/${creatorUsername}/watch/${item.id}`;
        break;
      case 'file':
        path = `/c/${creatorUsername}/download/${item.id}`;
        break;
      default:
        path = `/c/${creatorUsername}`;
    }
    navigator.clipboard.writeText(`${baseUrl}${path}`);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            All Content
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Manage all your content in one place
          </p>
        </div>
        <Link
          href="/creator/content/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Create Content
        </Link>
      </div>

      {/* Filters */}
      <div className={cn(
        "flex flex-col md:flex-row gap-4 p-4 rounded-xl border",
        theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex-1 relative">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
          <input
            type="text"
            placeholder="Search content..."
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
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={cn(
            "px-4 py-2 rounded-lg border",
            theme === 'dark' 
              ? 'bg-dark-900 border-dark-600 text-white' 
              : 'bg-gray-50 border-gray-300'
          )}
        >
          <option value="all">All Types</option>
          <option value="blog_post">Blog Posts</option>
          <option value="video">Videos</option>
          <option value="file">Files</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={cn(
            "px-4 py-2 rounded-lg border",
            theme === 'dark' 
              ? 'bg-dark-900 border-dark-600 text-white' 
              : 'bg-gray-50 border-gray-300'
          )}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <FileText className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No content found
          </h3>
          <p className={cn("mb-6", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            {content.length === 0 ? "Start creating content to monetize your audience" : "Try adjusting your filters"}
          </p>
          {content.length === 0 && (
            <Link
              href="/creator/content/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Create Content
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContent.map((item) => {
            const Icon = contentTypeIcons[item.content_type];
            const colorClass = contentTypeColors[item.content_type];
            
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                  theme === 'dark' 
                    ? 'bg-dark-800 border-dark-700 hover:border-dark-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-medium truncate", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {item.title}
                    </h3>
                    {item.status === 'published' ? (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-500">
                        <Clock className="h-3 w-3" /> Draft
                      </span>
                    )}
                    {item.is_free && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">Free</span>
                    )}
                  </div>
                  <p className={cn("text-sm truncate", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                    {item.description || 'No description'}
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {item.view_count}
                    </p>
                    <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Views</p>
                  </div>
                  {item.content_type === 'file' && (
                    <div className="text-center">
                      <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                        {item.download_count}
                      </p>
                      <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Downloads</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyShareLink(item)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                    )}
                    title="Copy share link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/creator/content/${item.content_type.replace('_', '-')}/${item.id}/edit`}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                    )}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  {item.status === 'published' && (
                    <Link
                      href={`/c/${creatorUsername}/${item.content_type === 'blog_post' ? 'post' : item.content_type === 'video' ? 'watch' : 'download'}/${item.slug || item.id}`}
                      target="_blank"
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                      )}
                      title="View"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
