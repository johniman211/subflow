'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, generateReferenceCode } from '@/lib/utils';
import { BILLING_CYCLES_MAP, PAYMENT_METHODS } from '@/lib/constants';
import { 
  Phone, Mail, Smartphone, Building, Copy, Check, Upload, Loader2,
  ChevronLeft, CreditCard, Clock, CheckCircle2, ArrowRight, Sparkles, Tag, X
} from 'lucide-react';
import type { Price } from '@/types/database';

interface CheckoutFormProps {
  product: any;
  prices: Price[];
  merchant: any;
}

type Step = 'select' | 'details' | 'pay' | 'confirm' | 'success';

export function CheckoutForm({ product, prices, merchant }: CheckoutFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(prices.length === 1 ? prices[0] : null);
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'bank_transfer'>('mtn_momo');
  const [referenceCode, setReferenceCode] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    email: '',
  });

  const [paymentProof, setPaymentProof] = useState({
    transactionId: '',
    proofFile: null as File | null,
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Auto-advance to details if only one price
  if (prices.length === 1 && step === 'select' && selectedPrice) {
    setStep('details');
  }

  const handleSelectPrice = (price: Price) => {
    setSelectedPrice(price);
    setAppliedCoupon(null); // Reset coupon when changing price
    setCouponCode('');
    setCouponError('');
    setStep('details');
  };

  // Apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPrice) return;
    
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);

    const supabase = createClient();
    
    // Look up the coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase().trim())
      .eq('merchant_id', product.merchant_id)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      setCouponError('Invalid coupon code');
      setCouponLoading(false);
      return;
    }

    // Check if coupon is expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      setCouponError('This coupon has expired');
      setCouponLoading(false);
      return;
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      setCouponError('This coupon has reached its usage limit');
      setCouponLoading(false);
      return;
    }

    // Check minimum amount
    if (coupon.min_amount && selectedPrice.amount < coupon.min_amount) {
      setCouponError(`Minimum order amount is ${formatCurrency(coupon.min_amount, selectedPrice.currency)}`);
      setCouponLoading(false);
      return;
    }

    // Check if coupon applies to this product/price
    if (coupon.product_ids && coupon.product_ids.length > 0 && !coupon.product_ids.includes(product.id)) {
      setCouponError('This coupon is not valid for this product');
      setCouponLoading(false);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponLoading(false);
  };

  // Calculate discounted amount
  const getDiscountedAmount = () => {
    if (!selectedPrice || !appliedCoupon) return selectedPrice?.amount || 0;
    
    if (appliedCoupon.discount_type === 'percentage') {
      const discount = (selectedPrice.amount * appliedCoupon.discount_value) / 100;
      return Math.max(0, selectedPrice.amount - discount);
    } else {
      return Math.max(0, selectedPrice.amount - appliedCoupon.discount_value);
    }
  };

  const getDiscountAmount = () => {
    if (!selectedPrice || !appliedCoupon) return 0;
    return selectedPrice.amount - getDiscountedAmount();
  };

  const handleCustomerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Generate reference code
    const refCode = generateReferenceCode();
    setReferenceCode(refCode);

    // Create payment record
    const supabase = createClient();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const finalAmount = getDiscountedAmount();
    
    const { error: paymentError } = await supabase.from('payments').insert({
      merchant_id: product.merchant_id,
      price_id: selectedPrice!.id,
      customer_phone: customerInfo.phone,
      customer_email: customerInfo.email || null,
      reference_code: refCode,
      amount: finalAmount,
      currency: selectedPrice!.currency,
      payment_method: paymentMethod,
      expires_at: expiresAt.toISOString(),
      coupon_id: appliedCoupon?.id || null,
      original_amount: selectedPrice!.amount,
      discount_amount: getDiscountAmount(),
    });

    if (paymentError) {
      setError(paymentError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep('pay');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    // Upload proof if provided (skip if bucket not configured)
    let proofUrl = null;
    if (paymentProof.proofFile) {
      try {
        const fileName = `${referenceCode}-${Date.now()}.${paymentProof.proofFile.name.split('.').pop()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentProof.proofFile);

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName);
          proofUrl = publicUrl;
        }
        // If upload fails, continue without proof - merchant can still verify manually
      } catch (e) {
        console.warn('Proof upload skipped:', e);
      }
    }

    // Update payment to matched (awaiting merchant confirmation) via API
    const submitResponse = await fetch('/api/payments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceCode,
        transactionId: paymentProof.transactionId || null,
        proofUrl,
      }),
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      setError(errorData.error || 'Failed to submit payment');
      setLoading(false);
      return;
    }

    // Send email notification to merchant
    try {
      await fetch('/api/notify-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: product.merchant_id,
          referenceCode,
          amount: selectedPrice!.amount,
          currency: selectedPrice!.currency,
          customerPhone: customerInfo.phone,
          productName: product.name,
          priceName: selectedPrice!.name,
        }),
      });
    } catch (e) {
      console.warn('Email notification failed:', e);
    }

    setLoading(false);
    setStep('success');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Progress indicator
  const ProgressSteps = () => {
    const steps = [
      { key: 'details', label: 'Details' },
      { key: 'pay', label: 'Payment' },
      { key: 'success', label: 'Complete' },
    ];
    const currentIndex = steps.findIndex(s => s.key === step) || 0;

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
              step === s.key 
                ? 'bg-slate-900 text-white' 
                : i < currentIndex || step === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-400'
            }`}>
              {i < currentIndex || step === 'success' ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 ${
                i < currentIndex ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Step 1: Select Price
  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Choose your plan</h2>
          <p className="text-slate-500 mt-1">Select the plan that works best for you</p>
        </div>
        
        <div className="space-y-3">
          {prices.map((price) => (
            <button
              key={price.id}
              onClick={() => handleSelectPrice(price)}
              className="w-full p-5 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-900 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{price.name}</p>
                    {price.trial_days > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <Sparkles className="h-3 w-3" />
                        {price.trial_days}-day trial
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {BILLING_CYCLES_MAP[price.billing_cycle]?.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(price.amount, price.currency)}
                  </p>
                  {price.billing_cycle !== 'one_time' && (
                    <p className="text-sm text-slate-500">
                      per {price.billing_cycle === 'monthly' ? 'month' : 'year'}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 ml-4 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Customer Details
  if (step === 'details') {
    return (
      <div className="space-y-6">
        <ProgressSteps />
        
        {/* Order Summary */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Order summary</p>
              <p className="font-semibold text-slate-900">{selectedPrice?.name}</p>
            </div>
            <div className="text-right">
              {appliedCoupon ? (
                <>
                  <p className="text-sm text-slate-400 line-through">
                    {formatCurrency(selectedPrice!.amount, selectedPrice!.currency)}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(getDiscountedAmount(), selectedPrice!.currency)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(selectedPrice!.amount, selectedPrice!.currency)}
                </p>
              )}
              {selectedPrice?.billing_cycle !== 'one_time' && (
                <p className="text-sm text-slate-500">
                  per {selectedPrice?.billing_cycle === 'monthly' ? 'month' : 'year'}
                </p>
              )}
            </div>
          </div>
          
          {/* Applied Coupon Badge */}
          {appliedCoupon && (
            <div className="mt-3 flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {appliedCoupon.code} - {appliedCoupon.discount_type === 'percentage' 
                    ? `${appliedCoupon.discount_value}% off` 
                    : `${formatCurrency(appliedCoupon.discount_value, selectedPrice!.currency)} off`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                className="p-1 hover:bg-green-100 rounded transition-colors"
              >
                <X className="h-4 w-4 text-green-600" />
              </button>
            </div>
          )}
          
          {prices.length > 1 && (
            <button 
              onClick={() => setStep('select')} 
              className="text-sm text-slate-500 hover:text-slate-900 mt-2 flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Change plan
            </button>
          )}
        </div>

        {/* Coupon Code Input */}
        {!appliedCoupon && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                className="flex-1 px-4 py-2.5 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:ring-0 transition-colors placeholder:text-slate-400 uppercase"
                placeholder="Enter code"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {couponError && (
              <p className="text-sm text-red-500 mt-2">{couponError}</p>
            )}
          </div>
        )}

        <form onSubmit={handleCustomerDetails} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-0 transition-colors placeholder:text-slate-400"
                placeholder="+211 9XX XXX XXX"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-0 transition-colors placeholder:text-slate-400"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('mtn_momo')}
                className={`relative p-4 border-2 rounded-xl text-left transition-all ${
                  paymentMethod === 'mtn_momo'
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {paymentMethod === 'mtn_momo' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-900" />
                  </div>
                )}
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center mb-2">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <p className="font-semibold text-slate-900">MTN MoMo</p>
                <p className="text-xs text-slate-500 mt-0.5">Mobile Money</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`relative p-4 border-2 rounded-xl text-left transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {paymentMethod === 'bank_transfer' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-900" />
                  </div>
                )}
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <p className="font-semibold text-slate-900">Bank Transfer</p>
                <p className="text-xs text-slate-500 mt-0.5">Direct transfer</p>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue to Payment
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Step 3: Payment Instructions
  if (step === 'pay') {
    return (
      <div className="space-y-6">
        <ProgressSteps />
        
        {/* Back button */}
        <button 
          onClick={() => setStep('details')} 
          className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to details
        </button>

        {/* Reference Code Card */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-center">
          <p className="text-sm text-slate-400 mb-1">Your Reference Code</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-3xl font-bold text-white font-mono tracking-wider">{referenceCode}</p>
            <button
              onClick={() => copyToClipboard(referenceCode, 'ref')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {copied === 'ref' ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Include this code in your payment description
          </p>
        </div>

        {/* Payment Details Card */}
        {paymentMethod === 'mtn_momo' ? (
          <div className="p-5 bg-yellow-50 border-2 border-yellow-200 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-yellow-900">MTN Mobile Money</p>
                <p className="text-sm text-yellow-700">Send payment to this number</p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">MoMo Number</p>
                  <p className="text-xl font-bold text-slate-900">{merchant?.mtn_momo_number || 'Not configured'}</p>
                </div>
                {merchant?.mtn_momo_number && (
                  <button
                    onClick={() => copyToClipboard(merchant.mtn_momo_number, 'momo')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {copied === 'momo' ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(selectedPrice!.amount, selectedPrice!.currency)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Include reference code <span className="font-mono font-bold">{referenceCode}</span> in payment description
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">Bank Transfer ({selectedPrice!.currency})</p>
                <p className="text-sm text-blue-700">Transfer to this account</p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-blue-200 space-y-3">
              {selectedPrice!.currency === 'USD' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Bank</span>
                    <span className="font-medium text-slate-900">{merchant?.bank_name_usd || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Account</span>
                    <span className="font-medium text-slate-900">{merchant?.bank_account_number_usd || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Name</span>
                    <span className="font-medium text-slate-900">{merchant?.bank_account_name_usd || 'Not configured'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Bank</span>
                    <span className="font-medium text-slate-900">{merchant?.bank_name_ssp || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Account</span>
                    <span className="font-medium text-slate-900">{merchant?.bank_account_number_ssp || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Name</span>
                    <span className="font-medium text-slate-900">{merchant?.bank_account_name_ssp || 'Not configured'}</span>
                  </div>
                </>
              )}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(selectedPrice!.amount, selectedPrice!.currency)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Include reference code <span className="font-mono font-bold">{referenceCode}</span> in payment description
              </p>
            </div>
          </div>
        )}

        {/* Confirmation Form */}
        <form onSubmit={handlePaymentSubmit} className="space-y-5">
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-900 mb-2">Confirm Your Payment</h3>
            <p className="text-sm text-slate-500">
              After completing your payment, provide the details below for faster verification.
            </p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {paymentMethod === 'mtn_momo' ? 'Transaction Message' : 'Transfer Reference'} 
              <span className="text-slate-400 font-normal"> (optional)</span>
            </label>
            <input
              type="text"
              value={paymentProof.transactionId}
              onChange={(e) => setPaymentProof({ ...paymentProof, transactionId: e.target.value })}
              className="w-full px-4 py-3.5 bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-0 transition-colors placeholder:text-slate-400"
              placeholder={paymentMethod === 'mtn_momo' 
                ? "e.g., You have received 100 SSP from..." 
                : "e.g., Transfer reference number"
              }
            />
            <p className="text-xs text-slate-500 mt-2">
              {paymentMethod === 'mtn_momo' 
                ? 'Paste the confirmation SMS you received' 
                : 'Enter the transfer reference from your bank'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Receipt Screenshot <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all">
              <div className="text-center">
                <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600 mt-2">
                  {paymentProof.proofFile ? (
                    <span className="text-green-600 font-medium">{paymentProof.proofFile.name}</span>
                  ) : (
                    'Click to upload'
                  )}
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPaymentProof({ ...paymentProof, proofFile: e.target.files?.[0] || null })}
              />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                I have made payment
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Step 4: Success
  if (step === 'success') {
    const merchantName = merchant?.business_name || merchant?.full_name || 'the seller';
    return (
      <div className="space-y-6">
        <ProgressSteps />
        
        <div className="text-center py-6">
          {/* Success Animation */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Check className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Submitted!</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Your payment is being verified. <strong className="text-slate-700">{merchantName}</strong> has been notified.
          </p>
        </div>

        {/* Reference Code Card */}
        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
            <Clock className="h-4 w-4" />
            <p className="text-sm font-medium">Pending Verification</p>
          </div>
          <p className="text-xs text-amber-700 mb-3">Save your reference code</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-amber-200">
            <p className="text-2xl font-bold font-mono text-slate-900">{referenceCode}</p>
            <button
              onClick={() => copyToClipboard(referenceCode, 'success-ref')}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {copied === 'success-ref' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* What's Next */}
        <div className="p-5 bg-slate-50 rounded-xl">
          <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Payment submitted</p>
                <p className="text-xs text-slate-500">Your payment details have been sent</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="h-3 w-3 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Verification in progress</p>
                <p className="text-xs text-slate-500">{merchantName} will verify your payment</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="h-3 w-3 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Access granted</p>
                <p className="text-xs text-slate-500">You&apos;ll get access to {product.name}</p>
              </div>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-slate-400">
          Questions? Contact {merchantName} with your reference code.
        </p>
      </div>
    );
  }

  return null;
}
