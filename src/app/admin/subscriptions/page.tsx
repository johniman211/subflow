'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Search,
  RefreshCw,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  users: {
    full_name: string;
    email: string;
    business_name: string;
  };
  platform_plans: {
    name: string;
    slug: string;
  };
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expiring' | 'expired' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data } = await supabase
      .from('platform_subscriptions')
      .select('*, users(full_name, email, business_name), platform_plans(name, slug)')
      .order('current_period_end', { ascending: true });

    if (data) {
      setSubscriptions(data);
    }
    setLoading(false);
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (endDate: string) => {
    const days = getDaysUntilExpiry(endDate);
    if (days < 0) return 'expired';
    if (days <= 3) return 'critical';
    if (days <= 7) return 'warning';
    return 'ok';
  };

  const handleExpireSubscription = async (subscriptionId: string, userId: string) => {
    if (!confirm('Expire this subscription? User will be downgraded to Free.')) return;
    
    setProcessing(subscriptionId);
    const supabase = createClient();

    const { data: freePlan } = await supabase
      .from('platform_plans')
      .select('id')
      .eq('slug', 'free')
      .single();

    await supabase
      .from('platform_subscriptions')
      .update({ status: 'expired' })
      .eq('id', subscriptionId);

    if (freePlan) {
      await supabase
        .from('users')
        .update({ platform_plan_id: freePlan.id })
        .eq('id', userId);
    }

    setProcessing(null);
    fetchSubscriptions();
  };

  const handleExtendSubscription = async (subscriptionId: string, days: number) => {
    setProcessing(subscriptionId);
    const supabase = createClient();

    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (!subscription) return;

    const currentEnd = new Date(subscription.current_period_end);
    const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

    await supabase
      .from('platform_subscriptions')
      .update({ 
        current_period_end: newEnd.toISOString(),
        status: 'active'
      })
      .eq('id', subscriptionId);

    setProcessing(null);
    fetchSubscriptions();
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        sub.users?.full_name?.toLowerCase().includes(query) ||
        sub.users?.email?.toLowerCase().includes(query) ||
        sub.users?.business_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    const expiryStatus = getExpiryStatus(sub.current_period_end);
    switch (filter) {
      case 'expiring':
        return expiryStatus === 'warning' || expiryStatus === 'critical';
      case 'expired':
        return expiryStatus === 'expired' || sub.status === 'expired';
      case 'active':
        return sub.status === 'active' && expiryStatus !== 'expired';
      default:
        return true;
    }
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active' && getDaysUntilExpiry(s.current_period_end) > 0).length,
    expiringSoon: subscriptions.filter(s => {
      const days = getDaysUntilExpiry(s.current_period_end);
      return days > 0 && days <= 7;
    }).length,
    expired: subscriptions.filter(s => getDaysUntilExpiry(s.current_period_end) <= 0 || s.status === 'expired').length,
  };

  const getStatusBadge = (sub: Subscription) => {
    if (sub.status === 'expired') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Expired</span>;
    }
    
    const status = getExpiryStatus(sub.current_period_end);
    const days = getDaysUntilExpiry(sub.current_period_end);
    
    switch (status) {
      case 'expired':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Expired {Math.abs(days)}d ago</span>;
      case 'critical':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 animate-pulse">Expires in {days}d</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Expires in {days}d</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active ({days}d)</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage user subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-amber-300" onClick={() => setFilter('expiring')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
              <p className="text-xs text-gray-500">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-red-300" onClick={() => setFilter('expired')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              <p className="text-xs text-gray-500">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      {stats.expiringSoon > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Subscriptions Expiring Soon</h3>
              <p className="text-sm text-amber-700 mt-1">
                {stats.expiringSoon} subscription(s) will expire in the next 7 days. 
                Contact users to remind them about renewal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl"
            placeholder="Search by name, email, or business..."
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-3 bg-white border border-gray-300 rounded-xl"
        >
          <option value="all">All Subscriptions</option>
          <option value="active">Active Only</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={fetchSubscriptions}
          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period End</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{sub.users?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{sub.users?.email}</p>
                    {sub.users?.business_name && (
                      <p className="text-xs text-gray-400">{sub.users.business_name}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{sub.platform_plans?.name}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(sub)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(sub.current_period_end)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <button 
                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1"
                        disabled={processing === sub.id}
                      >
                        Extend <ChevronDown className="h-3 w-3" />
                      </button>
                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleExtendSubscription(sub.id, 7)}
                          className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          +7 days
                        </button>
                        <button
                          onClick={() => handleExtendSubscription(sub.id, 30)}
                          className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          +30 days
                        </button>
                        <button
                          onClick={() => handleExtendSubscription(sub.id, 365)}
                          className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          +1 year
                        </button>
                      </div>
                    </div>
                    {sub.status !== 'expired' && (
                      <button
                        onClick={() => handleExpireSubscription(sub.id, sub.user_id)}
                        disabled={processing === sub.id}
                        className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Expire
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No subscriptions found
          </div>
        )}
      </div>
    </div>
  );
}
