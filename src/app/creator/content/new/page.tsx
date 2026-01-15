'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  FileText,
  Video,
  Download,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

const contentTypes = [
  {
    type: 'blog',
    name: 'Blog Post',
    description: 'Write articles with preview and locked content sections',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    href: '/creator/content/blog/new',
  },
  {
    type: 'video',
    name: 'Video',
    description: 'Embed videos from YouTube, Facebook, Instagram or TikTok',
    icon: Video,
    color: 'from-red-500 to-orange-500',
    href: '/creator/content/videos/new',
  },
  {
    type: 'file',
    name: 'File Download',
    description: 'Upload PDFs, audio files, or zip archives for download',
    icon: Download,
    color: 'from-green-500 to-emerald-500',
    href: '/creator/content/files/new',
  },
  {
    type: 'community',
    name: 'Community Post',
    description: 'Create a members-only post for your community',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
    href: '/creator/community/new',
  },
];

export default function NewContentPage() {
  const { theme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
      <div className="mb-8">
        <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
          Create New Content
        </h1>
        <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
          Choose the type of content you want to create
        </p>
      </div>

      <div className="grid gap-4">
        {contentTypes.map((item) => (
          <Link
            key={item.type}
            href={item.href}
            className={cn(
              "flex items-center gap-4 p-6 rounded-xl border transition-all hover:scale-[1.02]",
              theme === 'dark' 
                ? 'bg-dark-800 border-dark-700 hover:border-purple-500/50' 
                : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm'
            )}
          >
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0", item.color)}>
              <item.icon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={cn("font-semibold text-lg", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {item.name}
              </h3>
              <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                {item.description}
              </p>
            </div>
            <ArrowRight className={cn("h-5 w-5 flex-shrink-0", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
          </Link>
        ))}
      </div>
    </div>
  );
}
