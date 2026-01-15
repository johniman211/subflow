import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Lock, ArrowLeft, Download, FileText, Music, Archive, File } from 'lucide-react';
import { PaywallModal } from '@/components/creator/paywall-modal';
import { ShareButton } from '@/components/creator/share-button';

const fileTypeIcons: { [key: string]: any } = {
  'application/pdf': FileText,
  'audio/mpeg': Music,
  'audio/mp3': Music,
  'application/zip': Archive,
};

function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default async function FileDownloadPage({
  params,
  searchParams,
}: {
  params: { username: string; id: string };
  searchParams: { phone?: string };
}) {
  const { username, id } = params;
  const customerPhone = searchParams.phone;
  const supabase = createServerSupabaseClient();

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (!creator) notFound();

  const { data: content } = await supabase
    .from('content_items')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('id', id)
    .eq('status', 'published')
    .eq('content_type', 'file')
    .single();

  if (!content) notFound();

  await supabase.rpc('increment_content_view', { p_content_id: content.id });

  let hasAccess = content.is_free;
  
  if (!hasAccess && customerPhone) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('customer_phone', customerPhone)
      .in('product_id', content.product_ids || [])
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .limit(1)
      .single();
    hasAccess = !!subscription;
  }

  let products: any[] = [];
  if (!hasAccess && content.product_ids?.length > 0) {
    const { data: productData } = await supabase
      .from('products')
      .select('id, name, merchant_id')
      .in('id', content.product_ids);
    
    if (productData) {
      for (const product of productData) {
        const { data: prices } = await supabase
          .from('prices')
          .select('*')
          .eq('product_id', product.id)
          .eq('is_active', true)
          .order('amount', { ascending: true })
          .limit(1);
        products.push({ ...product, price: prices?.[0] });
      }
    }
  }

  const shareUrl = `https://payssd.com/c/${username}/download/${id}`;
  const FileIcon = fileTypeIcons[content.file_type] || File;

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/c/${username}`} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href={`/c/${username}`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{creator.display_name?.charAt(0) || 'C'}</span>
              </div>
              <span className="font-medium text-white">{creator.display_name}</span>
            </Link>
          </div>
          <ShareButton url={shareUrl} title={content.title} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileIcon className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{content.title}</h1>
          {content.description && <p className="text-dark-300 mb-4">{content.description}</p>}
          <div className="flex items-center justify-center gap-4 text-dark-400 text-sm">
            <span>{content.file_name}</span>
            <span>•</span>
            <span>{formatFileSize(content.file_size_bytes || 0)}</span>
            {!content.is_free && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400"><Lock className="h-4 w-4" />Premium</span>
              </>
            )}
          </div>
        </div>

        {hasAccess ? (
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8 text-center">
            <p className="text-dark-300 mb-6">Your download is ready</p>
            <a
              href={content.file_url}
              download={content.file_name}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Download className="h-6 w-6" />
              Download File
            </a>
            <p className="text-dark-500 text-sm mt-6">{content.download_count} downloads</p>
          </div>
        ) : (
          <PaywallModal creatorName={creator.display_name} creatorUsername={username} contentTitle={content.title} contentType="file" products={products} />
        )}
      </div>

      <footer className="bg-dark-900 border-t border-dark-800 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-[#F7C500] rounded-full flex items-center justify-center">
              <span className="text-[#333] font-black text-[8px] italic">PAY</span>
            </div>
            <span className="text-white font-black text-sm italic">SSD</span>
          </div>
          <p className="text-dark-500 text-sm">Premium content · Powered by PaySSD</p>
        </div>
      </footer>
    </div>
  );
}
