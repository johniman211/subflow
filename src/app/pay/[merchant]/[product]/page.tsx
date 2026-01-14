import { createServiceRoleClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Shield, Lock } from 'lucide-react';
import Link from 'next/link';

interface PayPageProps {
  params: { merchant: string; product: string };
}

export default async function PayPage({ params }: PayPageProps) {
  const supabase = createServiceRoleClient();

  // Find merchant by slug (business_name converted to slug)
  const merchantSlug = params.merchant.toLowerCase();
  const productSlug = params.product.toLowerCase();

  // First try to find by exact product ID
  let productQuery = supabase
    .from('products')
    .select('*, prices(*), users!products_merchant_id_fkey(id, business_name, mtn_momo_number, bank_name_ssp, bank_account_number_ssp, bank_account_name_ssp, bank_name_usd, bank_account_number_usd, bank_account_name_usd, platform_plan_id)')
    .eq('is_active', true);

  // If product param looks like UUID, search by ID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.product);
  
  if (isUUID) {
    productQuery = productQuery.eq('id', params.product);
  }

  const { data: products } = await productQuery;

  // Find product matching merchant slug and product slug/id
  let product = products?.find((p: any) => {
    const businessSlug = (p.users?.business_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const productNameSlug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Match merchant by business name slug
    const merchantMatch = businessSlug === merchantSlug || 
                          businessSlug.includes(merchantSlug) ||
                          merchantSlug.includes(businessSlug);
    
    // Match product by name slug or ID
    const productMatch = isUUID ? p.id === params.product : 
                         productNameSlug === productSlug ||
                         productNameSlug.includes(productSlug);
    
    return merchantMatch && productMatch;
  });

  // If not found with slug matching, try direct product ID with any merchant
  if (!product && isUUID) {
    product = products?.find((p: any) => p.id === params.product);
  }

  if (!product) {
    notFound();
  }

  // Check if merchant is on free plan (show branding)
  let showBranding = true;
  if (product?.users?.platform_plan_id) {
    const { data: merchantPlan } = await supabase
      .from('platform_plans')
      .select('slug, limits')
      .eq('id', product.users.platform_plan_id)
      .single();
    
    if (merchantPlan?.limits?.custom_branding === true) {
      showBranding = false;
    }
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
        {/* Left Panel - Product Info */}
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
                {product.users?.business_name || 'Payssd'}
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
            {showBranding && (
              <Link href="https://www.payssd.com" target="_blank" className="flex items-center gap-2 hover:text-white transition-colors">
                <Shield className="h-4 w-4" />
                <span>Powered by Payssd</span>
              </Link>
            )}
          </div>
        </div>

        {/* Right Panel - Checkout Form */}
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
                {showBranding && (
                  <Link href="https://www.payssd.com" target="_blank" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    <Shield className="h-3 w-3" />
                    <span>Powered by Payssd</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PayPageProps) {
  const supabase = createServiceRoleClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('name, description, users!products_merchant_id_fkey(business_name)')
    .eq('is_active', true);

  const merchantSlug = params.merchant.toLowerCase();
  const product = products?.find((p: any) => {
    const businessSlug = (p.users?.business_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return businessSlug.includes(merchantSlug) || merchantSlug.includes(businessSlug);
  });

  return {
    title: product ? `Pay - ${product.name}` : 'Checkout',
    description: product?.description || 'Complete your payment',
  };
}
