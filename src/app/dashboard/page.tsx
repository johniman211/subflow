import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Package, CreditCard, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: productsCount },
    { count: paymentsCount },
    { count: subscriptionsCount },
    { data: recentPayments },
    { data: profile },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('merchant_id', user?.id),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', user?.id),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('merchant_id', user?.id).eq('status', 'active'),
    supabase.from('payments').select('*, prices(name, currency)').eq('merchant_id', user?.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('full_name, business_name').eq('id', user?.id).single(),
  ]);

  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const businessName = profile?.business_name || 'your business';

  const stats = [
    { name: 'Total Products', value: productsCount || 0, icon: Package, href: '/dashboard/products' },
    { name: 'Total Payments', value: paymentsCount || 0, icon: CreditCard, href: '/dashboard/payments' },
    { name: 'Active Subscriptions', value: subscriptionsCount || 0, icon: Users, href: '/dashboard/subscriptions' },
    { name: 'This Month', value: 'View Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {userName}!</h1>
        <p className="text-gray-600 mt-1">Here&apos;s an overview of <strong>{businessName}</strong>.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/products/new" className="btn-primary">
            Create Product
          </Link>
          <Link href="/dashboard/payments?status=pending" className="btn-secondary">
            View Pending Payments
          </Link>
          <Link href="/dashboard/api-keys" className="btn-secondary">
            Manage API Keys
          </Link>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentPayments && recentPayments.length > 0 ? (
            recentPayments.map((payment: any) => (
              <div key={payment.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{payment.customer_phone}</p>
                  <p className="text-sm text-gray-500">{payment.reference_code}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <span className={`badge badge-${payment.status === 'confirmed' ? 'success' : payment.status === 'pending' ? 'warning' : 'gray'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No payments yet. Create a product and share your checkout link to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
