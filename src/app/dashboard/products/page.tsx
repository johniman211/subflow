import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus, ExternalLink } from 'lucide-react';

export default async function ProductsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('merchant_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your digital products and pricing plans</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <div key={product.id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {product.description || 'No description'}
                    </p>
                  </div>
                  <span className={`badge ${product.is_active ? 'badge-success' : 'badge-gray'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {product.prices?.map((price: any) => (
                    <div key={price.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{price.name}</span>
                      <span className="font-medium">
                        {formatCurrency(price.amount, price.currency)}
                        {price.billing_cycle !== 'one_time' && (
                          <span className="text-gray-500">/{price.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {(!product.prices || product.prices.length === 0) && (
                    <p className="text-sm text-gray-500">No pricing plans</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {formatDate(product.created_at)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/checkout/${product.id}`}
                      target="_blank"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                    >
                      Checkout <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Create your first product to start accepting payments</p>
          <Link href="/dashboard/products/new" className="btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            Create Product
          </Link>
        </div>
      )}
    </div>
  );
}

function Package(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}
