'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WEBHOOK_EVENTS } from '@/lib/constants';
import { Webhook, Plus, Trash2, Loader2, Lock, Zap } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useBilling } from '@/contexts/BillingContext';

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { plan, setShowUpgradeModal } = useBilling();
  
  const hasWebhookAccess = plan?.limits?.webhooks === true;
  
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
  });

  useEffect(() => {
    if (hasWebhookAccess) {
      fetchWebhooks();
    } else {
      setLoading(false);
    }
  }, [hasWebhookAccess]);

  const fetchWebhooks = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });
    setWebhooks(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newWebhook.url || newWebhook.events.length === 0) return;
    setCreating(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('webhooks').insert({
      merchant_id: user?.id,
      url: newWebhook.url,
      events: newWebhook.events,
      secret: nanoid(32),
    });

    if (error) {
      alert('Error creating webhook: ' + error.message);
    } else {
      setNewWebhook({ url: '', events: [] });
      setShowForm(false);
      fetchWebhooks();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    const supabase = createClient();
    await supabase.from('webhooks').delete().eq('id', id);
    fetchWebhooks();
  };

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  // Show upgrade prompt for free plan users
  if (!hasWebhookAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
          <p className="text-gray-600 dark:text-dark-400 mt-1">Receive real-time event notifications</p>
        </div>

        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Webhooks are a Pro Feature</h2>
          <p className="text-gray-600 dark:text-dark-400 mb-6 max-w-md mx-auto">
            Upgrade to Pro to receive real-time notifications when payments are made, 
            subscriptions change, and more.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600"
          >
            <Zap className="h-5 w-5" />
            Upgrade to Pro
          </button>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What you get with Pro webhooks:</h3>
            <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-2">
              <li>✓ Real-time payment notifications</li>
              <li>✓ Subscription lifecycle events</li>
              <li>✓ Automatic retry on failure</li>
              <li>✓ Secure signature verification</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
          <p className="text-gray-600 dark:text-dark-400 mt-1">Receive real-time event notifications</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-5 w-5 mr-2" /> Add Webhook
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Webhook</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Endpoint URL</label>
              <input
                type="url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                className="input mt-1"
                placeholder="https://your-app.com/webhooks"
              />
            </div>
            <div>
              <label className="label">Events</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <label key={event} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded border-gray-300 text-primary-600"
                    />
                    <span className="text-sm text-gray-700">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleCreate} disabled={creating} className="btn-primary">
                {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : webhooks.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{webhook.url}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {webhook.events.length} events subscribed
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`badge ${webhook.is_active ? 'badge-success' : 'badge-gray'}`}>
                    {webhook.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => handleDelete(webhook.id)} className="text-danger-600 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Webhook className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No webhooks configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
