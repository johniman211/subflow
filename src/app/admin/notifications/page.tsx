'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus, 
  Settings2, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  TestTube,
  Trash2,
  RefreshCw,
  Bell,
  History,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  PROVIDER_CREDENTIALS, 
  PROVIDER_INFO, 
  type NotificationProvider, 
  type NotificationChannel,
  type ProviderConfig 
} from '@/types/notifications';

export default function AdminNotificationsPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'providers' | 'logs' | 'templates'>('providers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [editingProvider, setEditingProvider] = useState<ProviderConfig | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadProviders();
    loadLogs();
  }, []);

  const loadProviders = async () => {
    const { data } = await supabase
      .from('notification_providers')
      .select('*')
      .order('channel', { ascending: true });
    setProviders(data || []);
    setLoading(false);
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs(data || []);
  };

  const toggleProviderStatus = async (provider: ProviderConfig) => {
    await supabase
      .from('notification_providers')
      .update({ is_active: !provider.is_active })
      .eq('id', provider.id);
    loadProviders();
  };

  const setAsDefault = async (provider: ProviderConfig) => {
    // First, unset all defaults for this channel
    await supabase
      .from('notification_providers')
      .update({ is_default: false })
      .eq('channel', provider.channel);
    
    // Then set this one as default
    await supabase
      .from('notification_providers')
      .update({ is_default: true })
      .eq('id', provider.id);
    
    loadProviders();
  };

  const deleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    await supabase.from('notification_providers').delete().eq('id', id);
    loadProviders();
  };

  const testProvider = async (provider: ProviderConfig) => {
    setTestingProvider(provider.id);
    try {
      const response = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: provider.id }),
      });
      const result = await response.json();
      alert(result.success ? 'Test notification sent!' : `Test failed: ${result.error}`);
    } catch (error) {
      alert('Test failed');
    }
    setTestingProvider(null);
  };

  const channelIcons: Record<NotificationChannel, any> = {
    email: Mail,
    sms: Phone,
    whatsapp: MessageSquare,
  };

  const channelColors: Record<NotificationChannel, string> = {
    email: 'bg-blue-500',
    sms: 'bg-green-500',
    whatsapp: 'bg-emerald-500',
  };

  const getProvidersByChannel = (channel: NotificationChannel) => 
    providers.filter(p => p.channel === channel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notification Settings</h1>
          <p className="text-dark-400 mt-1">Configure notification providers and view delivery logs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lemon-400 text-dark-900 rounded-lg font-medium hover:bg-lemon-300 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Provider
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-800">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'providers'
              ? 'border-lemon-400 text-lemon-400'
              : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          <Settings2 className="h-4 w-4 inline mr-2" />
          Providers
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-lemon-400 text-lemon-400'
              : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          <History className="h-4 w-4 inline mr-2" />
          Delivery Logs
        </button>
      </div>

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-8">
          {/* Email Providers */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Email Providers</h2>
                <p className="text-sm text-dark-400">Send email notifications</p>
              </div>
            </div>
            <div className="grid gap-4">
              {getProvidersByChannel('email').length === 0 ? (
                <div className="bg-dark-800 rounded-xl p-6 text-center">
                  <p className="text-dark-400">No email providers configured</p>
                  <button
                    onClick={() => { setSelectedChannel('email'); setShowAddModal(true); }}
                    className="mt-3 text-lemon-400 hover:text-lemon-300 text-sm"
                  >
                    + Add email provider
                  </button>
                </div>
              ) : (
                getProvidersByChannel('email').map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onToggle={() => toggleProviderStatus(provider)}
                    onSetDefault={() => setAsDefault(provider)}
                    onEdit={() => setEditingProvider(provider)}
                    onDelete={() => deleteProvider(provider.id)}
                    onTest={() => testProvider(provider)}
                    testing={testingProvider === provider.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* SMS Providers */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">SMS Providers</h2>
                <p className="text-sm text-dark-400">Send SMS notifications</p>
              </div>
            </div>
            <div className="grid gap-4">
              {getProvidersByChannel('sms').length === 0 ? (
                <div className="bg-dark-800 rounded-xl p-6 text-center">
                  <p className="text-dark-400">No SMS providers configured</p>
                  <button
                    onClick={() => { setSelectedChannel('sms'); setShowAddModal(true); }}
                    className="mt-3 text-lemon-400 hover:text-lemon-300 text-sm"
                  >
                    + Add SMS provider
                  </button>
                </div>
              ) : (
                getProvidersByChannel('sms').map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onToggle={() => toggleProviderStatus(provider)}
                    onSetDefault={() => setAsDefault(provider)}
                    onEdit={() => setEditingProvider(provider)}
                    onDelete={() => deleteProvider(provider.id)}
                    onTest={() => testProvider(provider)}
                    testing={testingProvider === provider.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* WhatsApp Providers */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">WhatsApp Providers</h2>
                <p className="text-sm text-dark-400">Send WhatsApp notifications</p>
              </div>
            </div>
            <div className="grid gap-4">
              {getProvidersByChannel('whatsapp').length === 0 ? (
                <div className="bg-dark-800 rounded-xl p-6 text-center">
                  <p className="text-dark-400">No WhatsApp providers configured</p>
                  <button
                    onClick={() => { setSelectedChannel('whatsapp'); setShowAddModal(true); }}
                    className="mt-3 text-lemon-400 hover:text-lemon-300 text-sm"
                  >
                    + Add WhatsApp provider
                  </button>
                </div>
              ) : (
                getProvidersByChannel('whatsapp').map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onToggle={() => toggleProviderStatus(provider)}
                    onSetDefault={() => setAsDefault(provider)}
                    onEdit={() => setEditingProvider(provider)}
                    onDelete={() => deleteProvider(provider.id)}
                    onTest={() => testProvider(provider)}
                    testing={testingProvider === provider.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-dark-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-dark-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Notifications</h3>
            <button
              onClick={loadLogs}
              className="text-dark-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-dark-400">
                      No notification logs yet
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-dark-700/50">
                      <td className="px-4 py-3">
                        {log.status === 'sent' || log.status === 'delivered' ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            {log.status}
                          </span>
                        ) : log.status === 'failed' ? (
                          <span className="flex items-center gap-1 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            failed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Clock className="h-4 w-4" />
                            {log.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.channel === 'email' ? 'bg-blue-500/20 text-blue-400' :
                          log.channel === 'sms' ? 'bg-green-500/20 text-green-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">{log.recipient}</td>
                      <td className="px-4 py-3 text-dark-300 text-sm">{log.event_type}</td>
                      <td className="px-4 py-3 text-dark-400 text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAddModal && (
        <AddProviderModal
          channel={selectedChannel}
          onClose={() => { setShowAddModal(false); setSelectedChannel(null); }}
          onSave={() => { loadProviders(); setShowAddModal(false); setSelectedChannel(null); }}
        />
      )}

      {/* Edit Provider Modal */}
      {editingProvider && (
        <EditProviderModal
          provider={editingProvider}
          onClose={() => setEditingProvider(null)}
          onSave={() => { loadProviders(); setEditingProvider(null); }}
        />
      )}
    </div>
  );
}

// Provider Card Component
function ProviderCard({ 
  provider, 
  onToggle, 
  onSetDefault, 
  onEdit, 
  onDelete, 
  onTest,
  testing 
}: {
  provider: ProviderConfig;
  onToggle: () => void;
  onSetDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  testing: boolean;
}) {
  const info = PROVIDER_INFO[provider.provider as NotificationProvider];

  return (
    <div className={`bg-dark-800 rounded-xl p-4 border ${provider.is_active ? 'border-dark-700' : 'border-dark-800 opacity-60'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            provider.channel === 'email' ? 'bg-blue-500/20' :
            provider.channel === 'sms' ? 'bg-green-500/20' :
            'bg-emerald-500/20'
          }`}>
            {provider.channel === 'email' ? <Mail className="h-6 w-6 text-blue-400" /> :
             provider.channel === 'sms' ? <Phone className="h-6 w-6 text-green-400" /> :
             <MessageSquare className="h-6 w-6 text-emerald-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{info?.name || provider.provider}</h3>
              {provider.is_default && (
                <span className="px-2 py-0.5 bg-lemon-400/20 text-lemon-400 text-xs rounded-full">
                  Default
                </span>
              )}
              {provider.is_active ? (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-dark-700 text-dark-400 text-xs rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-dark-400">{info?.description || 'Notification provider'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTest}
            disabled={testing || !provider.is_active}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
            title="Test"
          >
            {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
          </button>
          {!provider.is_default && provider.is_active && (
            <button
              onClick={onSetDefault}
              className="p-2 text-dark-400 hover:text-lemon-400 hover:bg-dark-700 rounded-lg transition-colors"
              title="Set as default"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              provider.is_active 
                ? 'text-green-400 hover:text-red-400 hover:bg-dark-700' 
                : 'text-dark-400 hover:text-green-400 hover:bg-dark-700'
            }`}
            title={provider.is_active ? 'Disable' : 'Enable'}
          >
            {provider.is_active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Provider Modal
function AddProviderModal({ 
  channel, 
  onClose, 
  onSave 
}: { 
  channel: NotificationChannel | null; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [step, setStep] = useState<'channel' | 'provider' | 'credentials'>(channel ? 'provider' : 'channel');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(channel);
  const [selectedProvider, setSelectedProvider] = useState<NotificationProvider | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const emailProviders: NotificationProvider[] = ['resend', 'sendgrid', 'mailgun', 'smtp'];
  const smsProviders: NotificationProvider[] = ['twilio', 'africastalking', 'termii'];
  const whatsappProviders: NotificationProvider[] = ['whatsapp_business', 'twilio_whatsapp', 'africastalking_whatsapp'];

  const getProvidersForChannel = () => {
    switch (selectedChannel) {
      case 'email': return emailProviders;
      case 'sms': return smsProviders;
      case 'whatsapp': return whatsappProviders;
      default: return [];
    }
  };

  const handleSave = async () => {
    if (!selectedChannel || !selectedProvider) return;
    
    setSaving(true);
    const { error } = await supabase.from('notification_providers').insert({
      channel: selectedChannel,
      provider: selectedProvider,
      name: PROVIDER_INFO[selectedProvider].name,
      description: PROVIDER_INFO[selectedProvider].description,
      credentials,
      is_active: false,
      is_default: false,
    });

    if (error) {
      alert('Error saving provider: ' + error.message);
    } else {
      onSave();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add Notification Provider</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Select Channel */}
          {step === 'channel' && (
            <div className="space-y-4">
              <p className="text-dark-400 mb-4">Select notification channel:</p>
              {(['email', 'sms', 'whatsapp'] as NotificationChannel[]).map(ch => (
                <button
                  key={ch}
                  onClick={() => { setSelectedChannel(ch); setStep('provider'); }}
                  className="w-full flex items-center gap-4 p-4 bg-dark-700 hover:bg-dark-600 rounded-xl transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    ch === 'email' ? 'bg-blue-500/20' :
                    ch === 'sms' ? 'bg-green-500/20' :
                    'bg-emerald-500/20'
                  }`}>
                    {ch === 'email' ? <Mail className="h-6 w-6 text-blue-400" /> :
                     ch === 'sms' ? <Phone className="h-6 w-6 text-green-400" /> :
                     <MessageSquare className="h-6 w-6 text-emerald-400" />}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white capitalize">{ch}</p>
                    <p className="text-sm text-dark-400">
                      {ch === 'email' ? 'Send email notifications' :
                       ch === 'sms' ? 'Send SMS messages' :
                       'Send WhatsApp messages'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Provider */}
          {step === 'provider' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('channel')}
                className="text-dark-400 hover:text-white text-sm mb-4"
              >
                ← Back to channels
              </button>
              <p className="text-dark-400 mb-4">Select {selectedChannel} provider:</p>
              {getProvidersForChannel().map(prov => {
                const info = PROVIDER_INFO[prov];
                return (
                  <button
                    key={prov}
                    onClick={() => { setSelectedProvider(prov); setStep('credentials'); }}
                    className="w-full flex items-center gap-4 p-4 bg-dark-700 hover:bg-dark-600 rounded-xl transition-colors"
                  >
                    <div className="text-left flex-1">
                      <p className="font-semibold text-white">{info.name}</p>
                      <p className="text-sm text-dark-400">{info.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Enter Credentials */}
          {step === 'credentials' && selectedProvider && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('provider')}
                className="text-dark-400 hover:text-white text-sm mb-4"
              >
                ← Back to providers
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedChannel === 'email' ? 'bg-blue-500/20' :
                  selectedChannel === 'sms' ? 'bg-green-500/20' :
                  'bg-emerald-500/20'
                }`}>
                  {selectedChannel === 'email' ? <Mail className="h-5 w-5 text-blue-400" /> :
                   selectedChannel === 'sms' ? <Phone className="h-5 w-5 text-green-400" /> :
                   <MessageSquare className="h-5 w-5 text-emerald-400" />}
                </div>
                <div>
                  <p className="font-semibold text-white">{PROVIDER_INFO[selectedProvider].name}</p>
                  <p className="text-sm text-dark-400">Enter API credentials</p>
                </div>
              </div>

              {PROVIDER_CREDENTIALS[selectedProvider].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                      value={credentials[field.key] || ''}
                      onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-lemon-400"
                      required={field.required}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, [field.key]: !showPasswords[field.key] })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                      >
                        {showPasswords[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {step === 'credentials' && (
          <div className="p-6 border-t border-dark-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-lemon-400 text-dark-900 rounded-lg font-medium hover:bg-lemon-300 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Provider'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Edit Provider Modal
function EditProviderModal({ 
  provider, 
  onClose, 
  onSave 
}: { 
  provider: ProviderConfig; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [credentials, setCredentials] = useState<Record<string, string>>(provider.credentials || {});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const info = PROVIDER_INFO[provider.provider as NotificationProvider];
  const fields = PROVIDER_CREDENTIALS[provider.provider as NotificationProvider];

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('notification_providers')
      .update({ credentials, updated_at: new Date().toISOString() })
      .eq('id', provider.id);

    if (error) {
      alert('Error updating provider: ' + error.message);
    } else {
      onSave();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              provider.channel === 'email' ? 'bg-blue-500/20' :
              provider.channel === 'sms' ? 'bg-green-500/20' :
              'bg-emerald-500/20'
            }`}>
              {provider.channel === 'email' ? <Mail className="h-5 w-5 text-blue-400" /> :
               provider.channel === 'sms' ? <Phone className="h-5 w-5 text-green-400" /> :
               <MessageSquare className="h-5 w-5 text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{info?.name}</h2>
              <p className="text-sm text-dark-400">Edit credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="text-dark-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <input
                  type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                  value={credentials[field.key] || ''}
                  onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-lemon-400"
                  required={field.required}
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, [field.key]: !showPasswords[field.key] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                  >
                    {showPasswords[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-dark-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-lemon-400 text-dark-900 rounded-lg font-medium hover:bg-lemon-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
