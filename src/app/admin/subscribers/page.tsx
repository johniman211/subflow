'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Loader2, Users, Crown } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [planFilter]);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch plans
    const { data: plansData } = await supabase
      .from('platform_plans')
      .select('*')
      .order('sort_order');
    setPlans(plansData || []);

    // Fetch users with their subscriptions
    let query = supabase
      .from('users')
      .select('*, platform_subscriptions(*, platform_plans(*)), platform_plans(*)')
      .order('created_at', { ascending: false });

    if (planFilter !== 'all') {
      query = query.eq('platform_plan_id', planFilter);
    }

    const { data } = await query;
    setSubscribers(data || []);
    setLoading(false);
  };

  const filteredSubscribers = subscribers.filter(user => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.business_name?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (subscription: any) => {
    if (!subscription) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Free</span>;
    }
    switch (subscription.status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>;
      case 'trialing':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Trial</span>;
      case 'past_due':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Past Due</span>;
      case 'canceled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Canceled</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{subscription.status}</span>;
    }
  };

  const makeAdmin = async (userId: string) => {
    if (!confirm('Make this user a platform admin?')) return;
    
    const supabase = createClient();
    await supabase
      .from('users')
      .update({ is_platform_admin: true })
      .eq('id', userId);
    
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Subscribers</h1>
        <p className="text-gray-600 mt-1">Manage users and their subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
        </div>
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{plan.name}</p>
            <p className="text-2xl font-bold text-gray-900">
              {subscribers.filter(s => s.platform_plan_id === plan.id || (!s.platform_plan_id && plan.slug === 'free')).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
            placeholder="Search by name, email, or business..."
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
        >
          <option value="all">All Plans</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((user) => {
                  const subscription = user.platform_subscriptions?.[0];
                  const plan = user.platform_plans || plans.find(p => p.slug === 'free');
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {user.is_platform_admin ? (
                              <Crown className="h-5 w-5 text-amber-500" />
                            ) : (
                              <Users className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{user.business_name || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{plan?.name || 'Free'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{user.subscriber_count || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(subscription)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {!user.is_platform_admin && (
                          <button
                            onClick={() => makeAdmin(user.id)}
                            className="text-sm text-amber-600 hover:text-amber-700"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
