'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Save, User, Link as LinkIcon, Eye } from 'lucide-react';

interface Creator {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  social_links: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
}

export default function CreatorSettingsPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    social_links: {
      twitter: '',
      instagram: '',
      youtube: '',
      website: '',
    },
  });

  useEffect(() => {
    loadCreator();
  }, []);

  const loadCreator = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setCreator(data);
      setFormData({
        display_name: data.display_name || '',
        bio: data.bio || '',
        social_links: data.social_links || {
          twitter: '',
          instagram: '',
          youtube: '',
          website: '',
        },
      });
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('creators')
      .update({
        display_name: formData.display_name,
        bio: formData.bio,
        social_links: formData.social_links,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creator.id);

    if (error) {
      alert(error.message);
    } else {
      alert('Settings saved!');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center py-16">
        <p className={cn("text-lg", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
          Please set up your creator profile first
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-12 lg:pt-0">
      <div className="mb-6">
        <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
          Creator Settings
        </h1>
        <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
          Manage your creator profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Info */}
        <div className={cn(
          "rounded-xl border p-6",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <div className="flex items-center gap-3 mb-6">
            <User className={cn("h-5 w-5", theme === 'dark' ? 'text-purple-400' : 'text-purple-600')} />
            <h2 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Username
              </label>
              <div className={cn(
                "px-4 py-3 rounded-lg border",
                theme === 'dark' ? 'bg-dark-900 border-dark-600 text-dark-400' : 'bg-gray-100 border-gray-300 text-gray-500'
              )}>
                @{creator.username}
              </div>
              <p className="text-xs text-dark-400 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white' 
                    : 'bg-white border-gray-300'
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell your subscribers about yourself..."
                className={cn(
                  "w-full px-4 py-3 rounded-lg border resize-none",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                    : 'bg-white border-gray-300'
                )}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className={cn(
          "rounded-xl border p-6",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon className={cn("h-5 w-5", theme === 'dark' ? 'text-purple-400' : 'text-purple-600')} />
            <h2 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Social Links
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Website
              </label>
              <input
                type="url"
                value={formData.social_links.website || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, website: e.target.value }
                })}
                placeholder="https://yourwebsite.com"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                    : 'bg-white border-gray-300'
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Twitter / X
              </label>
              <input
                type="text"
                value={formData.social_links.twitter || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, twitter: e.target.value }
                })}
                placeholder="@username"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                    : 'bg-white border-gray-300'
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Instagram
              </label>
              <input
                type="text"
                value={formData.social_links.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, instagram: e.target.value }
                })}
                placeholder="@username"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                    : 'bg-white border-gray-300'
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                YouTube
              </label>
              <input
                type="url"
                value={formData.social_links.youtube || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/c/channel"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                    : 'bg-white border-gray-300'
                )}
              />
            </div>
          </div>
        </div>

        {/* Preview Link */}
        <div className={cn(
          "rounded-xl border p-6",
          theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Your Public Page
              </h3>
              <p className={cn("text-sm", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                payssd.com/c/{creator.username}
              </p>
            </div>
            <a
              href={`/c/${creator.username}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview
            </a>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white",
              saving && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
