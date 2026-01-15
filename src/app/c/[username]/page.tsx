import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, Video, Download, Lock, ExternalLink, Eye, Calendar, Play, ArrowRight, MessageSquare, Users } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content_type: 'blog_post' | 'video' | 'file';
  is_free: boolean;
  visibility: string;
  view_count: number;
  published_at: string;
  video_thumbnail_url?: string;
  video_platform?: string;
}

export default async function CreatorProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username;
  const supabase = createServerSupabaseClient();

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
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const contentTypeConfig = {
    blog_post: {
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      label: 'Article',
    },
    video: {
      icon: Play,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      label: 'Video',
    },
    file: {
      icon: Download,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      label: 'Download',
    },
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Count content by type
  const videoCount = content?.filter((c: ContentItem) => c.content_type === 'video').length || 0;
  const articleCount = content?.filter((c: ContentItem) => c.content_type === 'blog_post').length || 0;
  const downloadCount = content?.filter((c: ContentItem) => c.content_type === 'file').length || 0;

  const getContentUrl = (item: ContentItem) => {
    switch (item.content_type) {
      case 'blog_post':
        return `/c/${username}/post/${item.slug}`;
      case 'video':
        return `/c/${username}/watch/${item.id}`;
      case 'file':
        return `/c/${username}/download/${item.id}`;
      default:
        return '#';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
              <span className="text-[#333] font-black text-xs italic">PAY</span>
            </div>
            <span className="text-xl font-black text-white italic">SSD</span>
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Start Creating
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">
              {creator.display_name?.charAt(0) || 'C'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {creator.display_name}
            {creator.is_verified && (
              <span className="ml-2 text-purple-400">✓</span>
            )}
          </h1>
          <p className="text-dark-400 mb-4">@{creator.username}</p>
          {creator.bio && (
            <p className="text-dark-300 max-w-lg mx-auto">{creator.bio}</p>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Play className="h-4 w-4 text-red-400" />
              <span className="text-2xl font-bold text-white">{videoCount}</span>
            </div>
            <p className="text-dark-400 text-sm">Videos</p>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-2xl font-bold text-white">{articleCount}</span>
            </div>
            <p className="text-dark-400 text-sm">Articles</p>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Download className="h-4 w-4 text-emerald-400" />
              <span className="text-2xl font-bold text-white">{downloadCount}</span>
            </div>
            <p className="text-dark-400 text-sm">Downloads</p>
          </div>
        </div>

        {/* Community Link */}
        <Link
          href={`/c/${username}/community`}
          className="flex items-center justify-between p-5 mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Community</h3>
              <p className="text-dark-400 text-sm">Join the discussion with other members</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Content</h2>
            <span className="text-dark-400 text-sm">{content?.length || 0} items</span>
          </div>
          
          {(!content || content.length === 0) ? (
            <div className="text-center py-16 bg-dark-900/50 rounded-2xl border border-dark-800">
              <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-dark-500" />
              </div>
              <p className="text-dark-400 font-medium">No content yet</p>
              <p className="text-dark-500 text-sm mt-1">Check back soon for new content</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {content.map((item: ContentItem) => {
                const config = contentTypeConfig[item.content_type] || contentTypeConfig.blog_post;
                const Icon = config.icon;
                const isPremium = !item.is_free && item.visibility !== 'free';
                
                return (
                  <Link
                    key={item.id}
                    href={getContentUrl(item)}
                    className="group relative bg-dark-900/50 border border-dark-800 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:bg-dark-900/80 transition-all duration-300"
                  >
                    <div className="flex items-stretch">
                      {/* Thumbnail/Icon Area */}
                      <div className={`relative w-24 sm:w-32 flex-shrink-0 bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white/90" />
                        {isPremium && (
                          <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4 sm:p-5 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Type Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                                {config.label}
                              </span>
                              {isPremium && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400">
                                  Premium
                                </span>
                              )}
                            </div>
                            
                            {/* Title */}
                            <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1 mb-1">
                              {item.title}
                            </h3>
                            
                            {/* Description */}
                            {item.description && (
                              <p className="text-dark-400 text-sm line-clamp-2 mb-3">
                                {item.description}
                              </p>
                            )}
                            
                            {/* Meta */}
                            <div className="flex items-center gap-4 text-dark-500 text-xs">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {item.view_count} views
                              </span>
                              {item.published_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(item.published_at)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-dark-800 group-hover:bg-purple-500/20 transition-colors">
                            <ArrowRight className="h-5 w-5 text-dark-400 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-dark-900 border-t border-dark-800 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-[#F7C500] rounded-full flex items-center justify-center">
              <span className="text-[#333] font-black text-[8px] italic">PAY</span>
            </div>
            <span className="text-white font-black text-sm italic">SSD</span>
          </div>
          <p className="text-dark-500 text-sm">
            Premium content · Powered by PaySSD
          </p>
        </div>
      </footer>
    </div>
  );
}
