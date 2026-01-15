'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { CreditCard, Search, Phone, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Payment {
  id: string;
  customer_phone: string;
  amount: number;
  currency: string;
  status: 'pending' | 'matched' | 'confirmed' | 'rejected' | 'expired';
  reference_code: string;
  created_at: string;
  confirmed_at: string | null;
  price: {
    product: {
      name: string;
    };
  };
}

export default function PaymentsPage() {
  const { theme } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data } = await supabase
      .from('payments')
      .select(`
        id,
        customer_phone,
        amount,
        currency,
        status,
        reference_code,
        created_at,
        confirmed_at,
        price:prices(
          product:products(name)
        )
      `)
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setPayments(data.map(p => ({
        ...p,
        price: p.price as unknown as { product: { name: string } }
      })));
    }

    setLoading(false);
  };

  const filteredPayments = payments.filter(payment =>
    payment.customer_phone.includes(searchQuery) ||
    payment.reference_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmedTotal = payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'matched':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'rejected':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-dark-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
      case 'matched':
        return 'text-amber-500 bg-amber-500/10';
      case 'rejected':
      case 'expired':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-dark-400 bg-dark-500/10';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div>
        <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
          Payments
        </h1>
        <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
          View-only · Manage payments in main dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <p className={cn("text-2xl font-bold text-green-500")}>
            {payments.filter(p => p.status === 'confirmed').length}
          </p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Confirmed</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <p className={cn("text-2xl font-bold text-amber-500")}>
            {payments.filter(p => p.status === 'pending' || p.status === 'matched').length}
          </p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Pending</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <p className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            {payments.length}
          </p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Total</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'
        )}>
          <p className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-purple-700')}>
            {formatAmount(confirmedTotal, 'SSP')}
          </p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-300' : 'text-purple-600')}>Revenue</p>
        </div>
      </div>

      {/* Search */}
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-xl border",
        theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex-1 relative">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
          <input
            type="text"
            placeholder="Search by phone or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg border",
              theme === 'dark' 
                ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-400' 
                : 'bg-gray-50 border-gray-300'
            )}
          />
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <CreditCard className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No payments yet
          </h3>
          <p className={cn("", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Payments from subscribers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border",
                theme === 'dark' 
                  ? 'bg-dark-800 border-dark-700' 
                  : 'bg-white border-gray-200'
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                payment.status === 'confirmed' ? 'bg-green-500/20' : theme === 'dark' ? 'bg-dark-700' : 'bg-gray-200'
              )}>
                <CreditCard className={cn(
                  "h-5 w-5",
                  payment.status === 'confirmed' ? 'text-green-500' : 'text-dark-400'
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {formatAmount(payment.amount, payment.currency)}
                  </p>
                  <span className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                    #{payment.reference_code}
                  </span>
                </div>
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                  {payment.customer_phone} · {payment.price?.product?.name || 'Unknown'}
                </p>
              </div>

              <div className="hidden md:block text-right">
                <p className={cn("text-sm font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {new Date(payment.created_at).toLocaleDateString()}
                </p>
                <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                  {new Date(payment.created_at).toLocaleTimeString()}
                </p>
              </div>

              <span className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize",
                getStatusColor(payment.status)
              )}>
                {getStatusIcon(payment.status)}
                {payment.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
