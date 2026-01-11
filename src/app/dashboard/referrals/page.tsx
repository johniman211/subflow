'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Gift, Plus, Copy, Check, Trash2, Loader2, Users, DollarSign } from 'lucide-react';
import { nanoid } from 'nanoid';

interface Referral {
  id: string;
  referrer_phone: string;
  referrer_name: string | null;
  referral_code: string;
  reward_type: 'percentage' | 'fixed' | 'free_month';
  reward_value: number;
  referral_count: number;
  total_earnings: number;
  is_active: boolean;
  created_at: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    referrer_phone: '',
    referrer_name: '',
    reward_type: 'percentage' as 'percentage' | 'fixed' | 'free_month',
    reward_value: 10,
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });
    setReferrals(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.referrer_phone) return;
    setCreating(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const referralCode = 'REF' + nanoid(6).toUpperCase();

    const { error } = await supabase.from('referrals').insert({
      merchant_id: user?.id,
      referrer_phone: formData.referrer_phone,
      referrer_name: formData.referrer_name || null,
      referral_code: referralCode,
      reward_type: formData.reward_type,
      reward_value: formData.reward_value,
    });

    if (error) {
      alert('Error creating referral: ' + error.message);
    } else {
      setFormData({ referrer_phone: '', referrer_name: '', reward_type: 'percentage', reward_value: 10 });
      setShowForm(false);
      fetchReferrals();
    }
    setCreating(false);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('referrals').update({ is_active: !isActive }).eq('id', id);
    fetchReferrals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this referral partner?')) return;
    const supabase = createClient();
    await supabase.from('referrals').delete().eq('id', id);
    fetchReferrals();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const stats = {
    totalReferrers: referrals.length,
    activeReferrers: referrals.filter(r => r.is_active).length,
    totalReferrals: referrals.reduce((sum, r) => sum + r.referral_count, 0),
    totalEarnings: referrals.reduce((sum, r) => sum + r.total_earnings, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-gray-600 mt-1">Reward customers for bringing new subscribers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Referral Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Partners</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalReferrers}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Referrals</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalReferrals}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Out</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings, 'SSP')}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeReferrers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Referral Partner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                value={formData.referrer_phone}
                onChange={(e) => setFormData({ ...formData, referrer_phone: e.target.value })}
                className="input mt-1"
                placeholder="+211 9XX XXX XXX"
              />
            </div>
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                value={formData.referrer_name}
                onChange={(e) => setFormData({ ...formData, referrer_name: e.target.value })}
                className="input mt-1"
                placeholder="Partner name"
              />
            </div>
            <div>
              <label className="label">Reward Type</label>
              <select
                value={formData.reward_type}
                onChange={(e) => setFormData({ ...formData, reward_type: e.target.value as any })}
                className="input mt-1"
              >
                <option value="percentage">Percentage of sale</option>
                <option value="fixed">Fixed amount per referral</option>
                <option value="free_month">Free month for referrer</option>
              </select>
            </div>
            <div>
              <label className="label">
                Reward Value {formData.reward_type === 'percentage' ? '(%)' : formData.reward_type === 'fixed' ? '(SSP)' : '(months)'}
              </label>
              <input
                type="number"
                value={formData.reward_value}
                onChange={(e) => setFormData({ ...formData, reward_value: parseFloat(e.target.value) })}
                className="input mt-1"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Partner'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Referrals List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{referral.referrer_name || 'Unnamed'}</p>
                      <p className="text-sm text-gray-500">{referral.referrer_phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-primary-600">{referral.referral_code}</code>
                        <button onClick={() => copyCode(referral.referral_code)} className="p-1 hover:bg-gray-100 rounded">
                          {copied === referral.referral_code ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {referral.reward_type === 'percentage' && `${referral.reward_value}% commission`}
                      {referral.reward_type === 'fixed' && `${formatCurrency(referral.reward_value, 'SSP')} per referral`}
                      {referral.reward_type === 'free_month' && `${referral.reward_value} free month(s)`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {referral.referral_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                      {formatCurrency(referral.total_earnings, 'SSP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(referral.id, referral.is_active)}
                        className={`badge ${referral.is_active ? 'badge-success' : 'badge-gray'}`}
                      >
                        {referral.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleDelete(referral.id)} className="p-2 hover:bg-danger-50 rounded text-danger-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No referral partners yet</p>
            <p className="text-sm mt-1">Create referral codes to reward customers for bringing new subscribers</p>
          </div>
        )}
      </div>
    </div>
  );
}
