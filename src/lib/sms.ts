// SMS Service using Africa's Talking API
// Also supports Twilio as fallback

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SMSProvider {
  send(to: string, message: string): Promise<SMSResult>;
}

// Africa's Talking SMS Provider (Popular in East Africa)
class AfricasTalkingProvider implements SMSProvider {
  private apiKey: string;
  private username: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.AT_API_KEY || '';
    this.username = process.env.AT_USERNAME || '';
    this.senderId = process.env.AT_SENDER_ID || 'Payssd';
  }

  async send(to: string, message: string): Promise<SMSResult> {
    if (!this.apiKey || !this.username) {
      return { success: false, error: 'Africa\'s Talking not configured' };
    }

    try {
      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': this.apiKey,
        },
        body: new URLSearchParams({
          username: this.username,
          to: to,
          message: message,
          from: this.senderId,
        }),
      });

      const data = await response.json();
      
      if (data.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return { 
          success: true, 
          messageId: data.SMSMessageData.Recipients[0].messageId 
        };
      }

      return { 
        success: false, 
        error: data.SMSMessageData?.Recipients?.[0]?.status || 'Unknown error' 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Twilio SMS Provider (Fallback)
class TwilioProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  async send(to: string, message: string): Promise<SMSResult> {
    if (!this.accountSid || !this.authToken) {
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: this.fromNumber,
            Body: message,
          }),
        }
      );

      const data = await response.json();
      
      if (data.sid) {
        return { success: true, messageId: data.sid };
      }

      return { success: false, error: data.message || 'Unknown error' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// SMS Service - automatically uses available provider
class SMSService {
  private providers: SMSProvider[];

  constructor() {
    this.providers = [
      new AfricasTalkingProvider(),
      new TwilioProvider(),
    ];
  }

  async send(to: string, message: string): Promise<SMSResult> {
    // Normalize phone number
    const normalizedPhone = this.normalizePhone(to);
    
    for (const provider of this.providers) {
      const result = await provider.send(normalizedPhone, message);
      if (result.success) {
        return result;
      }
    }

    return { success: false, error: 'All SMS providers failed or not configured' };
  }

  private normalizePhone(phone: string): string {
    // Remove spaces and ensure + prefix
    let normalized = phone.replace(/\s+/g, '');
    if (!normalized.startsWith('+')) {
      // Assume South Sudan if no country code
      if (normalized.startsWith('0')) {
        normalized = '+211' + normalized.substring(1);
      } else if (normalized.startsWith('211')) {
        normalized = '+' + normalized;
      } else {
        normalized = '+211' + normalized;
      }
    }
    return normalized;
  }

  // Pre-built message templates
  async sendPaymentConfirmation(phone: string, data: {
    productName: string;
    amount: string;
    referenceCode: string;
    merchantName: string;
  }): Promise<SMSResult> {
    const message = `Payment Confirmed! Your payment of ${data.amount} for ${data.productName} has been confirmed. Ref: ${data.referenceCode}. Thank you! - ${data.merchantName}`;
    return this.send(phone, message);
  }

  async sendPaymentReminder(phone: string, data: {
    productName: string;
    amount: string;
    referenceCode: string;
    expiresIn: string;
  }): Promise<SMSResult> {
    const message = `Reminder: Your payment of ${data.amount} for ${data.productName} is pending. Ref: ${data.referenceCode}. Complete within ${data.expiresIn}. - Payssd`;
    return this.send(phone, message);
  }

  async sendSubscriptionRenewalReminder(phone: string, data: {
    productName: string;
    daysLeft: number;
    renewUrl: string;
  }): Promise<SMSResult> {
    const message = `Your ${data.productName} subscription expires in ${data.daysLeft} days. Renew now: ${data.renewUrl}`;
    return this.send(phone, message);
  }

  async sendSubscriptionExpired(phone: string, data: {
    productName: string;
    renewUrl: string;
  }): Promise<SMSResult> {
    const message = `Your ${data.productName} subscription has expired. Renew to continue access: ${data.renewUrl}`;
    return this.send(phone, message);
  }

  async sendWelcome(phone: string, data: {
    productName: string;
    merchantName: string;
  }): Promise<SMSResult> {
    const message = `Welcome! Your subscription to ${data.productName} is now active. Thank you for subscribing! - ${data.merchantName}`;
    return this.send(phone, message);
  }
}

export const smsService = new SMSService();
export type { SMSResult };
