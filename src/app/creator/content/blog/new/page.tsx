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
  Eye,
  Globe,
  Lock,
  Image,
  Bold,
  Italic,
  List,
  Heading,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

export default function NewBlogPostPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    preview_content: '',
    body_content: '',
    is_free: false,
    product_ids: [] as string[],
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    loadProducts();
  }, []);

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (publishNow: boolean = false) => {
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
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!creator) {
      alert('Please set up your creator profile first');
      setSaving(false);
      return;
    }

    const status = publishNow ? 'published' : 'draft';

    const { data, error } = await supabase
      .from('content_items')
      .insert({
        creator_id: creator.id,
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        content_type: 'blog_post',
        preview_content: formData.preview_content,
        body_content: formData.body_content,
        is_free: formData.is_free,
        product_ids: formData.product_ids,
        status,
        published_at: publishNow ? new Date().toISOString() : null,
      })
      .select()
      .single();

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
            New Blog Post
          </h1>
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
            Save Draft
          </button>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <input
              type="text"
              placeholder="Post title..."
              value={formData.title}
              onChange={handleTitleChange}
              className={cn(
                "w-full text-2xl font-bold bg-transparent border-none outline-none",
                theme === 'dark' ? 'text-white placeholder:text-dark-500' : 'text-gray-900 placeholder:text-gray-400'
              )}
            />
            <div className="mt-2">
              <span className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                payssd.com/c/yourname/post/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className={cn(
                  "text-sm bg-transparent border-none outline-none",
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                )}
              />
            </div>
          </div>

          {/* Description */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
              Description (shown in previews)
            </label>
            <textarea
              placeholder="Brief description of your post..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className={cn(
                "w-full bg-transparent border rounded-lg p-3 outline-none resize-none",
                theme === 'dark' 
                  ? 'border-dark-600 text-white placeholder:text-dark-500' 
                  : 'border-gray-300 text-gray-900 placeholder:text-gray-400'
              )}
            />
          </div>

          {/* Preview Content (Free) */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <Eye className={cn("h-5 w-5", theme === 'dark' ? 'text-green-400' : 'text-green-600')} />
              <label className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Preview Content (Free for everyone)
              </label>
            </div>
            <textarea
              placeholder="Write the free preview section that everyone can see..."
              value={formData.preview_content}
              onChange={(e) => setFormData({ ...formData, preview_content: e.target.value })}
              rows={6}
              className={cn(
                "w-full bg-transparent border rounded-lg p-3 outline-none resize-none font-mono text-sm",
                theme === 'dark' 
                  ? 'border-dark-600 text-white placeholder:text-dark-500' 
                  : 'border-gray-300 text-gray-900 placeholder:text-gray-400'
              )}
            />
            <p className={cn("text-xs mt-2", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
              Supports Markdown formatting
            </p>
          </div>

          {/* Locked Content */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <Lock className={cn("h-5 w-5", theme === 'dark' ? 'text-purple-400' : 'text-purple-600')} />
              <label className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-700')}>
                Premium Content (Subscribers only)
              </label>
            </div>
            <textarea
              placeholder="Write the premium content that only subscribers can access..."
              value={formData.body_content}
              onChange={(e) => setFormData({ ...formData, body_content: e.target.value })}
              rows={12}
              className={cn(
                "w-full bg-transparent border rounded-lg p-3 outline-none resize-none font-mono text-sm",
                theme === 'dark' 
                  ? 'border-dark-600 text-white placeholder:text-dark-500' 
                  : 'border-gray-300 text-gray-900 placeholder:text-gray-400'
              )}
            />
            <p className={cn("text-xs mt-2", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
              Supports Markdown formatting
            </p>
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
                Make this post free for everyone
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

          {/* Tips */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          )}>
            <h3 className={cn("font-medium mb-3", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Writing Tips
            </h3>
            <ul className={cn("text-sm space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
              <li>• Keep the preview engaging to encourage subscriptions</li>
              <li>• Use headings and lists for better readability</li>
              <li>• Add value in the premium section</li>
              <li>• Share your unique expertise</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
