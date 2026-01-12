import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SubscriptionActions } from '@/components/dashboard/subscription-actions';

export default async function SubscriptionsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, products(name), prices(name, amount, currency, billing_cycle)')
    .eq('merchant_id', user?.id)
    .order('current_period_end', { ascending: true });

  const now = new Date();
  const GRACE_PERIOD_DAYS = 7;

  const getSubscriptionStatus = (sub: any) => {
    if (!sub.current_period_end) return { status: 'unknown', daysLeft: 0 };
    
    const endDate = new Date(sub.current_period_end);
    const diffMs = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysLeft < -GRACE_PERIOD_DAYS) return { status: 'expired', daysLeft };
    if (daysLeft < 0) return { status: 'grace_period', daysLeft: GRACE_PERIOD_DAYS + daysLeft };
    if (daysLeft <= 3) return { status: 'critical', daysLeft };
    if (daysLeft <= 7) return { status: 'warning', daysLeft };
    return { status: 'active', daysLeft };
  };

  const stats = {
    total: subscriptions?.length || 0,
    active: subscriptions?.filter(s => getSubscriptionStatus(s).status === 'active').length || 0,
    expiringSoon: subscriptions?.filter(s => ['warning', 'critical'].includes(getSubscriptionStatus(s).status)).length || 0,
    gracePeriod: subscriptions?.filter(s => getSubscriptionStatus(s).status === 'grace_period').length || 0,
    expired: subscriptions?.filter(s => getSubscriptionStatus(s).status === 'expired').length || 0,
  };

  const getStatusBadge = (sub: any) => {
    const { status, daysLeft } = getSubscriptionStatus(sub);
    
    switch (status) {
      case 'expired':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Expired</span>;
      case 'grace_period':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 animate-pulse">Grace: {daysLeft}d left</span>;
      case 'critical':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Expires in {daysLeft}d</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Expires in {daysLeft}d</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active ({daysLeft}d)</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Subscriptions</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">Track and manage your customer subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Expiring</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.gracePeriod}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Grace Period</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">{stats.expired}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      {(stats.expiringSoon > 0 || stats.gracePeriod > 0) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-400">Action Required</h3>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                {stats.expiringSoon > 0 && `${stats.expiringSoon} subscription(s) expiring soon. `}
                {stats.gracePeriod > 0 && `${stats.gracePeriod} subscription(s) in grace period - collect payment now!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-50 dark:bg-dark-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Period End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
              {subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{sub.customer_phone}</p>
                      {sub.customer_email && (
                        <p className="text-sm text-gray-500 dark:text-dark-400">{sub.customer_email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">{sub.products?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">{sub.prices?.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(sub.prices?.amount, sub.prices?.currency)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {sub.prices?.billing_cycle === 'monthly' ? '/month' : sub.prices?.billing_cycle === 'yearly' ? '/year' : 'one-time'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sub)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-400">
                      {formatDate(sub.current_period_end)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SubscriptionActions 
                        subscriptionId={sub.id}
                        customerPhone={sub.customer_phone}
                        customerEmail={sub.customer_email}
                        productName={sub.products?.name}
                        amount={sub.prices?.amount}
                        currency={sub.prices?.currency}
                        status={getSubscriptionStatus(sub).status}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 dark:text-dark-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-dark-400">No subscriptions yet</p>
                    <p className="text-sm text-gray-400 dark:text-dark-500 mt-1">When customers subscribe to your products, they will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
