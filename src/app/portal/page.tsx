'use client';

import { useState } from 'react';
import { Phone, Search, Loader2, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface SubscriptionInfo {
  id: string;
  status: string;
  product_name: string;
  price_name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  days_remaining: number;
  merchant_name: string;
  product_id: string;
}

interface PaymentInfo {
  id: string;
  reference_code: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  product_name: string;
}

export default function CustomerPortal() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([]);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch('/api/portal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to lookup subscriptions');
        setSubscriptions([]);
        setPayments([]);
      } else {
        setSubscriptions(data.subscriptions || []);
        setPayments(data.payments || []);
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'past_due':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'expired':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-amber-100 text-amber-800';
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customer Portal</h1>
              <p className="text-slate-600 mt-1">Check your subscriptions and payment history</p>
            </div>
            <Link href="/" className="text-slate-500 hover:text-slate-900 text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:bg-white focus:ring-0 transition-all"
                placeholder="Enter your phone number (+211...)"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Look Up
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-red-600">
            {error}
          </div>
        )}

        {searched && !loading && (
          <>
            {/* Active Subscriptions */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Subscriptions</h2>
              {subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-xl border border-slate-200 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(sub.status)}
                          <div>
                            <h3 className="font-semibold text-slate-900">{sub.product_name}</h3>
                            <p className="text-sm text-slate-500">{sub.price_name} • {sub.merchant_name}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Amount</p>
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(sub.amount, sub.currency)}
                            {sub.billing_cycle !== 'one_time' && (
                              <span className="text-slate-500 font-normal">/{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Started</p>
                          <p className="font-medium text-slate-900">{formatDate(sub.current_period_start)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Expires</p>
                          <p className="font-medium text-slate-900">{formatDate(sub.current_period_end)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Days Left</p>
                          <p className={`font-semibold ${sub.days_remaining <= 3 ? 'text-red-600' : sub.days_remaining <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                            {sub.days_remaining > 0 ? sub.days_remaining : 0}
                          </p>
                        </div>
                      </div>

                      {sub.status === 'active' && sub.billing_cycle !== 'one_time' && sub.days_remaining <= 7 && (
                        <Link
                          href={`/checkout/${sub.product_id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Renew Now
                        </Link>
                      )}

                      {(sub.status === 'expired' || sub.status === 'past_due') && (
                        <Link
                          href={`/checkout/${sub.product_id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Resubscribe
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No subscriptions found for this phone number.</p>
                </div>
              )}
            </section>

            {/* Payment History */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment History</h2>
              {payments.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-3 font-mono text-sm text-slate-900">{payment.reference_code}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{payment.product_name}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">{formatDate(payment.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-500">No payment history found.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
          Powered by Payssd • Subscription Management for South Sudan
        </div>
      </footer>
    </div>
  );
}
