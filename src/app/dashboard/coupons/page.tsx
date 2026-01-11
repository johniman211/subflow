'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Tag, Plus, Trash2, Loader2, Copy, Check, Percent, DollarSign } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  currency: string;
  max_uses: number | null;
  current_uses: number;
  min_amount: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    currency: 'SSP',
    max_uses: '',
    min_amount: 0,
    valid_until: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  const handleCreate = async () => {
    if (!newCoupon.code || !newCoupon.name) return;
    setCreating(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('coupons').insert({
      merchant_id: user?.id,
      code: newCoupon.code.toUpperCase(),
      name: newCoupon.name,
      discount_type: newCoupon.discount_type,
      discount_value: newCoupon.discount_value,
      currency: newCoupon.currency,
      max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
      min_amount: newCoupon.min_amount,
      valid_until: newCoupon.valid_until || null,
    });

    if (error) {
      alert('Error creating coupon: ' + error.message);
    } else {
      setNewCoupon({
        code: '',
        name: '',
        discount_type: 'percentage',
        discount_value: 10,
        currency: 'SSP',
        max_uses: '',
        min_amount: 0,
        valid_until: '',
      });
      setShowForm(false);
      fetchCoupons();
    }
    setCreating(false);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('coupons').update({ is_active: !isActive }).eq('id', id);
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const supabase = createClient();
    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-600 mt-1">Create promotional codes for your customers</p>
        </div>
        <button onClick={() => { setShowForm(true); generateCode(); }} className="btn-primary">
          <Plus className="h-5 w-5 mr-2" /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Coupon Code</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="input flex-1 font-mono"
                  placeholder="SUMMER20"
                />
                <button onClick={generateCode} className="btn-secondary">Generate</button>
              </div>
            </div>
            <div>
              <label className="label">Coupon Name</label>
              <input
                type="text"
                value={newCoupon.name}
                onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                className="input mt-1"
                placeholder="Summer Sale 20% Off"
              />
            </div>
            <div>
              <label className="label">Discount Type</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setNewCoupon({ ...newCoupon, discount_type: 'percentage' })}
                  className={`flex-1 p-3 border rounded-lg flex items-center justify-center gap-2 ${
                    newCoupon.discount_type === 'percentage' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <Percent className="h-4 w-4" /> Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setNewCoupon({ ...newCoupon, discount_type: 'fixed' })}
                  className={`flex-1 p-3 border rounded-lg flex items-center justify-center gap-2 ${
                    newCoupon.discount_type === 'fixed' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <DollarSign className="h-4 w-4" /> Fixed Amount
                </button>
              </div>
            </div>
            <div>
              <label className="label">
                Discount Value {newCoupon.discount_type === 'percentage' ? '(%)' : `(${newCoupon.currency})`}
              </label>
              <input
                type="number"
                value={newCoupon.discount_value}
                onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) })}
                className="input mt-1"
                min="0"
                max={newCoupon.discount_type === 'percentage' ? 100 : undefined}
              />
            </div>
            <div>
              <label className="label">Max Uses (optional)</label>
              <input
                type="number"
                value={newCoupon.max_uses}
                onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                className="input mt-1"
                placeholder="Unlimited"
                min="1"
              />
            </div>
            <div>
              <label className="label">Minimum Order Amount</label>
              <input
                type="number"
                value={newCoupon.min_amount}
                onChange={(e) => setNewCoupon({ ...newCoupon, min_amount: parseFloat(e.target.value) })}
                className="input mt-1"
                min="0"
              />
            </div>
            <div>
              <label className="label">Valid Until (optional)</label>
              <input
                type="datetime-local"
                value={newCoupon.valid_until}
                onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
                className="input mt-1"
              />
            </div>
            {newCoupon.discount_type === 'fixed' && (
              <div>
                <label className="label">Currency</label>
                <select
                  value={newCoupon.currency}
                  onChange={(e) => setNewCoupon({ ...newCoupon, currency: e.target.value })}
                  className="input mt-1"
                >
                  <option value="SSP">SSP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Coupon'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-primary-600">{coupon.code}</code>
                        <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-100 rounded">
                          {copied === coupon.code ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{coupon.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {coupon.discount_type === 'percentage' ? (
                        <span className="font-semibold text-green-600">{coupon.discount_value}% OFF</span>
                      ) : (
                        <span className="font-semibold text-green-600">
                          {formatCurrency(coupon.discount_value, coupon.currency)} OFF
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.current_uses} / {coupon.max_uses || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(coupon.id, coupon.is_active)}
                        className={`badge ${coupon.is_active ? 'badge-success' : 'badge-gray'}`}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleDelete(coupon.id)} className="text-danger-600 p-2 hover:bg-danger-50 rounded">
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
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No coupons created yet</p>
            <p className="text-sm mt-1">Create your first coupon to offer discounts</p>
          </div>
        )}
      </div>
    </div>
  );
}
