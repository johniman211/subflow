'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateApiKey, hashApiKey } from '@/lib/utils';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Loader2, Lock, Zap } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  public_key: string;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<{ public: string; secret: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { plan, setShowUpgradeModal } = useBilling();

  const hasApiAccess = plan?.limits?.api_access === true;

  useEffect(() => {
    if (hasApiAccess) {
      fetchApiKeys();
    } else {
      setLoading(false);
    }
  }, [hasApiAccess]);

  const fetchApiKeys = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    setApiKeys(data || []);
    setLoading(false);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);

    const publicKey = generateApiKey('pk');
    const secretKey = generateApiKey('sk');
    const secretKeyHash = hashApiKey(secretKey);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('api_keys').insert({
      merchant_id: user?.id,
      name: newKeyName,
      public_key: publicKey,
      secret_key_hash: secretKeyHash,
    });

    if (error) {
      alert('Error creating API key: ' + error.message);
      setCreating(false);
      return;
    }

    setShowNewKey({ public: publicKey, secret: secretKey });
    setNewKeyName('');
    setCreating(false);
    fetchApiKeys();
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    const supabase = createClient();
    await supabase.from('api_keys').delete().eq('id', id);
    fetchApiKeys();
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Show upgrade prompt for free plan users
  if (!hasApiAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
          <p className="text-gray-600 dark:text-dark-400 mt-1">Manage API keys for programmatic access</p>
        </div>

        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">API Access is a Pro Feature</h2>
          <p className="text-gray-600 dark:text-dark-400 mb-6 max-w-md mx-auto">
            Upgrade to Pro to get API access for integrating Losetify with your website or app. 
            Free plan users can use checkout links for integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600"
            >
              <Zap className="h-5 w-5" />
              Upgrade to Pro
            </button>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-dark-700"
            >
              Use Checkout Links Instead
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What you get with Pro API access:</h3>
            <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-2">
              <li>✓ Create checkout sessions programmatically</li>
              <li>✓ Verify customer subscriptions in your app</li>
              <li>✓ List products and prices via API</li>
              <li>✓ Webhook notifications for payment events</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
        <p className="text-gray-600 dark:text-dark-400 mt-1">Manage API keys for programmatic access</p>
      </div>

      {/* Create New Key */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New API Key</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="input flex-1"
            placeholder="Key name (e.g., Production, Development)"
          />
          <button
            onClick={handleCreateKey}
            disabled={creating || !newKeyName.trim()}
            className="btn-primary"
          >
            {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5 mr-2" /> Create Key</>}
          </button>
        </div>
      </div>

      {/* New Key Display */}
      {showNewKey && (
        <div className="card p-6 bg-success-50 border-success-200">
          <h3 className="text-lg font-semibold text-success-800 mb-4">New API Key Created</h3>
          <p className="text-sm text-success-700 mb-4">
            Save your secret key now. You won&apos;t be able to see it again!
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-success-700">Public Key</label>
              <div className="flex items-center mt-1">
                <code className="flex-1 bg-white p-2 rounded border font-mono text-sm">{showNewKey.public}</code>
                <button onClick={() => copyToClipboard(showNewKey.public, 'new-public')} className="ml-2 p-2">
                  {copiedKey === 'new-public' ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-success-700">Secret Key</label>
              <div className="flex items-center mt-1">
                <code className="flex-1 bg-white p-2 rounded border font-mono text-sm">{showNewKey.secret}</code>
                <button onClick={() => copyToClipboard(showNewKey.secret, 'new-secret')} className="ml-2 p-2">
                  {copiedKey === 'new-secret' ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={() => setShowNewKey(null)} className="btn-secondary mt-4">
            Done
          </button>
        </div>
      )}

      {/* API Keys List */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your API Keys</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : apiKeys.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Key className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{key.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-sm text-gray-500 font-mono">{key.public_key}</code>
                      <button onClick={() => copyToClipboard(key.public_key, key.id)} className="p-1">
                        {copiedKey === key.id ? <Check className="h-3 w-3 text-success-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`badge ${key.is_active ? 'badge-success' : 'badge-gray'}`}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-danger-600 hover:text-danger-700 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No API keys created yet</p>
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Usage</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100">
{`// Check subscription access
curl -X POST https://your-app.com/api/v1/access/check \\
  -H "Authorization: Bearer YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_id": "product-uuid",
    "customer_phone": "+211912345678"
  }'`}
          </pre>
        </div>
      </div>
    </div>
  );
}
