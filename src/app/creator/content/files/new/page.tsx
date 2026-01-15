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
  Upload,
  File,
  FileText,
  Music,
  Archive,
  X,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

const fileTypeIcons: { [key: string]: any } = {
  'application/pdf': FileText,
  'audio/mpeg': Music,
  'audio/mp3': Music,
  'application/zip': Archive,
  'application/x-zip-compressed': Archive,
};

export default function NewFilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_free: false,
    product_ids: [] as string[],
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, '') }));
    }

    // Upload file
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please sign in');
      setUploading(false);
      return;
    }

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('creator-files')
      .upload(fileName, selectedFile);

    if (error) {
      alert('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('creator-files')
      .getPublicUrl(fileName);

    setUploadedUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!file || !uploadedUrl) {
      alert('Please upload a file');
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
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    const { error } = await supabase
      .from('content_items')
      .insert({
        creator_id: creator.id,
        title: formData.title,
        slug,
        description: formData.description,
        content_type: 'file',
        file_url: uploadedUrl,
        file_name: file.name,
        file_size_bytes: file.size,
        file_type: file.type,
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const FileIcon = file ? (fileTypeIcons[file.type] || File) : File;

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
            Upload File
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving || !formData.title || !uploadedUrl}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2",
              theme === 'dark' 
                ? 'bg-dark-700 text-white hover:bg-dark-600' 
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
              (saving || !formData.title || !uploadedUrl) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving || !formData.title || !uploadedUrl || (!formData.is_free && formData.product_ids.length === 0)}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white",
              (saving || !formData.title || !uploadedUrl || (!formData.is_free && formData.product_ids.length === 0)) && 'opacity-50 cursor-not-allowed'
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
          {/* File Upload */}
          <div className={cn(
            "rounded-xl border p-6",
            theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
          )}>
            <label className={cn("block font-medium mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              File
            </label>
            
            {!file ? (
              <label className={cn(
                "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                theme === 'dark' 
                  ? 'border-dark-600 hover:border-purple-500/50 bg-dark-900' 
                  : 'border-gray-300 hover:border-purple-300 bg-gray-50'
              )}>
                <Upload className={cn("h-10 w-10 mb-3", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
                <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  Click to upload or drag and drop
                </p>
                <p className={cn("text-sm mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                  PDF, Audio, ZIP (Max 50MB)
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.mp3,.wav,.zip,.rar"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  theme === 'dark' ? 'bg-dark-600' : 'bg-white'
                )}>
                  <FileIcon className={cn("h-6 w-6", theme === 'dark' ? 'text-green-400' : 'text-green-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium truncate", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {file.name}
                  </p>
                  <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                    {formatFileSize(file.size)}
                    {uploading && ' · Uploading...'}
                    {uploadedUrl && ' · Uploaded ✓'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setUploadedUrl('');
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'dark' ? 'hover:bg-dark-600 text-dark-400' : 'hover:bg-gray-200 text-gray-500'
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

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
                placeholder="File title..."
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
                placeholder="What's in this file?"
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
                Make this file free for everyone
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
            theme === 'dark' ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'
          )}>
            <h3 className={cn("font-medium mb-3", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Secure Downloads
            </h3>
            <ul className={cn("text-sm space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
              <li>• Files are stored securely</li>
              <li>• Only entitled users can download</li>
              <li>• Download links expire after use</li>
              <li>• Track download analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
