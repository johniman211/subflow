// WhatsApp Business API Service
// Supports WhatsApp Cloud API (Meta) and WhatsApp Business Solution Providers

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private apiVersion = 'v18.0';

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  private normalizePhone(phone: string): string {
    let normalized = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    if (normalized.startsWith('+')) {
      normalized = normalized.substring(1);
    }
    if (normalized.startsWith('0')) {
      normalized = '211' + normalized.substring(1);
    }
    return normalized;
  }

  async sendMessage(to: string, message: string): Promise<WhatsAppResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.normalizePhone(to),
            type: 'text',
            text: { body: message },
          }),
        }
      );

      const data = await response.json();

      if (data.messages?.[0]?.id) {
        return { success: true, messageId: data.messages[0].id };
      }

      return { success: false, error: data.error?.message || 'Unknown error' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async sendTemplate(to: string, templateName: string, params: string[]): Promise<WhatsAppResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.normalizePhone(to),
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en' },
              components: params.length > 0 ? [{
                type: 'body',
                parameters: params.map(p => ({ type: 'text', text: p })),
              }] : undefined,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.messages?.[0]?.id) {
        return { success: true, messageId: data.messages[0].id };
      }

      return { success: false, error: data.error?.message || 'Unknown error' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Pre-built message templates
  async sendPaymentConfirmation(phone: string, data: {
    productName: string;
    amount: string;
    referenceCode: string;
    merchantName: string;
  }): Promise<WhatsAppResult> {
    const message = `✅ *Payment Confirmed!*

Your payment of *${data.amount}* for *${data.productName}* has been confirmed.

📋 Reference: \`${data.referenceCode}\`

Thank you for your purchase!
— ${data.merchantName}`;
    return this.sendMessage(phone, message);
  }

  async sendSubscriptionRenewalReminder(phone: string, data: {
    productName: string;
    daysLeft: number;
    renewUrl: string;
    merchantName: string;
  }): Promise<WhatsAppResult> {
    const message = `⏰ *Renewal Reminder*

Your subscription to *${data.productName}* expires in *${data.daysLeft} days*.

Renew now to continue enjoying uninterrupted access:
${data.renewUrl}

— ${data.merchantName}`;
    return this.sendMessage(phone, message);
  }

  async sendSubscriptionExpired(phone: string, data: {
    productName: string;
    renewUrl: string;
    merchantName: string;
  }): Promise<WhatsAppResult> {
    const message = `❌ *Subscription Expired*

Your subscription to *${data.productName}* has expired.

Resubscribe to regain access:
${data.renewUrl}

— ${data.merchantName}`;
    return this.sendMessage(phone, message);
  }

  async sendCheckoutLink(phone: string, data: {
    productName: string;
    amount: string;
    checkoutUrl: string;
    merchantName: string;
  }): Promise<WhatsAppResult> {
    const message = `🛒 *Complete Your Purchase*

Product: *${data.productName}*
Amount: *${data.amount}*

Click below to complete payment:
${data.checkoutUrl}

— ${data.merchantName}`;
    return this.sendMessage(phone, message);
  }
}

export const whatsappService = new WhatsAppService();
export type { WhatsAppResult };
