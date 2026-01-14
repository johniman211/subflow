import { createServiceRoleClient } from '@/lib/supabase/server';
import type { 
  NotificationChannel, 
  NotificationPayload, 
  NotificationEventType,
  ProviderConfig,
  EmailProvider,
  SMSProvider,
  WhatsAppProvider 
} from '@/types/notifications';

// Unified notification service
export class NotificationService {
  private supabase: any;

  constructor() {
    this.supabase = createServiceRoleClient();
  }

  // Send notification through configured providers
  async send(payload: NotificationPayload): Promise<{ success: boolean; results: any[] }> {
    const results: any[] = [];

    for (const channel of payload.channels) {
      try {
        const provider = await this.getActiveProvider(channel);
        if (!provider) {
          results.push({ channel, success: false, error: `No active ${channel} provider configured` });
          continue;
        }

        const result = await this.sendViaProvider(provider, payload);
        results.push({ channel, provider: provider.provider, ...result });

        // Log the notification
        await this.logNotification({
          provider_id: provider.id,
          channel,
          recipient: this.getRecipient(payload, channel),
          recipient_type: payload.recipient_type,
          event_type: payload.event_type,
          subject: result.subject,
          body: result.body,
          status: result.success ? 'sent' : 'failed',
          error_message: result.error,
          provider_response: result.response,
        });
      } catch (error: any) {
        results.push({ channel, success: false, error: error.message });
      }
    }

    return { 
      success: results.some(r => r.success), 
      results 
    };
  }

