'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const supabase = createClient();

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active subscribers (users with paid plans)
    const { data: freePlan } = await supabase
      .from('platform_plans')
      .select('id')
      .eq('slug', 'free')
      .single();

    const { count: activeSubscribers } = await supabase
      .from('platform_subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    // Get monthly revenue (confirmed payments this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyPayments } = await supabase
      .from('platform_payments')
      .select('amount')
      .eq('status', 'confirmed')
      .gte('confirmed_at', startOfMonth.toISOString());

    const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    // Get pending payments
    const { count: pendingPayments } = await supabase
      .from('platform_payments')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'matched']);

    // Get recent payments
    const { data: recent } = await supabase
      .from('platform_payments')
      .select('*, users(full_name, email), platform_plans(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      monthlyRevenue,
      pendingPayments: pendingPayments || 0,
    });
    setRecentPayments(recent || []);
    setLoading(false);
  };

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      label: 'Active Subscribers', 
      value: stats.activeSubscribers, 
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    { 
      label: 'Monthly Revenue', 
      value: formatCurrency(stats.monthlyRevenue, 'USD'), 
      icon: DollarSign,
      color: 'bg-amber-500'
    },
    { 
      label: 'Pending Payments', 
      value: stats.pendingPayments, 
      icon: CreditCard,
      color: 'bg-purple-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Platform Payments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : recentPayments.length > 0 ? (
            recentPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{payment.users?.full_name || payment.users?.email || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{payment.platform_plans?.name} - {payment.billing_period}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    payment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    payment.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No payments yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
