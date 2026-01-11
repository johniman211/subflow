import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Users } from 'lucide-react';

export default async function SubscriptionsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, products(name), prices(name, amount, currency, billing_cycle)')
    .eq('merchant_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600 mt-1">Manage customer subscriptions</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{sub.customer_phone}</p>
                      {sub.customer_email && (
                        <p className="text-sm text-gray-500">{sub.customer_email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{sub.products?.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{sub.prices?.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(sub.prices?.amount, sub.prices?.currency)}
                        {sub.prices?.billing_cycle !== 'one_time' && `/${sub.prices?.billing_cycle === 'monthly' ? 'mo' : 'yr'}`}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(sub.status)}`}>{sub.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sub.current_period_start)} - {formatDate(sub.current_period_end)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No subscriptions yet</p>
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
