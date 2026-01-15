'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

export default function NewCommunityPostPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.body.trim()) return;

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please sign in');
      setSaving(false);
      return;
    }

    // Get creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id, display_name')
      .eq('user_id', user.id)
      .single();

    if (!creator) {
      alert('Please set up your creator profile first');
      setSaving(false);
      return;
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, phone')
      .eq('id', user.id)
      .single();

    const { error } = await supabase
      .from('community_posts')
      .insert({
        creator_id: creator.id,
        title: formData.title || null,
        body: formData.body,
        author_name: profile?.full_name || creator.display_name,
        author_phone: profile?.phone || '',
        is_creator_post: true,
      });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push('/creator/community');
  };

  return (
    <div className="max-w-2xl mx-auto pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/creator/community"
          className={cn(
            "p-2 rounded-lg transition-colors",
            theme === 'dark' ? 'hover:bg-dark-800 text-dark-400' : 'hover:bg-gray-100 text-gray-600'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
          New Community Post
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn(
          "rounded-xl border p-6",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <div className="mb-4">
            <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
              Title (optional)
            </label>
            <input
              type="text"
              placeholder="Post title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={cn(
                "w-full px-4 py-3 rounded-lg border",
                theme === 'dark' 
                  ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                  : 'bg-gray-50 border-gray-300'
              )}
            />
          </div>

          <div>
            <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
              Message
            </label>
            <textarea
              placeholder="What's on your mind?"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={6}
              required
              className={cn(
                "w-full px-4 py-3 rounded-lg border resize-none",
                theme === 'dark' 
                  ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                  : 'bg-gray-50 border-gray-300'
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/creator/community"
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-colors",
              theme === 'dark' 
                ? 'bg-dark-700 text-white hover:bg-dark-600' 
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            )}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.body.trim()}
            className={cn(
              "px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white",
              (saving || !formData.body.trim()) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
            {saving ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      <div className={cn(
        "mt-8 p-4 rounded-xl",
        theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'
      )}>
        <p className={cn("text-sm", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
          <strong>Note:</strong> Community posts are only visible to your subscribers. 
          Use this to share updates, behind-the-scenes content, or engage with your audience.
        </p>
      </div>
    </div>
  );
}
