'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Check, X, Loader2 } from 'lucide-react';

interface PaymentConfirmButtonProps {
  paymentId: string;
}

export function PaymentConfirmButton({ paymentId }: PaymentConfirmButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use API endpoint to confirm payment and trigger webhooks
    const response = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        confirmedBy: user?.id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert('Error confirming payment: ' + result.error);
      setLoading(false);
      return;
    }

    router.refresh();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        rejection_reason: rejectReason,
      })
      .eq('id', paymentId);

    if (error) {
      alert('Error rejecting payment: ' + error.message);
      setLoading(false);
      return;
    }

    router.refresh();
  };

  if (showReject) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="input text-sm py-1 px-2 w-32"
          placeholder="Reason..."
        />
        <button
          onClick={handleReject}
          disabled={loading}
          className="btn-danger btn-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
        </button>
        <button
          onClick={() => setShowReject(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="btn-success btn-sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Confirm</>}
      </button>
      <button
        onClick={() => setShowReject(true)}
        className="text-danger-600 hover:text-danger-700 text-sm"
      >
        Reject
      </button>
    </div>
  );
}
