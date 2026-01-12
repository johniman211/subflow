'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customer_phone: '',
    customer_email: '',
    customer_name: '',
    currency: 'SSP',
    due_date: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, prices(id, name, amount, currency)')
      .eq('is_active', true);
    setProducts(data || []);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unit_price: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'sent') => {
    e.preventDefault();
    if (!formData.customer_phone) return;

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from('invoices').insert({
      merchant_id: user?.id,
      invoice_number: invoiceNumber,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email || null,
      customer_name: formData.customer_name || null,
      items: lineItems.filter((item) => item.description && item.unit_price > 0),
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      currency: formData.currency,
      status,
      due_date: formData.due_date || null,
      notes: formData.notes || null,
    });

    if (error) {
      alert('Error creating invoice: ' + error.message);
      setSaving(false);
    } else {
      router.push('/dashboard/invoices');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/invoices" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">Generate a new invoice for your customer</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'draft')}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Details */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="input mt-1"
                  placeholder="+211 9XX XXX XXX"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="input mt-1"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="input mt-1"
                  placeholder="Customer name"
                />
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="input mt-1"
                >
                  <option value="SSP">SSP - South Sudanese Pound</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input mt-1"
                  rows={3}
                  placeholder="Payment instructions, terms, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button type="button" onClick={addLineItem} className="btn-secondary text-sm">
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    className="input"
                    placeholder="Description"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="input text-center"
                    placeholder="Qty"
                    min="1"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="Price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, formData.currency as 'SSP' | 'USD')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal, formData.currency as 'SSP' | 'USD')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/dashboard/invoices" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-secondary">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'sent')}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create & Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
