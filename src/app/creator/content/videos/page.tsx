'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Video,
  Plus,
  Search,
  Edit,
  Share2,
  ExternalLink,
  Clock,
  CheckCircle,
  Youtube,
} from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  video_platform: string;
  video_embed_id: string;
  status: 'draft' | 'published';
  view_count: number;
  is_free: boolean;
  created_at: string;
}

export default function VideosPage() {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorUsername, setCreatorUsername] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
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
      .eq('content_type', 'video')
      .order('created_at', { ascending: false });

    if (data) {
      setVideos(data);
    }

    setLoading(false);
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyShareLink = (video: VideoItem) => {
    navigator.clipboard.writeText(`https://payssd.com/c/${creatorUsername}/watch/${video.id}`);
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
            Videos
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            {videos.length} videos · {videos.filter(v => v.status === 'published').length} published
          </p>
        </div>
        <Link
          href="/creator/content/videos/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Add Video
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
            placeholder="Search videos..."
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

      {filteredVideos.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <Video className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No videos yet
          </h3>
          <p className={cn("mb-6", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Embed videos from YouTube, Facebook, or Instagram
          </p>
          <Link
            href="/creator/content/videos/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
          >
            <Plus className="h-5 w-5" />
            Add Video
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className={cn(
                "rounded-xl border overflow-hidden transition-colors",
                theme === 'dark' 
                  ? 'bg-dark-800 border-dark-700 hover:border-dark-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="aspect-video bg-dark-900 flex items-center justify-center">
                {video.video_platform === 'youtube' ? (
                  <img
                    src={`https://img.youtube.com/vi/${video.video_embed_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="h-12 w-12 text-dark-500" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={cn("font-medium truncate flex-1", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {video.title}
                  </h3>
                  {video.status === 'published' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-dark-400">
                    <span className="capitalize">{video.video_platform}</span>
                    <span>•</span>
                    <span>{video.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyShareLink(video)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                      )}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/creator/content/videos/${video.id}/edit`}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                      )}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
