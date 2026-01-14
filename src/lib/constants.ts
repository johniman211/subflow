export const APP_NAME = 'Payssd';
export const APP_DESCRIPTION = 'Subscription Management Platform for South Sudan & East Africa';

export const SUPPORTED_CURRENCIES = ['SSP', 'USD'] as const;
export const DEFAULT_CURRENCY = 'SSP';

export const CURRENCIES = [
  { value: 'SSP', label: 'SSP - South Sudanese Pound' },
  { value: 'USD', label: 'USD - US Dollar' },
] as const;

export const PRODUCT_TYPES = [
  { 
    value: 'subscription', 
    label: 'Subscription Service',
    description: 'Courses, SaaS, Gym, Memberships - Recurring payments',
    icon: 'repeat',
    billingCycles: ['monthly', 'yearly'],
  },
  { 
    value: 'digital_product', 
    label: 'Digital Product',
    description: 'E-books, templates, downloadable content',
    icon: 'download',
    billingCycles: ['one_time'],
  },
  { 
    value: 'one_time', 
    label: 'One-time Payment',
    description: 'Lifetime access, single purchase',
    icon: 'check-circle',
    billingCycles: ['one_time'],
  },
] as const;

export const PRODUCT_TYPES_MAP = {
  subscription: { 
    label: 'Subscription Service', 
    description: 'Recurring payments',
    allowedBillingCycles: ['monthly', 'yearly'],
  },
  digital_product: { 
    label: 'Digital Product', 
    description: 'One-time download',
    allowedBillingCycles: ['one_time'],
  },
  one_time: { 
    label: 'One-time Payment', 
    description: 'Lifetime access',
    allowedBillingCycles: ['one_time'],
  },
} as const;

export const BILLING_CYCLES = [
  { value: 'one_time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const BILLING_CYCLES_MAP = {
  one_time: { label: 'One-time', description: 'Single payment, lifetime access' },
  monthly: { label: 'Monthly', description: 'Recurring monthly billing' },
  yearly: { label: 'Yearly', description: 'Recurring yearly billing' },
} as const;

export const PAYMENT_METHODS = {
  mtn_momo: {
    label: 'MTN Mobile Money',
    description: 'Pay via MTN MoMo',
    icon: 'smartphone',
  },
  bank_transfer: {
    label: 'Bank Transfer',
    description: 'Pay via bank transfer',
    icon: 'building',
  },
} as const;

export const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  matched: { label: 'Matched', color: 'info' },
  confirmed: { label: 'Confirmed', color: 'success' },
  rejected: { label: 'Rejected', color: 'danger' },
  expired: { label: 'Expired', color: 'gray' },
} as const;

export const SUBSCRIPTION_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  active: { label: 'Active', color: 'success' },
  past_due: { label: 'Past Due', color: 'danger' },
  expired: { label: 'Expired', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'gray' },
} as const;

export const WEBHOOK_EVENTS = [
  'payment.created',
  'payment.matched',
  'payment.confirmed',
  'payment.rejected',
  'payment.expired',
  'subscription.created',
  'subscription.activated',
  'subscription.renewed',
  'subscription.expired',
  'subscription.cancelled',
] as const;

export const DEFAULT_PAYMENT_EXPIRY_HOURS = 24;
export const DEFAULT_GRACE_PERIOD_DAYS = 3;
export const DEFAULT_TRIAL_DAYS = 0;

export const SOUTH_SUDAN_BANKS = [
  'Equity Bank South Sudan',
  'Kenya Commercial Bank (KCB)',
  'Cooperative Bank of South Sudan',
  'Ivory Bank',
  'Buffalo Commercial Bank',
  'Nile Commercial Bank',
] as const;

export const EAST_AFRICA_COUNTRIES = [
  { code: 'SS', name: 'South Sudan', dialCode: '+211', currency: 'SSP' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', currency: 'KES' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', currency: 'UGX' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', currency: 'TZS' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', currency: 'RWF' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', currency: 'ETB' },
] as const;
