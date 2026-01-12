// Notification Provider Types
export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

export type EmailProvider = 'resend' | 'sendgrid' | 'mailgun' | 'smtp';
export type SMSProvider = 'twilio' | 'africastalking' | 'termii';
export type WhatsAppProvider = 'whatsapp_business' | 'twilio_whatsapp' | 'africastalking_whatsapp';

export type NotificationProvider = EmailProvider | SMSProvider | WhatsAppProvider;

export interface ProviderConfig {
  id: string;
  channel: NotificationChannel;
  provider: NotificationProvider;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  credentials: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  event_type: NotificationEventType;
  channel: NotificationChannel;
  subject?: string; // For email
  body: string;
  variables: string[]; // Available template variables
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  provider_id: string;
  channel: NotificationChannel;
  recipient: string;
  recipient_type: 'admin' | 'merchant' | 'customer';
  event_type: NotificationEventType;
  subject?: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
  provider_response?: Record<string, any>;
  created_at: string;
  sent_at?: string;
}

export type NotificationEventType =
  | 'payment.created'
  | 'payment.confirmed'
  | 'payment.rejected'
  | 'subscription.created'
  | 'subscription.renewed'
  | 'subscription.expiring'
  | 'subscription.expired'
  | 'subscription.cancelled'
  | 'merchant.signup'
  | 'merchant.verified'
  | 'customer.created'
  | 'platform.alert'
  | 'webhook.failed';

export interface NotificationPayload {
  event_type: NotificationEventType;
  recipient_type: 'admin' | 'merchant' | 'customer';
  recipient_id?: string;
  recipient_email?: string;
  recipient_phone?: string;
  channels: NotificationChannel[];
  data: Record<string, any>;
}

// Provider credential requirements
export const PROVIDER_CREDENTIALS: Record<NotificationProvider, { key: string; label: string; type: 'text' | 'password'; required: boolean }[]> = {
  // Email Providers
  resend: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
    { key: 'from_email', label: 'From Email', type: 'text', required: true },
    { key: 'from_name', label: 'From Name', type: 'text', required: false },
  ],
  sendgrid: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
    { key: 'from_email', label: 'From Email', type: 'text', required: true },
    { key: 'from_name', label: 'From Name', type: 'text', required: false },
  ],
  mailgun: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
    { key: 'domain', label: 'Domain', type: 'text', required: true },
    { key: 'from_email', label: 'From Email', type: 'text', required: true },
  ],
  smtp: [
    { key: 'host', label: 'SMTP Host', type: 'text', required: true },
    { key: 'port', label: 'SMTP Port', type: 'text', required: true },
    { key: 'username', label: 'Username', type: 'text', required: true },
    { key: 'password', label: 'Password', type: 'password', required: true },
    { key: 'from_email', label: 'From Email', type: 'text', required: true },
  ],
  // SMS Providers
  twilio: [
    { key: 'account_sid', label: 'Account SID', type: 'text', required: true },
    { key: 'auth_token', label: 'Auth Token', type: 'password', required: true },
    { key: 'from_number', label: 'From Phone Number', type: 'text', required: true },
  ],
  africastalking: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
    { key: 'username', label: 'Username', type: 'text', required: true },
    { key: 'sender_id', label: 'Sender ID', type: 'text', required: false },
  ],
  termii: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
    { key: 'sender_id', label: 'Sender ID', type: 'text', required: true },
  ],
  // WhatsApp Providers
  whatsapp_business: [
    { key: 'access_token', label: 'Access Token', type: 'password', required: true },
    { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', required: true },
    { key: 'business_account_id', label: 'Business Account ID', type: 'text', required: true },
  ],
  twilio_whatsapp: [
    { key: 'account_sid', label: 'Account SID', type: 'text', required: true },
    { key: 'auth_token', label: 'Auth Token', type: 'password', required: true },
    { key: 'from_number', label: 'WhatsApp Number (with whatsapp: prefix)', type: 'text', required: true },
  ],
  africastalking_whatsapp: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
    { key: 'username', label: 'Username', type: 'text', required: true },
  ],
};

// Provider display info
export const PROVIDER_INFO: Record<NotificationProvider, { name: string; description: string; channel: NotificationChannel; logo?: string }> = {
  // Email
  resend: { name: 'Resend', description: 'Modern email API for developers', channel: 'email' },
  sendgrid: { name: 'SendGrid', description: 'Twilio SendGrid email delivery', channel: 'email' },
  mailgun: { name: 'Mailgun', description: 'Email API service by Mailgun', channel: 'email' },
  smtp: { name: 'Custom SMTP', description: 'Your own SMTP server', channel: 'email' },
  // SMS
  twilio: { name: 'Twilio', description: 'Global SMS and voice API', channel: 'sms' },
  africastalking: { name: "Africa's Talking", description: 'SMS API for Africa', channel: 'sms' },
  termii: { name: 'Termii', description: 'SMS API for African businesses', channel: 'sms' },
  // WhatsApp
  whatsapp_business: { name: 'WhatsApp Business', description: 'Official WhatsApp Business API', channel: 'whatsapp' },
  twilio_whatsapp: { name: 'Twilio WhatsApp', description: 'WhatsApp via Twilio', channel: 'whatsapp' },
  africastalking_whatsapp: { name: "Africa's Talking WhatsApp", description: 'WhatsApp via Africa\'s Talking', channel: 'whatsapp' },
};
