'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Loader2, Eye, Search } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    const supabase = createClient();
    let query = supabase
      .from('platform_payments')
      .select('*, users(full_name, email), platform_plans(name)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setPayments(data || []);
    setLoading(false);
  };

  const handleConfirm = async (paymentId: string) => {
    setProcessing(paymentId);
    const supabase = createClient();

    // Get payment details
    const { data: payment } = await supabase
      .from('platform_payments')
      .select('*, platform_plans(*)')
      .eq('id', paymentId)
      .single();

    if (!payment) {
      setProcessing(null);
      return;
    }

    // Update payment status
    await supabase
      .from('platform_payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    // Calculate period end based on billing cycle
    const periodEnd = new Date();
    if (payment.billing_period === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Create or update subscription
    await supabase
      .from('platform_subscriptions')
      .upsert({
        user_id: payment.user_id,
        plan_id: payment.plan_id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        trial_start: null,
        trial_end: null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    // Update user's plan
    await supabase
      .from('users')
      .update({ platform_plan_id: payment.plan_id })
      .eq('id', payment.user_id);

    setProcessing(null);
    fetchPayments();
  };

  const handleReject = async (paymentId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;
    
    setProcessing(paymentId);
    const supabase = createClient();

    await supabase
      .from('platform_payments')
      .update({ status: 'failed' })
      .eq('id', paymentId);

    setProcessing(null);
    fetchPayments();
  };

  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      p.users?.full_name?.toLowerCase().includes(searchLower) ||
      p.users?.email?.toLowerCase().includes(searchLower) ||
      p.reference_code?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Confirmed</span>;
      case 'matched':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Matched</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Payments</h1>
        <p className="text-gray-600 mt-1">Manage subscription payments from users</p>
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
            placeholder="Search by name, email, or reference..."
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="matched">Matched</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payment.users?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{payment.users?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{payment.platform_plans?.name}</p>
                      <p className="text-xs text-gray-500">{payment.billing_period}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-gray-900">{payment.reference_code}</p>
                      {payment.transaction_id && (
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{payment.transaction_id}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {(payment.status === 'pending' || payment.status === 'matched') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleConfirm(payment.id)}
                            disabled={processing === payment.id}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                            title="Confirm Payment"
                          >
                            {processing === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            disabled={processing === payment.id}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                            title="Reject Payment"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          {payment.proof_url && (
                            <a
                              href={payment.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                              title="View Proof"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No payments found
          </div>
        )}
      </div>
    </div>
  );
}
