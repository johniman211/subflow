'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Download, Send, ArrowLeft, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_phone: string;
  customer_email: string | null;
  customer_name: string | null;
  items: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'void';
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      router.push('/dashboard/invoices');
      return;
    }

    setInvoice(data);
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    if (!invoice) return;
    setUpdating(true);

    const supabase = createClient();
    const updateData: any = { status: newStatus };
    
    if (newStatus === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoice.id);

    if (!error) {
      setInvoice({ ...invoice, ...updateData });
    }
    setUpdating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'sent': return <Clock className="h-5 w-5 text-amber-600" />;
      case 'void': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-amber-100 text-amber-800';
      case 'void': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/dashboard/invoices" className="btn-primary mt-4">
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
            <p className="text-gray-600 mt-1">Created {formatDate(invoice.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <button
              onClick={() => updateStatus('sent')}
              disabled={updating}
              className="btn-primary"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Invoice
            </button>
          )}
          {invoice.status === 'sent' && (
            <button
              onClick={() => updateStatus('paid')}
              disabled={updating}
              className="btn-success"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Mark as Paid
            </button>
          )}
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="card p-6 sm:p-8">
        {/* Status Banner */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 ${getStatusColor(invoice.status)}`}>
          {getStatusIcon(invoice.status)}
          <span className="font-medium capitalize">{invoice.status}</span>
          {invoice.paid_at && (
            <span className="text-sm ml-2">• Paid on {formatDate(invoice.paid_at)}</span>
          )}
        </div>

        {/* Invoice Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
            <p className="text-lg font-semibold text-gray-900">{invoice.customer_name || 'Unnamed Customer'}</p>
            <p className="text-gray-600">{invoice.customer_phone}</p>
            {invoice.customer_email && (
              <p className="text-gray-600">{invoice.customer_email}</p>
            )}
          </div>
          <div className="text-left md:text-right">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice Details</h3>
            <p className="text-gray-900"><span className="font-medium">Invoice #:</span> {invoice.invoice_number}</p>
            <p className="text-gray-900"><span className="font-medium">Date:</span> {formatDate(invoice.created_at)}</p>
            {invoice.due_date && (
              <p className="text-gray-900"><span className="font-medium">Due:</span> {formatDate(invoice.due_date)}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items?.map((item: LineItem, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.unit_price, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.quantity * item.unit_price, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discount, invoice.currency)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
