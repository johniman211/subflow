'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Globe,
  Video,
  Youtube,
  Instagram,
  Facebook,
  AlertCircle,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

const platformPatterns = {
  youtube: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ],
  facebook: [
    /facebook\.com\/.*\/videos\/(\d+)/,
    /fb\.watch\/([a-zA-Z0-9_-]+)/,
  ],
  instagram: [
    /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/,
  ],
  tiktok: [
    /tiktok\.com\/@[^/]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
  ],
};

function extractVideoInfo(url: string): { platform: string; embedId: string } | null {
  for (const [platform, patterns] of Object.entries(platformPatterns)) {
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { platform, embedId: match[1] };
      }
    }
  }
  return null;
}

export default function NewVideoPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<{ platform: string; embedId: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_free: false,
    product_ids: [] as string[],
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (videoUrl) {
      const info = extractVideoInfo(videoUrl);
      setVideoInfo(info);
    } else {
      setVideoInfo(null);
    }
  }, [videoUrl]);

  const loadProducts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('products')
      .select('id, name')
      .eq('merchant_id', user.id)
      .eq('is_active', true);

    if (data) setProducts(data);
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!videoInfo) {
      alert('Please enter a valid video URL');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please sign in');
      setSaving(false);
      return;
    }

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!creator) {
      alert('Please set up your creator profile first');
      setSaving(false);
      return;
    }

    const status = publishNow ? 'published' : 'draft';
    const baseSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const { error } = await supabase
      .from('content_items')
      .insert({
        creator_id: creator.id,
        title: formData.title,
        slug,
        description: formData.description,
        content_type: 'video',
        video_platform: videoInfo.platform,
        video_embed_id: videoInfo.embedId,
        is_free: formData.is_free,
        product_ids: formData.product_ids,
        status,
        published_at: publishNow ? new Date().toISOString() : null,
      });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push('/creator/content');
  };

  const toggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  const renderPreview = () => {
    if (!videoInfo) return null;

    switch (videoInfo.platform) {
      case 'youtube':
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoInfo.embedId}`}
            className="w-full aspect-video rounded-lg"
            allowFullScreen
          />
        );
      case 'facebook':
        return (
          <div className="w-full aspect-video bg-dark-700 rounded-lg flex items-center justify-center">
            <p className="text-dark-400">Facebook video preview (ID: {videoInfo.embedId})</p>
          </div>
        );
      case 'instagram':
        return (
          <div className="w-full aspect-video bg-dark-700 rounded-lg flex items-center justify-center">
            <p className="text-dark-400">Instagram video preview (ID: {videoInfo.embedId})</p>
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-full aspect-video bg-dark-700 rounded-lg flex items-center justify-center">
            <p className="text-dark-400">TikTok video preview (ID: {videoInfo.embedId})</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/creator/content"
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === 'dark' ? 'hover:bg-dark-800 text-dark-400' : 'hover:bg-gray-100 text-gray-600'
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Add Video
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving || !formData.title || !videoInfo}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2",
              theme === 'dark' 
                ? 'bg-dark-700 text-white hover:bg-dark-600' 
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
              (saving || !formData.title || !videoInfo) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving || !formData.title || !videoInfo || (!formData.is_free && formData.product_ids.length === 0)}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white",
              (saving || !formData.title || !videoInfo || (!formData.is_free && formData.product_ids.length === 0)) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Globe className="h-4 w-4" />
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video URL */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <label className={cn("block font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Video URL
            </label>
            
            {!videoInfo ? (
              <>
                <input
                  type="url"
                  placeholder="Paste YouTube, Facebook, Instagram, or TikTok video URL..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    theme === 'dark' 
                      ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                      : 'bg-gray-50 border-gray-300'
                  )}
                />
                
                {videoUrl && !videoInfo && (
                  <div className="flex items-center gap-2 mt-3 text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Could not recognize video URL. Supported: YouTube, Facebook, Instagram, TikTok</span>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4">
                  <span className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Supported:</span>
                  <div className="flex items-center gap-3">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <Facebook className="h-5 w-5 text-blue-500" />
                    <Instagram className="h-5 w-5 text-pink-500" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Video className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-green-500 capitalize">{videoInfo.platform} Video Linked</p>
                    <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                      Original URL hidden for security
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setVideoUrl(''); setVideoInfo(null); }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm",
                    theme === 'dark' ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'
                  )}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          {videoInfo && (
            <div className={cn(
              "rounded-xl border p-6",
              theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn("block font-medium mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Preview
              </label>
              {renderPreview()}
            </div>
          )}

          {/* Title & Description */}
          <div className={cn(
            "rounded-xl border p-6 space-y-4",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <div>
              <label className={cn("block font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Title
              </label>
              <input
                type="text"
                placeholder="Video title..."
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
              <label className={cn("block font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Description
              </label>
              <textarea
                placeholder="Brief description of the video..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border resize-none",
                  theme === 'dark' 
                    ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-500' 
                    : 'bg-gray-50 border-gray-300'
                )}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Access Settings */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <h3 className={cn("font-medium mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Access Settings
            </h3>
            
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={formData.is_free}
                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                className="w-5 h-5 rounded border-dark-600 text-purple-500 focus:ring-purple-500"
              />
              <span className={cn("text-sm", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Make this video free for everyone
              </span>
            </label>

            {!formData.is_free && (
              <>
                <p className={cn("text-sm mb-3", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                  Select products that grant access:
                </p>
                {products.length === 0 ? (
                  <div className={cn(
                    "text-center py-4 rounded-lg",
                    theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'
                  )}>
                    <p className={cn("text-sm mb-2", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                      No products found
                    </p>
                    <Link href="/dashboard/products/new" className="text-purple-500 text-sm hover:underline">
                      Create a product first →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.map(product => (
                      <label
                        key={product.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          formData.product_ids.includes(product.id)
                            ? theme === 'dark' ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-purple-50 border border-purple-200'
                            : theme === 'dark' ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-50 hover:bg-gray-100'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={formData.product_ids.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="w-4 h-4 rounded border-dark-600 text-purple-500 focus:ring-purple-500"
                        />
                        <span className={cn("text-sm", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                          {product.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          )}>
            <h3 className={cn("font-medium mb-3", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              How It Works
            </h3>
            <ul className={cn("text-sm space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
              <li>• Videos play inside PaySSD</li>
              <li>• Original URLs are never exposed</li>
              <li>• Subscribers get seamless access</li>
              <li>• Non-subscribers see a paywall</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
