import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Package, CreditCard, Users, TrendingUp, Plus, ArrowRight, Sparkles } from 'lucide-react';
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
    { name: 'Total Products', value: productsCount || 0, icon: Package, href: '/dashboard/products', color: 'lemon' },
    { name: 'Total Payments', value: paymentsCount || 0, icon: CreditCard, href: '/dashboard/payments', color: 'grape' },
    { name: 'Active Subscriptions', value: subscriptionsCount || 0, icon: Users, href: '/dashboard/subscriptions', color: 'success' },
    { name: 'Analytics', value: 'View', icon: TrendingUp, href: '/dashboard/analytics', color: 'lemon' },
  ];

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-lemon-400" />
            <span className="text-sm text-lemon-400 font-medium">{getGreeting()}</span>
          </div>
          <h1 className="text-3xl font-black text-white">{userName}!</h1>
          <p className="text-dark-400 mt-1">Here&apos;s an overview of <span className="text-white font-medium">{businessName}</span></p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          New Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link 
            key={stat.name} 
            href={stat.href} 
            className="card p-6 hover:border-lemon-400/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">{stat.name}</p>
                <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                stat.color === 'lemon' ? 'bg-lemon-400/10 group-hover:bg-lemon-400/20' :
                stat.color === 'grape' ? 'bg-grape-500/10 group-hover:bg-grape-500/20' :
                'bg-success-500/10 group-hover:bg-success-500/20'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'lemon' ? 'text-lemon-400' :
                  stat.color === 'grape' ? 'text-grape-400' :
                  'text-success-500'
                }`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/products/new" className="btn-primary btn-sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Link>
          <Link href="/dashboard/payments?status=pending" className="btn-secondary btn-sm">
            View Pending Payments
          </Link>
          <Link href="/dashboard/api-keys" className="btn-secondary btn-sm">
            Manage API Keys
          </Link>
          <Link href="/dashboard/settings" className="btn-secondary btn-sm">
            Settings
          </Link>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-dark-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-lemon-400 hover:text-lemon-300 text-sm font-medium flex items-center gap-1 transition-colors">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-dark-800">
          {recentPayments && recentPayments.length > 0 ? (
            recentPayments.map((payment: any) => (
              <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors">
                <div>
                  <p className="font-medium text-white">{payment.customer_phone}</p>
                  <p className="text-sm text-dark-400">{payment.reference_code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <span className={`badge ${
                    payment.status === 'confirmed' ? 'badge-success' : 
                    payment.status === 'pending' ? 'badge-warning' : 
                    'bg-dark-700 text-dark-300 border border-dark-600'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-dark-500" />
              </div>
              <p className="text-dark-400 mb-4">No payments yet</p>
              <Link href="/dashboard/products/new" className="btn-primary btn-sm">
                Create Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
