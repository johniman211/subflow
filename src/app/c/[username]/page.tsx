import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, Video, Download, Lock, ExternalLink } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content_type: 'blog_post' | 'video' | 'file';
  is_free: boolean;
  view_count: number;
  published_at: string;
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

  const contentTypeIcons = {
    blog_post: FileText,
    video: Video,
    file: Download,
  };

  const contentTypeColors = {
    blog_post: 'text-blue-400 bg-blue-500/20',
    video: 'text-red-400 bg-red-500/20',
    file: 'text-green-400 bg-green-500/20',
  };

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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Content</h2>
          
          {(!content || content.length === 0) ? (
            <div className="text-center py-16 bg-dark-900/50 rounded-xl border border-dark-800">
              <FileText className="h-12 w-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">No content yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {content.map((item: ContentItem) => {
                const Icon = contentTypeIcons[item.content_type] || FileText;
                const colorClass = contentTypeColors[item.content_type] || 'text-gray-400 bg-gray-500/20';
                
                return (
                  <Link
                    key={item.id}
                    href={getContentUrl(item)}
                    className="flex items-center gap-4 p-4 bg-dark-900/50 border border-dark-800 rounded-xl hover:border-purple-500/50 transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                          {item.title}
                        </h3>
                        {!item.is_free && (
                          <Lock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-dark-400 truncate">
                        {item.description || 'No description'}
                      </p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-dark-500 group-hover:text-purple-400 transition-colors" />
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
