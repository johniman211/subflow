'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, CreditCard, Smartphone, Building } from 'lucide-react';

interface PaymentSettings {
  mtn_momo: { number: string; name: string };
  bank_ssp: { bank_name: string; account_number: string; account_name: string };
  bank_usd: { bank_name: string; account_number: string; account_name: string };
}

export default function AdminSettings() {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    mtn_momo: { number: '', name: '' },
    bank_ssp: { bank_name: '', account_number: '', account_name: '' },
    bank_usd: { bank_name: '', account_number: '', account_name: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'payment_info')
      .single();

    if (data?.value) {
      setPaymentSettings(data.value as PaymentSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        key: 'payment_info',
        value: paymentSettings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key'
      });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure payment receiving accounts</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {/* MTN MoMo */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">MTN Mobile Money</h2>
              <p className="text-sm text-gray-500">Users will send payments to this number</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MoMo Number</label>
              <input
                type="text"
                value={paymentSettings.mtn_momo.number}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  mtn_momo: { ...paymentSettings.mtn_momo, number: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="+211 9XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                value={paymentSettings.mtn_momo.name}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  mtn_momo: { ...paymentSettings.mtn_momo, name: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Losetify"
              />
            </div>
          </div>
        </div>

        {/* Bank SSP */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bank Account (SSP)</h2>
              <p className="text-sm text-gray-500">South Sudanese Pound bank account</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={paymentSettings.bank_ssp.bank_name}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  bank_ssp: { ...paymentSettings.bank_ssp, bank_name: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Bank Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={paymentSettings.bank_ssp.account_number}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  bank_ssp: { ...paymentSettings.bank_ssp, account_number: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Account Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                value={paymentSettings.bank_ssp.account_name}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  bank_ssp: { ...paymentSettings.bank_ssp, account_name: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Account Holder Name"
              />
            </div>
          </div>
        </div>

        {/* Bank USD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bank Account (USD)</h2>
              <p className="text-sm text-gray-500">US Dollar bank account for international payments</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={paymentSettings.bank_usd.bank_name}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  bank_usd: { ...paymentSettings.bank_usd, bank_name: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Bank Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={paymentSettings.bank_usd.account_number}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  bank_usd: { ...paymentSettings.bank_usd, account_number: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Account Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                value={paymentSettings.bank_usd.account_name}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  bank_usd: { ...paymentSettings.bank_usd, account_name: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Account Holder Name"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
