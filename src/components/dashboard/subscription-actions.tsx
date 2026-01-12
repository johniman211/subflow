'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  MessageCircle, 
  Mail, 
  RefreshCw, 
  MoreVertical,
  Loader2,
  Check,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SubscriptionActionsProps {
  subscriptionId: string;
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  amount: number;
  currency: string;
  status: string;
}

export function SubscriptionActions({
  subscriptionId,
  customerPhone,
  customerEmail,
  productName,
  amount,
  currency,
  status,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendWhatsApp = () => {
    const formattedAmount = formatCurrency(amount, currency);
    const text = encodeURIComponent(
      `Hi! This is a friendly reminder that your subscription for "${productName}" (${formattedAmount}/month) is due for renewal. Please make your payment to continue enjoying our services. Thank you!`
    );
    const phone = customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    setMessage({ type: 'success', text: 'WhatsApp opened' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSendEmail = async () => {
    if (!customerEmail) {
      setMessage({ type: 'error', text: 'No email address' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    const formattedAmount = formatCurrency(amount, currency);
    const subject = encodeURIComponent(`Subscription Renewal Reminder - ${productName}`);
    const body = encodeURIComponent(
      `Dear Customer,\n\nThis is a friendly reminder that your subscription for "${productName}" (${formattedAmount}/month) is due for renewal.\n\nPlease make your payment to continue enjoying our services.\n\nThank you for your continued support!`
    );
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank');
    setMessage({ type: 'success', text: 'Email opened' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRenew = async (days: number) => {
    setLoading(true);
    const supabase = createClient();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('current_period_end')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) {
      setMessage({ type: 'error', text: 'Subscription not found' });
      setLoading(false);
      return;
    }

    // Extend from current end date or from now if expired
    const currentEnd = new Date(subscription.current_period_end);
    const now = new Date();
    const baseDate = currentEnd > now ? currentEnd : now;
    const newEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        current_period_end: newEnd.toISOString(),
        status: 'active',
      })
      .eq('id', subscriptionId);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to renew' });
    } else {
      setMessage({ type: 'success', text: `Extended by ${days} days` });
      router.refresh();
    }
    
    setLoading(false);
    setShowMenu(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to cancel' });
    } else {
      setMessage({ type: 'success', text: 'Subscription cancelled' });
      router.refresh();
    }
    
    setLoading(false);
    setShowMenu(false);
  };

  if (message) {
    return (
      <div className={`flex items-center gap-1 text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
        {message.type === 'success' ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {message.text}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 relative">
      {/* Quick Actions */}
      <button
        onClick={handleSendWhatsApp}
        className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
        title="Send WhatsApp reminder"
      >
        <MessageCircle className="h-4 w-4" />
      </button>
      
      {customerEmail && (
        <button
          onClick={handleSendEmail}
          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          title="Send email reminder"
        >
          <Mail className="h-4 w-4" />
        </button>
      )}

      {/* More Actions Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg z-20">
              <div className="py-1">
                <p className="px-3 py-1 text-xs text-gray-500 dark:text-dark-400 font-medium">Extend Subscription</p>
                <button
                  onClick={() => handleRenew(30)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4 text-green-600" />
                  +30 days (1 month)
                </button>
                <button
                  onClick={() => handleRenew(365)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4 text-green-600" />
                  +365 days (1 year)
                </button>
                <hr className="my-1 border-gray-200 dark:border-dark-700" />
                <button
                  onClick={handleCancel}
                  className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Subscription
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
