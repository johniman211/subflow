import { formatCurrency } from './utils';

interface RenewalNotificationData {
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  amount: number;
  currency: string;
  daysUntilExpiry: number;
  merchantName: string;
  paymentLink?: string;
}

export function generateWhatsAppRenewalMessage(data: RenewalNotificationData): string {
  const formattedAmount = formatCurrency(data.amount, data.currency);
  
  if (data.daysUntilExpiry <= 0) {
    return `Hi! Your subscription for "${data.productName}" from ${data.merchantName} has expired. Please renew now (${formattedAmount}) to continue accessing the service. ${data.paymentLink ? `Pay here: ${data.paymentLink}` : ''}`;
  }
  
  return `Hi! Your subscription for "${data.productName}" from ${data.merchantName} expires in ${data.daysUntilExpiry} day(s). Please renew (${formattedAmount}) to avoid service interruption. ${data.paymentLink ? `Pay here: ${data.paymentLink}` : ''}`;
}

export function generateEmailRenewalSubject(data: RenewalNotificationData): string {
  if (data.daysUntilExpiry <= 0) {
    return `Subscription Expired - ${data.productName}`;
  }
  return `Subscription Renewal Reminder - ${data.productName}`;
}

export function generateEmailRenewalBody(data: RenewalNotificationData): string {
  const formattedAmount = formatCurrency(data.amount, data.currency);
  
  if (data.daysUntilExpiry <= 0) {
    return `Dear Customer,

Your subscription for "${data.productName}" from ${data.merchantName} has expired.

Amount Due: ${formattedAmount}

Please renew your subscription to continue accessing the service.

${data.paymentLink ? `Click here to pay: ${data.paymentLink}` : ''}

Thank you for your continued support!

Best regards,
${data.merchantName}`;
  }

  return `Dear Customer,

This is a friendly reminder that your subscription for "${data.productName}" from ${data.merchantName} will expire in ${data.daysUntilExpiry} day(s).

Amount Due: ${formattedAmount}

Please renew your subscription before it expires to avoid any service interruption.

${data.paymentLink ? `Click here to pay: ${data.paymentLink}` : ''}

Thank you for your continued support!

Best regards,
${data.merchantName}`;
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getEmailLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
