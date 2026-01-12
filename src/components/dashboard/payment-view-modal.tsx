'use client';

import { useState } from 'react';
import { X, Eye, Phone, Mail, CreditCard, Calendar, Hash, FileText, CheckCircle, Clock, Image } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Payment {
  id: string;
  customer_phone: string;
  customer_email?: string;
  reference_code: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  transaction_id?: string;
  proof_url?: string;
  created_at: string;
  matched_at?: string;
  confirmed_at?: string;
  expires_at: string;
  prices?: {
    name: string;
    products?: {
      name: string;
    };
  };
}

export function PaymentViewModal({ payment }: { payment: Payment }) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700"><CheckCircle className="h-3 w-3" /> Confirmed</span>;
      case 'matched':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"><Clock className="h-3 w-3" /> Matched</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700"><Clock className="h-3 w-3" /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center gap-1"
      >
        <Eye className="h-4 w-4" />
        View
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity" 
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-xl flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Payment Receipt</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Reference Code */}
                <div className="text-center pb-4 border-b border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference Code</p>
                  <p className="text-2xl font-bold font-mono text-gray-900">{payment.reference_code}</p>
                  <div className="mt-2">{getStatusBadge(payment.status)}</div>
                </div>

                {/* Amount */}
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Customer Phone</p>
                      <p className="text-sm font-medium text-gray-900">{payment.customer_phone}</p>
                    </div>
                  </div>

                  {payment.customer_email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Customer Email</p>
                        <p className="text-sm font-medium text-gray-900">{payment.customer_email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Product</p>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.prices?.products?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">{payment.prices?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {payment.transaction_id && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Hash className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Transaction ID / Message</p>
                        <p className="text-sm font-medium text-gray-900 break-all">{payment.transaction_id}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(payment.created_at)}</p>
                    </div>
                  </div>

                  {payment.matched_at && (
                    <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Matched At</p>
                        <p className="text-sm font-medium text-gray-900">{formatDateTime(payment.matched_at)}</p>
                      </div>
                    </div>
                  )}

                  {payment.confirmed_at && (
                    <div className="flex items-center gap-3 p-3 bg-success-50 rounded-lg">
                      <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-success-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Confirmed At</p>
                        <p className="text-sm font-medium text-gray-900">{formatDateTime(payment.confirmed_at)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Proof Image */}
                {payment.proof_url && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Image className="h-3 w-3" /> Payment Proof
                    </p>
                    <a 
                      href={payment.proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={payment.proof_url} 
                        alt="Payment proof" 
                        className="w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
