'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CURRENCIES, BILLING_CYCLES } from '@/lib/constants';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Price {
  id?: string;
  name: string;
  amount: string;
  currency: 'SSP' | 'USD';
  billing_cycle: 'one_time' | 'monthly' | 'yearly';
  trial_days: string;
  grace_period_days: string;
  is_new?: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [prices, setPrices] = useState<Price[]>([]);
  const [deletedPriceIds, setDeletedPriceIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    const supabase = createClient();
    
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*, prices(*)')
      .eq('id', productId)
      .single();

    if (productError || !productData) {
      setError('Product not found');
      setLoading(false);
      return;
    }

    setProduct({
      name: productData.name,
      description: productData.description || '',
      is_active: productData.is_active,
    });

    setPrices(
      productData.prices?.map((p: any) => ({
        id: p.id,
        name: p.name,
        amount: p.amount.toString(),
        currency: p.currency,
        billing_cycle: p.billing_cycle,
        trial_days: p.trial_days.toString(),
        grace_period_days: p.grace_period_days.toString(),
      })) || []
    );

    setLoading(false);
  };

  const addPrice = () => {
    setPrices([
      ...prices,
      {
        name: '',
        amount: '',
        currency: 'SSP',
        billing_cycle: 'monthly',
        trial_days: '0',
        grace_period_days: '3',
        is_new: true,
      },
    ]);
  };

  const removePrice = (index: number) => {
    const price = prices[index];
    if (price.id) {
      setDeletedPriceIds([...deletedPriceIds, price.id]);
    }
    setPrices(prices.filter((_, i) => i !== index));
  };

  const updatePrice = (index: number, field: keyof Price, value: string) => {
    const updated = [...prices];
    updated[index] = { ...updated[index], [field]: value };
    setPrices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const supabase = createClient();

      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          is_active: product.is_active,
        })
        .eq('id', productId);

      if (productError) {
        console.error('Product update error:', productError);
        setError('Product error: ' + productError.message);
        setSaving(false);
        return;
      }

      // Delete removed prices
      if (deletedPriceIds.length > 0) {
        await supabase.from('prices').delete().in('id', deletedPriceIds);
      }

      // Update existing prices and insert new ones
      for (const price of prices) {
        if (price.is_new) {
          await supabase.from('prices').insert({
            product_id: productId,
            name: price.name,
            amount: parseFloat(price.amount),
            currency: price.currency,
            billing_cycle: price.billing_cycle,
            trial_days: parseInt(price.trial_days),
            grace_period_days: parseInt(price.grace_period_days),
          });
        } else if (price.id) {
          await supabase
            .from('prices')
            .update({
              name: price.name,
              amount: parseFloat(price.amount),
              currency: price.currency,
              billing_cycle: price.billing_cycle,
              trial_days: parseInt(price.trial_days),
              grace_period_days: parseInt(price.grace_period_days),
            })
            .eq('id', price.id);
        }
      }

      router.push('/dashboard/products');
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError('Unexpected error: ' + err.message);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      const supabase = createClient();

      // Delete product (prices will cascade delete due to foreign key)
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        setError('Delete error: ' + deleteError.message);
        setDeleting(false);
        return;
      }

      router.push('/dashboard/products');
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError('Unexpected error: ' + err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/products" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Product Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
            
            <div>
              <label htmlFor="name" className="label">Product Name</label>
              <input
                id="name"
                type="text"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="input mt-1 min-h-[100px]"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={product.is_active}
                onChange={(e) => setProduct({ ...product, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 rounded border-gray-300"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Product is active
              </label>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pricing Plans</h2>
              <button type="button" onClick={addPrice} className="btn-secondary btn-sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Plan
              </button>
            </div>

            {prices.map((price, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Plan {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePrice(index)}
                    className="text-danger-600 hover:text-danger-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Plan Name</label>
                    <input
                      type="text"
                      value={price.name}
                      onChange={(e) => updatePrice(index, 'name', e.target.value)}
                      className="input mt-1"
                      placeholder="e.g., Basic, Pro, Enterprise"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      value={price.amount}
                      onChange={(e) => updatePrice(index, 'amount', e.target.value)}
                      className="input mt-1"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Currency</label>
                    <select
                      value={price.currency}
                      onChange={(e) => updatePrice(index, 'currency', e.target.value)}
                      className="input mt-1"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Billing Cycle</label>
                    <select
                      value={price.billing_cycle}
                      onChange={(e) => updatePrice(index, 'billing_cycle', e.target.value)}
                      className="input mt-1"
                    >
                      {BILLING_CYCLES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Trial Days</label>
                    <input
                      type="number"
                      value={price.trial_days}
                      onChange={(e) => updatePrice(index, 'trial_days', e.target.value)}
                      className="input mt-1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Grace Period (days)</label>
                    <input
                      type="number"
                      value={price.grace_period_days}
                      onChange={(e) => updatePrice(index, 'grace_period_days', e.target.value)}
                      className="input mt-1"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}

            {prices.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No pricing plans. Click &quot;Add Plan&quot; to create one.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-danger-600 hover:text-danger-700 text-sm font-medium"
            >
              Delete Product
            </button>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/products" className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{product.name}&quot;? This will also delete all pricing plans and cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-primary bg-danger-600 hover:bg-danger-700"
              >
                {deleting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
