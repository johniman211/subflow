import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users, CreditCard, DollarSign } from 'lucide-react';

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: analytics } = await supabase.rpc('get_merchant_analytics', {
    p_merchant_id: user?.id,
    p_start_date: thirtyDaysAgo.toISOString(),
    p_end_date: new Date().toISOString(),
  });

  const stats = analytics?.[0] || {
    total_revenue: 0,
    total_payments: 0,
    confirmed_payments: 0,
    pending_payments: 0,
    active_subscriptions: 0,
    total_customers: 0,
    new_customers: 0,
  };

  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount, currency, status, created_at')
    .eq('merchant_id', user?.id)
    .eq('status', 'confirmed')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  const dailyRevenue: Record<string, number> = {};
  recentPayments?.forEach((payment: any) => {
    const date = new Date(payment.created_at).toLocaleDateString();
    dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(payment.amount);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Last 30 days performance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.total_revenue || 0, 'SSP')}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_payments || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.confirmed_payments} confirmed, {stats.pending_payments} pending
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active_subscriptions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_customers || 0}</p>
              <p className="text-sm text-success-600 mt-1">+{stats.new_customers || 0} new</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h2>
        <div className="h-64 flex items-end space-x-2">
          {Object.entries(dailyRevenue).length > 0 ? (
            Object.entries(dailyRevenue).map(([date, amount], index) => {
              const maxAmount = Math.max(...Object.values(dailyRevenue));
              const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
              return (
                <div key={date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${date}: ${formatCurrency(amount, 'SSP')}`}
                  />
                  {index % 5 === 0 && (
                    <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                      {date.split('/').slice(0, 2).join('/')}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No revenue data for this period
            </div>
          )}
        </div>
      </div>

      {/* Conversion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Conversion</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Confirmation Rate</span>
                <span className="font-medium">
                  {stats.total_payments > 0
                    ? ((stats.confirmed_payments / stats.total_payments) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-success-500 h-2 rounded-full"
                  style={{
                    width: `${stats.total_payments > 0 ? (stats.confirmed_payments / stats.total_payments) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Retention</h3>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-primary-600">
              {stats.total_customers > 0
                ? (((stats.total_customers - stats.new_customers) / stats.total_customers) * 100).toFixed(0)
                : 0}%
            </p>
            <p className="text-gray-600 mt-2">Returning customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
