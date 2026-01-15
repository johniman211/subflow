'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Package, Plus, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  prices: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    billing_cycle: string;
  }[];
}

export default function ProductsPage() {
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        is_active,
        created_at,
        prices(id, name, amount, currency, billing_cycle)
      `)
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data);
    }

    setLoading(false);
  };

  const formatPrice = (price: Product['prices'][0]) => {
    const amount = new Intl.NumberFormat('en-US').format(price.amount);
    const cycle = price.billing_cycle === 'monthly' ? '/mo' : 
                  price.billing_cycle === 'yearly' ? '/yr' : '';
    return `${price.currency} ${amount}${cycle}`;
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
            Products & Pricing
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Reuse your PaySSD products for content access
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Create Product
        </Link>
      </div>

      {/* Info Banner */}
      <div className={cn(
        "p-4 rounded-xl border",
        theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
      )}>
        <p className={cn("text-sm", theme === 'dark' ? 'text-blue-300' : 'text-blue-700')}>
          <strong>Tip:</strong> Link your products to content items to control access. 
          Users who subscribe to a product get access to all content linked to that product.
        </p>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <Package className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No products yet
          </h3>
          <p className={cn("mb-6", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Create products in the main dashboard to monetize your content
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
          >
            <Plus className="h-5 w-5" />
            Create Product
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "rounded-xl border p-6 transition-colors",
                theme === 'dark' 
                  ? 'bg-dark-800 border-dark-700 hover:border-dark-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {product.name}
                    </h3>
                    {product.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {product.description && (
                    <p className={cn("text-sm mt-1 line-clamp-2", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Prices */}
              <div className="space-y-2 mb-4">
                {product.prices.map((price) => (
                  <div
                    key={price.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg",
                      theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'
                    )}
                  >
                    <span className={cn("text-sm", theme === 'dark' ? 'text-dark-300' : 'text-gray-700')}>
                      {price.name}
                    </span>
                    <span className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {formatPrice(price)}
                    </span>
                  </div>
                ))}
                {product.prices.length === 0 && (
                  <p className={cn("text-sm", theme === 'dark' ? 'text-dark-500' : 'text-gray-500')}>
                    No prices set
                  </p>
                )}
              </div>

              <Link
                href={`/dashboard/products/${product.id}`}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-2 rounded-lg border transition-colors",
                  theme === 'dark' 
                    ? 'border-dark-600 text-dark-300 hover:text-white hover:border-dark-500' 
                    : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400'
                )}
              >
                <ExternalLink className="h-4 w-4" />
                Manage in Dashboard
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
