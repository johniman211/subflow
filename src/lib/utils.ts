import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateReferenceCode(): string {
  // Numbers only - easy to type on phone (10 digits max)
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code; // Format: 7394628150 (10 digits)
}

export function generateApiKey(prefix: 'pk' | 'sk'): string {
  const key = nanoid(32);
  return `${prefix}_live_${key}`;
}

export function hashApiKey(key: string): string {
  // Simple hash for demo - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function formatCurrency(amount: number, currency: 'SSP' | 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'SSP' ? 'SSP' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  if (currency === 'SSP') {
    return `SSP ${amount.toLocaleString()}`;
  }
  return formatter.format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getSubscriptionEndDate(
  startDate: Date,
  billingCycle: 'one_time' | 'monthly' | 'yearly',
  trialDays: number = 0
): Date {
  const endDate = new Date(startDate);
  
  if (trialDays > 0) {
    endDate.setDate(endDate.getDate() + trialDays);
    return endDate;
  }
  
  switch (billingCycle) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case 'one_time':
      endDate.setFullYear(endDate.getFullYear() + 100); // Lifetime access
      break;
  }
  
  return endDate;
}

export function isSubscriptionActive(
  status: string,
  currentPeriodEnd: string,
  gracePeriodDays: number = 0
): boolean {
  if (status !== 'active' && status !== 'past_due') {
    return false;
  }
  
  const endDate = new Date(currentPeriodEnd);
  endDate.setDate(endDate.getDate() + gracePeriodDays);
  
  return new Date() <= endDate;
}

export function getPaymentExpiryDate(hoursFromNow: number = 24): Date {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hoursFromNow);
  return expiryDate;
}

export function parsePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle South Sudan phone numbers
  if (cleaned.startsWith('211')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+211${cleaned.slice(1)}`;
  }
  if (cleaned.length === 9) {
    return `+211${cleaned}`;
  }
  
  return `+${cleaned}`;
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'confirmed':
      return 'bg-success-50 text-success-600';
    case 'pending':
    case 'matched':
      return 'bg-warning-50 text-warning-600';
    case 'past_due':
    case 'rejected':
      return 'bg-danger-50 text-danger-600';
    case 'expired':
    case 'cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}
