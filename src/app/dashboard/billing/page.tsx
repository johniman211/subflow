'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils';
import { 
  Crown, 
  CreditCard, 
  Clock, 
  Check, 
  Zap, 
  Loader2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { UpgradeModal } from '@/components/billing/UpgradeModal';
import { useBilling } from '@/contexts/BillingContext';

export default function BillingPage() {
  const { plan, subscription, limits, trialDaysRemaining, setShowUpgradeModal, refreshBilling } = useBilling();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Fetch payment history
    const { data: paymentData } = await supabase
      .from('platform_payments')
      .select('*, platform_plans(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch all plans
    const { data: plansData } = await supabase
      .from('platform_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    setPayments(paymentData || []);
    setPlans(plansData?.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    })) || []);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Confirmed</span>;
      case 'matched':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Processing</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UpgradeModal />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">Manage your plan and payment history</p>
      </div>

      {/* Trial Banner */}
      {subscription?.status === 'trialing' && trialDaysRemaining > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pro Trial Active</h3>
                <p className="text-white/80">{trialDaysRemaining} days remaining in your free trial</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-white text-amber-600 font-medium rounded-xl hover:bg-white/90"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              plan?.slug === 'pro' ? 'bg-amber-100' : 'bg-gray-100'
            }`}>
              <Crown className={`h-6 w-6 ${plan?.slug === 'pro' ? 'text-amber-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan?.name || 'Free'} Plan</h2>
              <p className="text-gray-500 dark:text-dark-400">
                {subscription?.status === 'trialing' ? 'Trial' : 
                 subscription?.status === 'active' ? 'Active subscription' : 
                 'Free tier'}
              </p>
            </div>
          </div>
          {plan?.slug !== 'pro' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600"
            >
              <Zap className="h-4 w-4" />
              Upgrade
            </button>
          )}
        </div>

        {/* Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-dark-800 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-dark-400">Subscribers Used</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{limits?.current_count || 0}</span>
              <span className="text-gray-500 dark:text-dark-400">
                / {limits?.max_allowed === -1 ? '∞' : limits?.max_allowed || 50}
              </span>
            </div>
            {limits?.is_at_limit && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Limit reached
              </p>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-dark-800 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-dark-400">API Access</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {plan?.limits?.api_access ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-800 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-dark-400">Next Billing</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {subscription?.current_period_end 
                ? formatDate(subscription.current_period_end)
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrentPlan = plan?.id === p.id;
            return (
              <div
                key={p.id}
                className={`border-2 rounded-xl p-4 ${
                  isCurrentPlan 
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                    : 'border-gray-200 dark:border-dark-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{p.name}</h4>
                  {isCurrentPlan && (
                    <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  ${p.price_monthly}<span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <ul className="mt-3 space-y-1">
                  {p.features?.slice(0, 4).map((f: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-dark-400 flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrentPlan && p.slug !== 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full mt-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center justify-center gap-1"
                  >
                    {p.slug === 'enterprise' ? 'Contact Sales' : 'Upgrade'} <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h3>
        </div>
        {payments.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-dark-800">
            {payments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-dark-800 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{payment.platform_plans?.name} - {payment.billing_period}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-400">{formatDateTime(payment.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.amount, payment.currency)}</p>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-dark-400">
            <CreditCard className="h-12 w-12 text-gray-300 dark:text-dark-600 mx-auto mb-4" />
            No payment history
          </div>
        )}
      </div>
    </div>
  );
}
