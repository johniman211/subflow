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
  MessageSquare,
  Users,
  Eye,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Creator {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  is_verified: boolean;
}

interface Stats {
  totalContent: number;
  blogPosts: number;
  videos: number;
  files: number;
  communityPosts: number;
  subscribers: number;
  totalViews: number;
}

export default function CreatorOverviewPage() {
  const { theme } = useTheme();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalContent: 0,
    blogPosts: 0,
    videos: 0,
    files: 0,
    communityPosts: 0,
    subscribers: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({ username: '', display_name: '' });
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Check if creator profile exists
    const { data: creatorData } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (creatorData) {
      setCreator(creatorData);
      
      // Load stats
      const { data: contentData } = await supabase
        .from('content_items')
        .select('content_type, view_count')
        .eq('creator_id', creatorData.id);

      if (contentData) {
        const blogPosts = contentData.filter(c => c.content_type === 'blog_post').length;
        const videos = contentData.filter(c => c.content_type === 'video').length;
        const files = contentData.filter(c => c.content_type === 'file').length;
        const totalViews = contentData.reduce((sum, c) => sum + (c.view_count || 0), 0);

        setStats({
          totalContent: contentData.length,
          blogPosts,
          videos,
          files,
          communityPosts: 0,
          subscribers: 0,
          totalViews,
        });
      }
    } else {
      setShowSetup(true);
    }

    setLoading(false);
  };

  const handleSetupCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('creators')
      .insert({
        user_id: user.id,
        username: setupData.username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        display_name: setupData.display_name,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setSetupLoading(false);
      return;
    }

    setCreator(data);
    setShowSetup(false);
    setSetupLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Setup screen for new creators
  if (showSetup) {
    return (
      <div className="max-w-2xl mx-auto pt-8">
        <div className={cn(
          "rounded-2xl p-8 text-center",
          theme === 'dark' ? 'bg-dark-800' : 'bg-white shadow-lg'
        )}>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className={cn("text-2xl font-bold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Welcome to Creator Studio
          </h1>
          <p className={cn("mb-8", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
            Set up your creator profile to start monetizing your content with PaySSD.
          </p>

          <form onSubmit={handleSetupCreator} className="space-y-4 text-left">
            <div>
              <label className={cn("block text-sm font-medium mb-1", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Username
              </label>
              <div className="flex items-center">
                <span className={cn(
                  "px-3 py-2 rounded-l-lg border-r-0",
                  theme === 'dark' ? 'bg-dark-700 text-dark-400 border border-dark-600' : 'bg-gray-100 text-gray-500 border border-gray-300'
                )}>
                  payssd.com/c/
                </span>
                <input
                  type="text"
                  value={setupData.username}
                  onChange={(e) => setSetupData({ ...setupData, username: e.target.value })}
                  placeholder="yourname"
                  required
                  pattern="[a-z0-9_-]{3,30}"
                  className={cn(
                    "flex-1 px-3 py-2 rounded-r-lg border",
                    theme === 'dark' 
                      ? 'bg-dark-900 border-dark-600 text-white' 
                      : 'bg-white border-gray-300'
                  )}
                />
              </div>
              <p className="text-xs text-dark-400 mt-1">3-30 characters, lowercase letters, numbers, underscores, hyphens only</p>
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-1", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Display Name
              </label>
              <input
                type="text"
                value={setupData.display_name}
                onChange={(e) => setSetupData({ ...setupData, display_name: e.target.value })}
                placeholder="Your Name or Brand"
                required
                className={cn(
                  "w-full px-3 py-2 rounded-lg border",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white' 
                    : 'bg-white border-gray-300'
                )}
              />
            </div>

            <button
              type="submit"
              disabled={setupLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {setupLoading ? 'Creating...' : 'Create Creator Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const quickActions = [
    { name: 'New Blog Post', href: '/creator/content/blog/new', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { name: 'Add Video', href: '/creator/content/videos/new', icon: Video, color: 'from-red-500 to-orange-500' },
    { name: 'Upload File', href: '/creator/content/files/new', icon: Download, color: 'from-green-500 to-emerald-500' },
    { name: 'Community Post', href: '/creator/community/new', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
  ];

  const statCards = [
    { name: 'Total Content', value: stats.totalContent, icon: FileText, href: '/creator/content' },
    { name: 'Total Views', value: stats.totalViews, icon: Eye, href: '/creator/content' },
    { name: 'Subscribers', value: stats.subscribers, icon: Users, href: '/creator/subscribers' },
  ];

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Welcome back, {creator?.display_name}
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Your creator dashboard · <Link href={`/c/${creator?.username}`} target="_blank" className="text-purple-500 hover:underline">@{creator?.username}</Link>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={cn(
              "p-4 rounded-xl border transition-all hover:scale-105",
              theme === 'dark' 
                ? 'bg-dark-800 border-dark-700 hover:border-purple-500/50' 
                : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm'
            )}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br", action.color)}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <p className={cn("font-medium text-sm", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              {action.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className={cn(
              "p-6 rounded-xl border transition-colors",
              theme === 'dark' 
                ? 'bg-dark-800 border-dark-700 hover:border-dark-600' 
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                  {stat.name}
                </p>
                <p className={cn("text-3xl font-bold mt-1", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'
              )}>
                <stat.icon className={cn("h-6 w-6", theme === 'dark' ? 'text-purple-400' : 'text-purple-600')} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Content Breakdown */}
      <div className={cn(
        "rounded-xl border p-6",
        theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={cn("text-lg font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Content Overview
          </h2>
          <Link href="/creator/content" className="text-purple-500 text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn("p-4 rounded-xl", theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50')}>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {stats.blogPosts}
                </p>
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Blog Posts</p>
              </div>
            </div>
          </div>
          <div className={cn("p-4 rounded-xl", theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50')}>
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-red-500" />
              <div>
                <p className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {stats.videos}
                </p>
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Videos</p>
              </div>
            </div>
          </div>
          <div className={cn("p-4 rounded-xl", theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50')}>
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-green-500" />
              <div>
                <p className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {stats.files}
                </p>
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Files</p>
              </div>
            </div>
          </div>
          <div className={cn("p-4 rounded-xl", theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50')}>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <p className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {stats.communityPosts}
                </p>
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      {stats.totalContent === 0 && (
        <div className={cn(
          "rounded-xl border p-8 text-center",
          theme === 'dark' ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        )}>
          <TrendingUp className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-purple-400' : 'text-purple-600')} />
          <h3 className={cn("text-xl font-semibold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Start Creating Content
          </h3>
          <p className={cn("mb-6 max-w-md mx-auto", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
            Create your first piece of content to start monetizing. Blog posts, videos, files, or community posts - you choose!
          </p>
          <Link
            href="/creator/content/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Create Your First Content
          </Link>
        </div>
      )}
    </div>
  );
}
