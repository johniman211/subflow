'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, Trash2, Loader2, Repeat, Download, CheckCircle } from 'lucide-react';
import { BILLING_CYCLES, SUPPORTED_CURRENCIES, PRODUCT_TYPES } from '@/lib/constants';

type ProductType = 'subscription' | 'digital_product' | 'one_time';

interface PriceForm {
  name: string;
  amount: string;
  currency: 'SSP' | 'USD';
  billing_cycle: 'one_time' | 'monthly' | 'yearly';
  trial_days: string;
  grace_period_days: string;
}

const productTypeIcons = {
  subscription: Repeat,
  digital_product: Download,
  one_time: CheckCircle,
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'type' | 'details'>('type');
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    product_type: 'subscription' as ProductType,
  });
  
  const [prices, setPrices] = useState<PriceForm[]>([
    {
      name: 'Standard',
      amount: '',
      currency: 'SSP',
      billing_cycle: 'monthly',
      trial_days: '0',
      grace_period_days: '3',
    },
  ]);

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
      },
    ]);
  };

  const removePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const updatePrice = (index: number, field: keyof PriceForm, value: string) => {
    const updated = [...prices];
    updated[index] = { ...updated[index], [field]: value };
    setPrices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('You must be logged in: ' + (authError?.message || 'No user'));
        setLoading(false);
        return;
      }

      console.log('Creating product for user:', user.id);

      // Create product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          merchant_id: user.id,
          name: product.name,
          description: product.description,
          product_type: product.product_type,
        })
        .select()
        .single();

      if (productError) {
        console.error('Product creation error:', productError);
        setError('Product error: ' + productError.message);
        setLoading(false);
        return;
      }

      console.log('Product created:', productData);

      // Create prices
      const pricesData = prices.map((price) => ({
        product_id: productData.id,
        name: price.name,
        amount: parseFloat(price.amount),
        currency: price.currency,
        billing_cycle: price.billing_cycle,
        trial_days: parseInt(price.trial_days),
        grace_period_days: parseInt(price.grace_period_days),
      }));

      const { error: pricesError } = await supabase.from('prices').insert(pricesData);

      if (pricesError) {
        console.error('Prices creation error:', pricesError);
        setError('Prices error: ' + pricesError.message);
        setLoading(false);
        return;
      }

      router.push('/dashboard/products');
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError('Unexpected error: ' + err.message);
      setLoading(false);
    }
  };

  const handleProductTypeSelect = (type: ProductType) => {
    setProduct({ ...product, product_type: type });
    // Set default billing cycle based on product type
    const defaultCycle = type === 'subscription' ? 'monthly' : 'one_time';
    setPrices(prices.map(p => ({ ...p, billing_cycle: defaultCycle })));
    setStep('details');
  };

  const getAvailableBillingCycles = () => {
    if (product.product_type === 'subscription') {
      return BILLING_CYCLES.filter(bc => bc.value !== 'one_time');
    }
    return BILLING_CYCLES.filter(bc => bc.value === 'one_time');
  };

  // Step 1: Select Product Type
  if (step === 'type') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/products" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-gray-600 mb-8">What type of product do you want to create?</p>

          <div className="grid gap-4">
            {PRODUCT_TYPES.map((type) => {
              const Icon = productTypeIcons[type.value as ProductType];
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleProductTypeSelect(type.value as ProductType)}
                  className="flex items-start gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{type.label}</h3>
                    <p className="text-gray-600 mt-1">{type.description}</p>
                    <div className="flex gap-2 mt-3">
                      {type.billingCycles.map(cycle => (
                        <span key={cycle} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {cycle === 'one_time' ? 'One-time' : cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Product Details
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => setStep('type')} 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Product Type
        </button>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          {(() => {
            const Icon = productTypeIcons[product.product_type];
            return (
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
            );
          })()}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {PRODUCT_TYPES.find(t => t.value === product.product_type)?.label}
            </h1>
            <p className="text-sm text-gray-500">
              {PRODUCT_TYPES.find(t => t.value === product.product_type)?.description}
            </p>
          </div>
        </div>

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
                placeholder={
                  product.product_type === 'subscription' ? 'e.g., Gym Membership, Online Course' :
                  product.product_type === 'digital_product' ? 'e.g., E-book, Design Template' :
                  'e.g., Premium Software License'
                }
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
                placeholder="Describe your product..."
              />
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
                  <span className="font-medium text-gray-700">Plan {index + 1}</span>
                  {prices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrice(index)}
                      className="text-danger-600 hover:text-danger-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Plan Name</label>
                    <input
                      type="text"
                      value={price.name}
                      onChange={(e) => updatePrice(index, 'name', e.target.value)}
                      className="input mt-1"
                      placeholder="e.g., Basic, Pro"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Billing Cycle</label>
                    <select
                      value={price.billing_cycle}
                      onChange={(e) => updatePrice(index, 'billing_cycle', e.target.value)}
                      className="input mt-1"
                    >
                      {getAvailableBillingCycles().map((bc) => (
                        <option key={bc.value} value={bc.value}>{bc.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      value={price.amount}
                      onChange={(e) => updatePrice(index, 'amount', e.target.value)}
                      className="input mt-1"
                      placeholder="0.00"
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
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>{currency}</option>
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
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <Link href="/dashboard/products" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
