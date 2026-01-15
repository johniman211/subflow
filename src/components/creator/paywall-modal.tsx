'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, CreditCard, Phone, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  merchant_id: string;
  price?: {
    id: string;
    amount: number;
    currency: string;
    billing_cycle: string;
  };
}

interface PaywallModalProps {
  creatorName: string;
  creatorUsername: string;
  contentTitle: string;
  contentType: 'post' | 'video' | 'file';
  products: Product[];
}

export function PaywallModal({
  creatorName,
  creatorUsername,
  contentTitle,
  contentType,
  products,
}: PaywallModalProps) {
  const [phone, setPhone] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const handleCheckAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setChecking(true);
    setError('');

    // Redirect with phone number to check access
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('phone', phone);
    window.location.href = currentUrl.toString();
  };

  const formatPrice = (price: Product['price']) => {
    if (!price) return 'Contact for pricing';
    const amount = new Intl.NumberFormat('en-US').format(price.amount);
    const cycle = price.billing_cycle === 'monthly' ? '/mo' : 
                  price.billing_cycle === 'yearly' ? '/yr' : '';
    return `${price.currency} ${amount}${cycle}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="h-8 w-8 text-purple-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">
        Premium Content
      </h3>
      <p className="text-dark-300 mb-6">
        Subscribe to <span className="text-purple-400">{creatorName}</span> to unlock this {contentType}
      </p>

      {/* Already subscribed? Check access */}
      <form onSubmit={handleCheckAccess} className="mb-8">
        <p className="text-sm text-dark-400 mb-3">Already subscribed? Enter your phone to access:</p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <div className="flex-1 relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-400" />
            <input
              type="tel"
              placeholder="+211..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder:text-dark-500"
            />
          </div>
          <button
            type="submit"
            disabled={checking || !phone}
            className="px-4 py-3 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition-colors disabled:opacity-50"
          >
            {checking ? '...' : 'Check'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </form>

      {/* Subscribe options */}
      {products.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-dark-400 mb-4">Or subscribe to get access:</p>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/pay/${creatorUsername}/${product.id}`}
              className="flex items-center justify-between p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-purple-500/50 transition-colors group"
            >
              <div className="text-left">
                <p className="font-medium text-white group-hover:text-purple-400 transition-colors">
                  {product.name}
                </p>
                <p className="text-sm text-dark-400">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <CreditCard className="h-5 w-5" />
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-dark-500 mt-6">
        Payments secured by PaySSD
      </p>
    </div>
  );
}
