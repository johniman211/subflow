import { createServiceRoleClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Shield, Lock } from 'lucide-react';

interface CheckoutPageProps {
  params: { productId: string };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const supabase = createServiceRoleClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, prices(*), users!products_merchant_id_fkey(business_name, mtn_momo_number, bank_name_ssp, bank_account_number_ssp, bank_account_name_ssp, bank_name_usd, bank_account_number_usd, bank_account_name_usd)')
    .eq('id', params.productId)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  const activePrices = product.prices?.filter((p: any) => p.is_active) || [];

  if (activePrices.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Product Unavailable</h1>
          <p className="text-slate-400 mt-2">This product has no active pricing plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI1MmUiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zMCAzMGgtMnYtMmgydjJ6bTYgMGgtMnYtMmgydjJ6bS0xMi02aC0ydjJoMnYtMnptMTggMGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Product Info (Dark) */}
        <div className="lg:w-1/2 lg:fixed lg:inset-y-0 lg:left-0 flex flex-col justify-between p-8 lg:p-12">
          <div>
            {/* Merchant Logo/Name */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {(product.users?.business_name || 'S')[0].toUpperCase()}
                </span>
              </div>
              <span className="text-white/80 font-medium">
                {product.users?.business_name || 'Losetify'}
              </span>
            </div>

            {/* Product Info */}
            <div className="max-w-md">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-lg text-slate-400 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Security Badge */}
          <div className="hidden lg:flex items-center gap-6 text-slate-500 text-sm mt-8">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Powered by Losetify</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Checkout Form (Light) */}
        <div className="lg:w-1/2 lg:ml-auto min-h-screen">
          <div className="min-h-full bg-white lg:rounded-l-3xl shadow-2xl">
            <div className="p-6 lg:p-12 max-w-lg mx-auto">
              <CheckoutForm
                product={product}
                prices={activePrices}
                merchant={product.users}
              />
              
              {/* Mobile Security Badge */}
              <div className="lg:hidden flex items-center justify-center gap-6 text-slate-400 text-xs mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Powered by Losetify</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