  // Get active provider for a channel
  private async getActiveProvider(channel: NotificationChannel): Promise<ProviderConfig | null> {
    const { data } = await this.supabase
      .from('notification_providers')
      .select('*')
      .eq('channel', channel)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  // Send via specific provider
  private async sendViaProvider(
    provider: ProviderConfig, 
    payload: NotificationPayload
  ): Promise<{ success: boolean; subject?: string; body?: string; error?: string; response?: any }> {
    const template = await this.getTemplate(payload.event_type, provider.channel);
    const { subject, body } = this.renderTemplate(template, payload.data);

    switch (provider.channel) {
      case 'email':
        return this.sendEmail(provider, payload.recipient_email!, subject, body);
      case 'sms':
        return this.sendSMS(provider, payload.recipient_phone!, body);
      case 'whatsapp':
        return this.sendWhatsApp(provider, payload.recipient_phone!, body);
      default:
        return { success: false, error: 'Unknown channel' };
    }
  }

  // Email providers
  private async sendEmail(
    provider: ProviderConfig, 
    to: string, 
    subject: string, 
    body: string
  ): Promise<{ success: boolean; subject?: string; body?: string; error?: string; response?: any }> {
    const creds = provider.credentials;

    switch (provider.provider as EmailProvider) {
      case 'resend':
        return this.sendViaResend(creds, to, subject, body);
      case 'sendgrid':
        return this.sendViaSendGrid(creds, to, subject, body);
      case 'mailgun':
        return this.sendViaMailgun(creds, to, subject, body);
      default:
        return { success: false, subject, body, error: 'Email provider not implemented' };
    }
  }

  // Resend email
  private async sendViaResend(
    creds: Record<string, string>, 
    to: string, 
    subject: string, 
    body: string
  ) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: creds.from_name ? `${creds.from_name} <${creds.from_email}>` : creds.from_email,
          to: [to],
          subject,
          html: body,
        }),
      });

      const data = await response.json();
      return { 
        success: response.ok, 
        subject, 
        body, 
        response: data,
        error: response.ok ? undefined : data.message 
      };
    } catch (error: any) {
      return { success: false, subject, body, error: error.message };
    }
  }

  // SendGrid email
  private async sendViaSendGrid(
    creds: Record<string, string>, 
    to: string, 
    subject: string, 
    body: string
  ) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: creds.from_email, name: creds.from_name },
          subject,
          content: [{ type: 'text/html', value: body }],
        }),
      });

      return { 
        success: response.ok, 
        subject, 
        body,
        error: response.ok ? undefined : 'SendGrid error' 
      };
    } catch (error: any) {
      return { success: false, subject, body, error: error.message };
    }
  }

  // Mailgun email
  private async sendViaMailgun(
    creds: Record<string, string>, 
    to: string, 
    subject: string, 
    body: string
  ) {
    try {
      const formData = new URLSearchParams();
      formData.append('from', creds.from_email);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', body);

      const response = await fetch(`https://api.mailgun.net/v3/${creds.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${creds.api_key}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      return { 
        success: response.ok, 
        subject, 
        body,
        response: data,
        error: response.ok ? undefined : data.message 
      };
    } catch (error: any) {
      return { success: false, subject, body, error: error.message };
    }
  }

  // SMS providers
  private async sendSMS(
    provider: ProviderConfig, 
    to: string, 
    body: string
  ): Promise<{ success: boolean; body?: string; error?: string; response?: any }> {
    const creds = provider.credentials;

    switch (provider.provider as SMSProvider) {
      case 'twilio':
        return this.sendViaTwilioSMS(creds, to, body);
      case 'africastalking':
        return this.sendViaAfricasTalking(creds, to, body);
      case 'termii':
        return this.sendViaTermii(creds, to, body);
      default:
        return { success: false, body, error: 'SMS provider not implemented' };
    }
  }

  // Twilio SMS
  private async sendViaTwilioSMS(creds: Record<string, string>, to: string, body: string) {
    try {
      const formData = new URLSearchParams();
      formData.append('To', to);
      formData.append('From', creds.from_number);
      formData.append('Body', body);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${creds.account_sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${creds.account_sid}:${creds.auth_token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      return { 
        success: response.ok, 
        body,
        response: data,
        error: response.ok ? undefined : data.message 
      };
    } catch (error: any) {
      return { success: false, body, error: error.message };
    }
  }

  // Africa's Talking SMS
  private async sendViaAfricasTalking(creds: Record<string, string>, to: string, body: string) {
    try {
      const formData = new URLSearchParams();
      formData.append('username', creds.username);
      formData.append('to', to);
      formData.append('message', body);
      if (creds.sender_id) formData.append('from', creds.sender_id);

      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'apiKey': creds.api_key,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      return { 
        success: response.ok && data.SMSMessageData?.Recipients?.[0]?.status === 'Success', 
        body,
        response: data,
        error: response.ok ? undefined : 'Africa\'s Talking error' 
      };
    } catch (error: any) {
      return { success: false, body, error: error.message };
    }
  }

  // Termii SMS
  private async sendViaTermii(creds: Record<string, string>, to: string, body: string) {
    try {
      const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: creds.api_key,
          to,
          from: creds.sender_id,
          sms: body,
          type: 'plain',
          channel: 'generic',
        }),
      });

      const data = await response.json();
      return { 
        success: data.code === 'ok', 
        body,
        response: data,
        error: data.code === 'ok' ? undefined : data.message 
      };
    } catch (error: any) {
      return { success: false, body, error: error.message };
    }
  }

  // WhatsApp providers
  private async sendWhatsApp(
    provider: ProviderConfig, 
    to: string, 
    body: string
  ): Promise<{ success: boolean; body?: string; error?: string; response?: any }> {
    const creds = provider.credentials;

    switch (provider.provider as WhatsAppProvider) {
      case 'whatsapp_business':
        return this.sendViaWhatsAppBusiness(creds, to, body);
      case 'twilio_whatsapp':
        return this.sendViaTwilioWhatsApp(creds, to, body);
      default:
        return { success: false, body, error: 'WhatsApp provider not implemented' };
    }
  }

  // WhatsApp Business API
  private async sendViaWhatsAppBusiness(creds: Record<string, string>, to: string, body: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${creds.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creds.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/^\+/, ''),
            type: 'text',
            text: { body },
          }),
        }
      );

      const data = await response.json();
      return { 
        success: response.ok, 
        body,
        response: data,
        error: response.ok ? undefined : data.error?.message 
      };
    } catch (error: any) {
      return { success: false, body, error: error.message };
    }
  }

  // Twilio WhatsApp
  private async sendViaTwilioWhatsApp(creds: Record<string, string>, to: string, body: string) {
    try {
      const formData = new URLSearchParams();
      formData.append('To', `whatsapp:${to}`);
      formData.append('From', creds.from_number);
      formData.append('Body', body);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${creds.account_sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${creds.account_sid}:${creds.auth_token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      return { 
        success: response.ok, 
        body,
        response: data,
        error: response.ok ? undefined : data.message 
      };
    } catch (error: any) {
      return { success: false, body, error: error.message };
    }
  }

  // Get notification template
  private async getTemplate(eventType: NotificationEventType, channel: NotificationChannel) {
    const { data } = await this.supabase
      .from('notification_templates')
      .select('*')
      .eq('event_type', eventType)
      .eq('channel', channel)
      .eq('is_active', true)
      .single();

    // Return default template if not found
    return data || this.getDefaultTemplate(eventType, channel);
  }

  // Default templates
  private getDefaultTemplate(eventType: NotificationEventType, channel: NotificationChannel) {
    const templates: Record<NotificationEventType, { subject: string; body: string }> = {
      'payment.created': {
        subject: 'New Payment Received - {{reference_code}}',
        body: 'A new payment of {{amount}} {{currency}} has been submitted by {{customer_name}} ({{customer_phone}}). Reference: {{reference_code}}',
      },
      'payment.confirmed': {
        subject: 'Payment Confirmed - {{reference_code}}',
        body: 'Your payment of {{amount}} {{currency}} has been confirmed. Reference: {{reference_code}}. Thank you for your purchase!',
      },
      'payment.rejected': {
        subject: 'Payment Rejected - {{reference_code}}',
        body: 'Your payment with reference {{reference_code}} has been rejected. Reason: {{reason}}. Please contact support if you have questions.',
      },
      'subscription.created': {
        subject: 'Welcome! Subscription Activated',
        body: 'Your subscription to {{product_name}} is now active. Valid until {{period_end}}. Thank you for subscribing!',
      },
      'subscription.renewed': {
        subject: 'Subscription Renewed',
        body: 'Your subscription to {{product_name}} has been renewed. New period ends: {{period_end}}.',
      },
      'subscription.expiring': {
        subject: 'Subscription Expiring Soon',
        body: 'Your subscription to {{product_name}} will expire on {{period_end}}. Renew now to continue access.',
      },
      'subscription.expired': {
        subject: 'Subscription Expired',
        body: 'Your subscription to {{product_name}} has expired. Renew to restore access.',
      },
      'subscription.cancelled': {
        subject: 'Subscription Cancelled',
        body: 'Your subscription to {{product_name}} has been cancelled.',
      },
      'merchant.signup': {
        subject: 'New Merchant Registration',
        body: 'A new merchant has registered: {{business_name}} ({{email}}). Phone: {{phone}}',
      },
      'merchant.verified': {
        subject: 'Account Verified',
        body: 'Your merchant account has been verified. You can now start accepting payments!',
      },
      'customer.created': {
        subject: 'New Customer',
        body: 'New customer registered: {{customer_name}} ({{customer_phone}})',
      },
      'platform.alert': {
        subject: 'Platform Alert',
        body: '{{message}}',
      },
      'webhook.failed': {
        subject: 'Webhook Delivery Failed',
        body: 'Webhook delivery to {{url}} failed. Event: {{event}}. Error: {{error}}',
      },
    };

    return templates[eventType] || { subject: 'Notification', body: '{{message}}' };
  }

  // Render template with data
  private renderTemplate(template: { subject?: string; body: string }, data: Record<string, any>) {
    let subject = template.subject || '';
    let body = template.body;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    });

    return { subject, body };
  }

  // Get recipient based on channel
  private getRecipient(payload: NotificationPayload, channel: NotificationChannel): string {
    switch (channel) {
      case 'email':
        return payload.recipient_email || '';
      case 'sms':
      case 'whatsapp':
        return payload.recipient_phone || '';
      default:
        return '';
    }
  }

  // Log notification
  private async logNotification(log: any) {
    await this.supabase.from('notification_logs').insert(log);
  }
}

// Helper function to send platform notifications
export async function sendPlatformNotification(payload: NotificationPayload) {
  const service = new NotificationService();
  return service.send(payload);
}

// Notify admin about platform events
export async function notifyAdmin(
  eventType: NotificationEventType, 
  data: Record<string, any>,
  channels: NotificationChannel[] = ['email']
) {
  const supabase = createServiceRoleClient();
  
  // Get admin email from settings or env
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@payssd.com';
  const adminPhone = process.env.ADMIN_PHONE;

  return sendPlatformNotification({
    event_type: eventType,
    recipient_type: 'admin',
    recipient_email: adminEmail,
    recipient_phone: adminPhone,
    channels,
    data,
  });
}

// Notify merchant about their business events
export async function notifyMerchant(
  merchantId: string,
  eventType: NotificationEventType,
  data: Record<string, any>,
  channels: NotificationChannel[] = ['email']
) {
  const supabase = createServiceRoleClient();
  
  const { data: merchant } = await supabase
    .from('users')
    .select('email, phone')
    .eq('id', merchantId)
    .single();

  if (!merchant) return { success: false, error: 'Merchant not found' };

  return sendPlatformNotification({
    event_type: eventType,
    recipient_type: 'merchant',
    recipient_id: merchantId,
    recipient_email: merchant.email,
    recipient_phone: merchant.phone,
    channels,
    data,
  });
}

// Notify customer about their subscription
export async function notifyCustomer(
  customerPhone: string,
  customerEmail: string | null,
  eventType: NotificationEventType,
  data: Record<string, any>,
  channels: NotificationChannel[] = ['sms']
) {
  return sendPlatformNotification({
    event_type: eventType,
    recipient_type: 'customer',
    recipient_email: customerEmail || undefined,
    recipient_phone: customerPhone,
    channels,
    data,
  });
}
