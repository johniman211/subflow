import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { PaymentConfirmButton } from '@/components/dashboard/payment-confirm-button';
import { PaymentViewModal } from '@/components/dashboard/payment-view-modal';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('payments')
    .select('*, prices(name, product_id, products(name))')
    .eq('merchant_id', user?.id)
    .order('created_at', { ascending: false });

  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  const { data: payments } = await query;

  const statusCounts = {
    all: payments?.length || 0,
    pending: payments?.filter((p: any) => p.status === 'pending').length || 0,
    matched: payments?.filter((p: any) => p.status === 'matched').length || 0,
    confirmed: payments?.filter((p: any) => p.status === 'confirmed').length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">View and confirm customer payments</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/dashboard/payments"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !searchParams.status ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({statusCounts.all})
        </a>
        <a
          href="/dashboard/payments?status=pending"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchParams.status === 'pending' ? 'bg-warning-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pending ({statusCounts.pending})
        </a>
        <a
          href="/dashboard/payments?status=matched"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchParams.status === 'matched' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Matched ({statusCounts.matched})
        </a>
        <a
          href="/dashboard/payments?status=confirmed"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            searchParams.status === 'confirmed' ? 'bg-success-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Confirmed ({statusCounts.confirmed})
        </a>
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments && payments.length > 0 ? (
                payments.map((payment: any) => (
                  <tr key={payment.id} className={payment.status === 'matched' ? 'bg-primary-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.customer_phone}</p>
                        {payment.customer_email && (
                          <p className="text-sm text-gray-500">{payment.customer_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {payment.prices?.products?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">{payment.prices?.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {payment.reference_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{payment.payment_method.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PaymentViewModal payment={payment} />
                        {(payment.status === 'pending' || payment.status === 'matched') && (
                          <PaymentConfirmButton paymentId={payment.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
