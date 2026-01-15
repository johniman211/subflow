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
  Trash2,
  Eye,
  Lock,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

interface VideoContent {
  id: string;
  title: string;
  description: string;
  video_platform: string;
  video_embed_id: string;
  is_free: boolean;
  product_ids: string[];
  status: 'draft' | 'published';
  view_count: number;
  published_at: string | null;
}

export default function EditVideoPage({ params }: { params: { id: string } }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<VideoContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_free: false,
    product_ids: [] as string[],
  });

  useEffect(() => {
    loadContent();
  }, [params.id]);

  const loadContent = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!creator) {
      router.push('/creator');
      return;
    }

    const { data: contentData } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', params.id)
      .eq('creator_id', creator.id)
      .eq('content_type', 'video')
      .single();

    if (!contentData) {
      router.push('/creator/content/videos');
      return;
    }

    setContent(contentData);
    setFormData({
      title: contentData.title || '',
      description: contentData.description || '',
      is_free: contentData.is_free || false,
      product_ids: contentData.product_ids || [],
    });

    const { data: productsData } = await supabase
      .from('products')
      .select('id, name')
      .eq('merchant_id', user.id)
      .eq('is_active', true);

    if (productsData) setProducts(productsData);
    setLoading(false);
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!content) return;

    setSaving(true);
    const supabase = createClient();

    const status = publishNow ? 'published' : content.status;

    const { error } = await supabase
      .from('content_items')
      .update({
        title: formData.title,
        description: formData.description,
        is_free: formData.is_free,
        product_ids: formData.product_ids,
        status,
        published_at: publishNow && !content.published_at ? new Date().toISOString() : content.published_at,
      })
      .eq('id', content.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push('/creator/content/videos');
  };

  const handleDelete = async () => {
    if (!content) return;
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;

    setDeleting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', content.id);

    if (error) {
      alert(error.message);
      setDeleting(false);
      return;
    }

    router.push('/creator/content/videos');
  };

  const toggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className={cn("text-lg", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
          Video not found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/creator/content/videos"
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === 'dark' ? 'hover:bg-dark-800 text-dark-400' : 'hover:bg-gray-100 text-gray-600'
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Edit Video
          </h1>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            content.status === 'published' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-amber-500/20 text-amber-400'
          )}>
            {content.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving || !formData.title}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2",
              theme === 'dark' 
                ? 'bg-dark-700 text-white hover:bg-dark-600' 
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
              (saving || !formData.title) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          {content.status === 'draft' && (
            <button
              onClick={() => handleSubmit(true)}
              disabled={saving || !formData.title || (!formData.is_free && formData.product_ids.length === 0)}
              className={cn(
                "px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                (saving || !formData.title || (!formData.is_free && formData.product_ids.length === 0)) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Globe className="h-4 w-4" />
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Info */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Video className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-purple-400 capitalize">{content.video_platform} Video</p>
                  <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                    Video source cannot be changed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-dark-400 text-sm">
                <Eye className="h-4 w-4" />
                {content.view_count} views
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={cn("block font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  Title
                </label>
                <input
                  type="text"
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
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

          {/* Danger Zone */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-red-500/30' : 'bg-white border-red-200'
          )}>
            <h3 className="text-red-500 font-semibold mb-4">Danger Zone</h3>
            <p className={cn("text-sm mb-4", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
              Deleting this video will remove it permanently. This action cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete Video'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Access Settings */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <h3 className={cn("font-semibold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Access Settings
            </h3>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_free}
                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                className="w-5 h-5 rounded border-dark-600 bg-dark-900 text-purple-500 focus:ring-purple-500"
              />
              <span className={cn(theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Free for everyone
              </span>
            </label>

            {!formData.is_free && (
              <div>
                <p className={cn("text-sm mb-3", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                  Select products that grant access:
                </p>
                {products.length === 0 ? (
                  <p className={cn("text-sm", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')}>
                    No products found. <Link href="/dashboard/products/new" className="text-purple-400 hover:underline">Create one</Link>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          formData.product_ids.includes(product.id)
                            ? 'border-purple-500 bg-purple-500/10'
                            : theme === 'dark' ? 'border-dark-600 hover:border-dark-500' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={formData.product_ids.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-purple-500 focus:ring-purple-500"
                        />
                        <span className={cn("text-sm", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                          {product.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <h3 className={cn("font-semibold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className={cn(theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Status</span>
                <span className={cn(
                  "font-medium capitalize",
                  content.status === 'published' ? 'text-green-400' : 'text-amber-400'
                )}>
                  {content.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={cn(theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Views</span>
                <span className={cn(theme === 'dark' ? 'text-white' : 'text-gray-900')}>{content.view_count}</span>
              </div>
              {content.published_at && (
                <div className="flex justify-between">
                  <span className={cn(theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Published</span>
                  <span className={cn(theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {new Date(content.published_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className={cn(theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Access</span>
                <span className={cn("flex items-center gap-1", formData.is_free ? 'text-green-400' : 'text-amber-400')}>
                  {formData.is_free ? (
                    <>Free</>
                  ) : (
                    <><Lock className="h-3 w-3" />Premium</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
