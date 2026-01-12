'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Loader2, Check, X, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: any;
  is_active: boolean;
  is_featured: boolean;
  trial_days: number;
  sort_order: number;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('platform_plans')
      .select('*')
      .order('sort_order');
    
    const formattedPlans = data?.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      limits: typeof p.limits === 'string' ? JSON.parse(p.limits) : p.limits,
    })) || [];
    
    setPlans(formattedPlans);
    setLoading(false);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan({
      id: '',
      name: '',
      slug: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'USD',
      features: [],
      limits: { max_subscribers: 50, api_access: false, webhooks: false },
      is_active: true,
      is_featured: false,
      trial_days: 0,
      sort_order: plans.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(true);

    const supabase = createClient();
    const planData = {
      name: editingPlan.name,
      slug: editingPlan.slug || editingPlan.name.toLowerCase().replace(/\s+/g, '-'),
      description: editingPlan.description,
      price_monthly: editingPlan.price_monthly,
      price_yearly: editingPlan.price_yearly,
      currency: editingPlan.currency,
      features: editingPlan.features,
      limits: editingPlan.limits,
      is_active: editingPlan.is_active,
      is_featured: editingPlan.is_featured,
      trial_days: editingPlan.trial_days,
      sort_order: editingPlan.sort_order,
      updated_at: new Date().toISOString(),
    };

    if (editingPlan.id) {
      await supabase.from('platform_plans').update(planData).eq('id', editingPlan.id);
    } else {
      await supabase.from('platform_plans').insert(planData);
    }

    setIsModalOpen(false);
    setEditingPlan(null);
    setSaving(false);
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    const supabase = createClient();
    await supabase.from('platform_plans').delete().eq('id', id);
    fetchPlans();
  };

  const updateFeature = (index: number, value: string) => {
    if (!editingPlan) return;
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = value;
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const addFeature = () => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ''] });
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    const newFeatures = editingPlan.features.filter((_, i) => i !== index);
    setEditingPlan({ ...editingPlan, features: newFeatures });
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
          <h1 className="text-2xl font-bold text-gray-900">Platform Plans</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border-2 p-6 relative ${
              plan.is_featured ? 'border-amber-500' : 'border-gray-200'
            }`}
          >
            {plan.is_featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  FEATURED
                </span>
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {plan.slug !== 'free' && (
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-black text-gray-900">
                ${plan.price_monthly}
              </span>
              <span className="text-gray-500">/mo</span>
              {plan.price_yearly > 0 && (
                <p className="text-sm text-gray-500">${plan.price_yearly}/year</p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase">Features</p>
              {plan.features?.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Max Subscribers: {plan.limits?.max_subscribers === -1 ? 'Unlimited' : plan.limits?.max_subscribers || 50}
              </p>
              <p className="text-xs text-gray-500">
                API Access: {plan.limits?.api_access ? 'Yes' : 'No'}
              </p>
              {plan.trial_days > 0 && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  {plan.trial_days} day free trial
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingPlan.id ? 'Edit Plan' : 'Create Plan'}
                </h2>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                      <input
                        type="text"
                        value={editingPlan.slug}
                        onChange={(e) => setEditingPlan({ ...editingPlan, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        placeholder="auto-generated if empty"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={editingPlan.description}
                      onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
                      <input
                        type="number"
                        value={editingPlan.price_monthly}
                        onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price ($)</label>
                      <input
                        type="number"
                        value={editingPlan.price_yearly}
                        onChange={(e) => setEditingPlan({ ...editingPlan, price_yearly: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
                      <input
                        type="number"
                        value={editingPlan.trial_days}
                        onChange={(e) => setEditingPlan({ ...editingPlan, trial_days: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Subscribers (-1 for unlimited)</label>
                      <input
                        type="number"
                        value={editingPlan.limits?.max_subscribers ?? 50}
                        onChange={(e) => setEditingPlan({ 
                          ...editingPlan, 
                          limits: { ...editingPlan.limits, max_subscribers: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPlan.limits?.api_access || false}
                          onChange={(e) => setEditingPlan({ 
                            ...editingPlan, 
                            limits: { ...editingPlan.limits, api_access: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">API Access</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPlan.limits?.webhooks || false}
                          onChange={(e) => setEditingPlan({ 
                            ...editingPlan, 
                            limits: { ...editingPlan.limits, webhooks: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Webhooks</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    {editingPlan.features?.map((feature, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(i, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                        <button
                          onClick={() => removeFeature(i)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="text-sm text-amber-600 hover:text-amber-700"
                    >
                      + Add Feature
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingPlan.is_active}
                        onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingPlan.is_featured}
                        onChange={(e) => setEditingPlan({ ...editingPlan, is_featured: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
