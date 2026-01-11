'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Search, Download, Upload, Plus, Edit2, Trash2, Loader2, Phone, Mail, Tag } from 'lucide-react';

interface Customer {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  notes: string | null;
  tags: string[];
  total_spent: number;
  payment_count: number;
  first_payment_at: string | null;
  last_payment_at: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    name: '',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('last_payment_at', { ascending: false, nullsFirst: false });
    setCustomers(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.phone) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const customerData = {
      merchant_id: user?.id,
      phone: formData.phone,
      email: formData.email || null,
      name: formData.name || null,
      notes: formData.notes || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    };

    if (editingCustomer) {
      await supabase.from('customers').update(customerData).eq('id', editingCustomer.id);
    } else {
      await supabase.from('customers').insert(customerData);
    }

    setFormData({ phone: '', email: '', name: '', notes: '', tags: '' });
    setShowAddModal(false);
    setEditingCustomer(null);
    setSaving(false);
    fetchCustomers();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      phone: customer.phone,
      email: customer.email || '',
      name: customer.name || '',
      notes: customer.notes || '',
      tags: customer.tags?.join(', ') || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    const supabase = createClient();
    await supabase.from('customers').delete().eq('id', id);
    fetchCustomers();
  };

  const handleExport = () => {
    const csv = [
      ['Phone', 'Email', 'Name', 'Total Spent', 'Payments', 'First Payment', 'Last Payment', 'Tags', 'Notes'],
      ...customers.map(c => [
        c.phone,
        c.email || '',
        c.name || '',
        c.total_spent,
        c.payment_count,
        c.first_payment_at || '',
        c.last_payment_at || '',
        c.tags?.join('; ') || '',
        c.notes || '',
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredCustomers = customers.filter(c =>
    c.phone.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">{customers.length} total customers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
          <button onClick={() => { setShowAddModal(true); setEditingCustomer(null); setFormData({ phone: '', email: '', name: '', notes: '', tags: '' }); }} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-12 w-full"
          placeholder="Search by phone, email, or name..."
        />
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input mt-1"
                  placeholder="+211 9XX XXX XXX"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input mt-1"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input mt-1"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input mt-1"
                  placeholder="vip, enterprise, trial"
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input mt-1"
                  rows={3}
                  placeholder="Internal notes about this customer..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
              </button>
              <button onClick={() => { setShowAddModal(false); setEditingCustomer(null); }} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name || 'Unnamed'}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {customer.phone}
                          </span>
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(customer.total_spent, 'SSP')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {customer.payment_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.last_payment_at ? formatDate(customer.last_payment_at) : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags?.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(customer)} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-danger-50 rounded text-danger-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No customers found</p>
            {searchQuery && <p className="text-sm mt-1">Try a different search term</p>}
          </div>
        )}
      </div>
    </div>
  );
}
