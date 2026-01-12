'use client';

import { useState, useEffect } from 'react';
import { X, Check, Zap, Crown, Loader2, Upload, CreditCard, Smartphone, Building } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { createClient } from '@/lib/supabase/client';
import { generateBillingReferenceCode, getAdminPaymentInfo } from '@/lib/billing';
import { formatCurrency } from '@/lib/utils';

interface PaymentInfo {
  mtn_momo: { number: string; name: string };
  bank_ssp: { bank_name: string; account_number: string; account_name: string };
  bank_usd: { bank_name: string; account_number: string; account_name: string };
}

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, upgradeReason, plan, refreshBilling } = useBilling();
  const [step, setStep] = useState<'plans' | 'payment' | 'confirm' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('mtn_momo');
  const [referenceCode, setReferenceCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (showUpgradeModal) {
      fetchPlans();
      fetchPaymentInfo();
      setStep('plans');
      setError('');
    }
  }, [showUpgradeModal]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching plans:', error);
    }
    setPlans(data || []);
    setLoadingPlans(false);
  };

  const fetchPaymentInfo = async () => {
    const info = await getAdminPaymentInfo();
    setPaymentInfo(info);
  };

  const handleSelectPlan = (plan: any) => {
    if (plan.slug === 'free') return;
    if (plan.slug === 'enterprise') {
      window.location.href = '/contact';
      return;
    }
    setSelectedPlan(plan);
    setReferenceCode(generateBillingReferenceCode());
    setStep('payment');
  };

  const handleSubmitPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in to continue');
        return;
      }

      let proofUrl = null;
      if (proofFile) {
        const fileName = `billing/${user.id}/${Date.now()}-${proofFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, proofFile);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName);
          proofUrl = urlData.publicUrl;
        }
      }

      const amount = billingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly;

      const { error: paymentError } = await supabase
        .from('platform_payments')
        .insert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          amount,
          currency: selectedPlan.currency,
          payment_method: paymentMethod,
          reference_code: referenceCode,
          transaction_id: transactionId || null,
          proof_url: proofUrl,
          status: transactionId || proofUrl ? 'matched' : 'pending',
          billing_period: billingCycle,
          matched_at: transactionId || proofUrl ? new Date().toISOString() : null,
        });

      if (paymentError) {
        throw paymentError;
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentInstructions = () => {
    if (!paymentInfo) return null;
    const amount = billingCycle === 'monthly' ? selectedPlan?.price_monthly : selectedPlan?.price_yearly;

    switch (paymentMethod) {
      case 'mtn_momo':
        return paymentInfo.mtn_momo?.number ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="font-medium text-amber-900">Send {formatCurrency(amount, 'USD')} to:</p>
            <p className="text-2xl font-bold text-amber-700 font-mono">{paymentInfo.mtn_momo.number}</p>
            <p className="text-sm text-amber-700">Name: {paymentInfo.mtn_momo.name}</p>
            <p className="text-xs text-amber-600 mt-2">Include reference: <span className="font-mono font-bold">{referenceCode}</span></p>
          </div>
        ) : (
          <p className="text-red-500">MTN MoMo not configured. Please contact support.</p>
        );
      case 'bank_usd':
        return paymentInfo.bank_usd?.account_number ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <p className="font-medium text-blue-900">Bank Transfer (USD) - {formatCurrency(amount, 'USD')}</p>
            <p className="text-sm"><span className="text-blue-600">Bank:</span> {paymentInfo.bank_usd.bank_name}</p>
            <p className="text-sm"><span className="text-blue-600">Account:</span> <span className="font-mono">{paymentInfo.bank_usd.account_number}</span></p>
            <p className="text-sm"><span className="text-blue-600">Name:</span> {paymentInfo.bank_usd.account_name}</p>
            <p className="text-xs text-blue-600 mt-2">Reference: <span className="font-mono font-bold">{referenceCode}</span></p>
          </div>
        ) : (
          <p className="text-red-500">USD Bank not configured. Please contact support.</p>
        );
      default:
        return null;
    }
  };

  if (!showUpgradeModal) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="fixed inset-0 bg-black/60" onClick={() => setShowUpgradeModal(false)} />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
                  {upgradeReason && <p className="text-sm text-gray-500">{upgradeReason}</p>}
                </div>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'plans' && (
                <div className="space-y-6">
                  {/* Billing Toggle */}
                  <div className="flex justify-center">
                    <div className="bg-gray-100 rounded-xl p-1 inline-flex">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          billingCycle === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        Yearly <span className="text-green-600 text-xs">Save 17%</span>
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loadingPlans ? (
                    <div className="py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
                      <p className="text-gray-500">Loading plans...</p>
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="py-12 text-center">
                      <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No plans available</p>
                      <p className="text-sm text-gray-400">Please contact support or try again later.</p>
                    </div>
                  ) : (
                  /* Plans Grid */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((p) => {
                      const price = billingCycle === 'monthly' ? p.price_monthly : p.price_yearly;
                      const isCurrentPlan = plan?.id === p.id;
                      const features = typeof p.features === 'string' ? JSON.parse(p.features) : p.features;

                      return (
                        <div
                          key={p.id}
                          className={`relative border-2 rounded-2xl p-6 transition-all ${
                            p.is_featured
                              ? 'border-amber-500 bg-amber-50/50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                        >
                          {p.is_featured && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                              </span>
                            </div>
                          )}
                          {isCurrentPlan && (
                            <div className="absolute -top-3 right-4">
                              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                CURRENT
                              </span>
                            </div>
                          )}

                          <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{p.description}</p>

                          <div className="mt-4">
                            {p.slug === 'enterprise' ? (
                              <p className="text-3xl font-black text-gray-900">Custom</p>
                            ) : (
                              <>
                                <span className="text-3xl font-black text-gray-900">
                                  ${price}
                                </span>
                                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                              </>
                            )}
                          </div>

                          <ul className="mt-4 space-y-2">
                            {features?.map((feature: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={() => handleSelectPlan(p)}
                            disabled={isCurrentPlan || p.slug === 'free'}
                            className={`w-full mt-6 py-2.5 rounded-xl font-medium transition-all ${
                              isCurrentPlan
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : p.slug === 'free'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : p.is_featured
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                          >
                            {isCurrentPlan ? 'Current Plan' : p.slug === 'free' ? 'Free Plan' : p.slug === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>
              )}

              {step === 'payment' && selectedPlan && (
                <div className="space-y-6 max-w-lg mx-auto">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">Complete Your Upgrade</h3>
                    <p className="text-gray-500">
                      {selectedPlan.name} - {formatCurrency(
                        billingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly,
                        'USD'
                      )}/{billingCycle === 'monthly' ? 'month' : 'year'}
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mtn_momo')}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          paymentMethod === 'mtn_momo' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center mb-2">
                          <Smartphone className="h-5 w-5 text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">MTN MoMo</p>
                        <p className="text-xs text-gray-500">Mobile Money</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_usd')}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          paymentMethod === 'bank_usd' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                          <Building className="h-5 w-5 text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">Bank Transfer</p>
                        <p className="text-xs text-gray-500">USD Account</p>
                      </button>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  {getPaymentInstructions()}

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID / Reference <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0"
                      placeholder="Enter transaction ID or SMS message"
                    />
                  </div>

                  {/* Proof Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Screenshot <span className="text-gray-400">(optional)</span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-all">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <p className="text-sm text-gray-500 mt-1">
                        {proofFile ? proofFile.name : 'Click to upload'}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('plans')}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitPayment}
                      disabled={loading}
                      className="flex-1 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'I have paid'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
                  <p className="text-gray-500 mb-6">
                    Your payment is being verified. Once confirmed, your plan will be upgraded automatically.
                    This usually takes a few minutes to a few hours.
                  </p>
                  <p className="text-sm text-gray-400 mb-6">Reference: <span className="font-mono">{referenceCode}</span></p>
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      refreshBilling();
                    }}
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
