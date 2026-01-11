'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SOUTH_SUDAN_BANKS } from '@/lib/constants';
import { Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    full_name: '',
    business_name: '',
    phone: '',
    mtn_momo_number: '',
    bank_name_ssp: '',
    bank_account_number_ssp: '',
    bank_account_name_ssp: '',
    bank_name_usd: '',
    bank_account_number_usd: '',
    bank_account_name_usd: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setSettings({
          full_name: data.full_name || '',
          business_name: data.business_name || '',
          phone: data.phone || '',
          mtn_momo_number: data.mtn_momo_number || '',
          bank_name_ssp: data.bank_name_ssp || '',
          bank_account_number_ssp: data.bank_account_number_ssp || '',
          bank_account_name_ssp: data.bank_account_name_ssp || '',
          bank_name_usd: data.bank_name_usd || '',
          bank_account_number_usd: data.bank_account_number_usd || '',
          bank_account_name_usd: data.bank_account_name_usd || '',
        });
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('users')
      .update(settings)
      .eq('id', user?.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and payment settings</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={settings.full_name}
              onChange={(e) => setSettings({ ...settings, full_name: e.target.value })}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="label">Business Name</label>
            <input
              type="text"
              value={settings.business_name}
              onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="input mt-1"
              placeholder="+211 9XX XXX XXX"
            />
          </div>
        </div>
      </div>

      {/* MTN MoMo Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">MTN Mobile Money</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is the number customers will send payments to. Make sure it&apos;s correct!
        </p>
        <div>
          <label className="label">MTN MoMo Number</label>
          <input
            type="tel"
            value={settings.mtn_momo_number}
            onChange={(e) => setSettings({ ...settings, mtn_momo_number: e.target.value })}
            className="input mt-1"
            placeholder="+211 9XX XXX XXX"
          />
        </div>
      </div>

      {/* SSP Bank Account */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Account (SSP)</h2>
        <p className="text-sm text-gray-600 mb-4">
          South Sudanese Pound bank account for local transfers.
        </p>
        <div className="space-y-4">
          <div>
            <label className="label">Bank Name</label>
            <select
              value={settings.bank_name_ssp}
              onChange={(e) => setSettings({ ...settings, bank_name_ssp: e.target.value })}
              className="input mt-1"
            >
              <option value="">Select a bank</option>
              {SOUTH_SUDAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Account Number</label>
            <input
              type="text"
              value={settings.bank_account_number_ssp}
              onChange={(e) => setSettings({ ...settings, bank_account_number_ssp: e.target.value })}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="label">Account Name</label>
            <input
              type="text"
              value={settings.bank_account_name_ssp}
              onChange={(e) => setSettings({ ...settings, bank_account_name_ssp: e.target.value })}
              className="input mt-1"
            />
          </div>
        </div>
      </div>

      {/* USD Bank Account */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Account (USD)</h2>
        <p className="text-sm text-gray-600 mb-4">
          US Dollar bank account for international transfers.
        </p>
        <div className="space-y-4">
          <div>
            <label className="label">Bank Name</label>
            <select
              value={settings.bank_name_usd}
              onChange={(e) => setSettings({ ...settings, bank_name_usd: e.target.value })}
              className="input mt-1"
            >
              <option value="">Select a bank</option>
              {SOUTH_SUDAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Account Number</label>
            <input
              type="text"
              value={settings.bank_account_number_usd}
              onChange={(e) => setSettings({ ...settings, bank_account_number_usd: e.target.value })}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="label">Account Name</label>
            <input
              type="text"
              value={settings.bank_account_name_usd}
              onChange={(e) => setSettings({ ...settings, bank_account_name_usd: e.target.value })}
              className="input mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
