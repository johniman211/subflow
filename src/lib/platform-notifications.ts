import { Resend } from 'resend';
import twilio from 'twilio';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Initialize providers from environment variables
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

// Configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Losetify <notifications@losetify.com>';
const FROM_PHONE = process.env.TWILIO_FROM_NUMBER || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@losetify.com';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.losetify.com';

// ============================================
// EMAIL SENDING (Resend)
// ============================================
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured, skipping email');
    return { success: false, error: 'Email provider not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent:', data?.id);
    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// SMS SENDING (Twilio)
// ============================================
export async function sendSMS({
  to,
  body,
}: {
  to: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!twilioClient || !FROM_PHONE) {
    console.warn('Twilio not configured, skipping SMS');
    return { success: false, error: 'SMS provider not configured' };
  }

  // Format phone number (ensure it starts with +)
  const formattedTo = to.startsWith('+') ? to : `+${to}`;

  try {
    const message = await twilioClient.messages.create({
      body,
      from: FROM_PHONE,
      to: formattedTo,
    });

    console.log('SMS sent:', message.sid);
    return { success: true };
  } catch (error: any) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// NOTIFICATION LOGGING
// ============================================
async function logNotification({
  channel,
  recipient,
  recipient_type,
  event_type,
  subject,
  body,
  status,
  error_message,
}: {
  channel: 'email' | 'sms';
  recipient: string;
  recipient_type: 'admin' | 'merchant' | 'customer';
  event_type: string;
  subject?: string;
  body: string;
  status: 'sent' | 'failed';
  error_message?: string;
}) {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from('notification_logs').insert({
      channel,
      recipient,
      recipient_type,
      event_type,
      subject,
      body,
      status,
      error_message,
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}

// ============================================
// MERCHANT NOTIFICATIONS
// ============================================

// Payment pending - merchant needs to confirm
export async function notifyMerchantPaymentPending({
  merchantEmail,
  merchantPhone,
  merchantName,
  customerPhone,
  amount,
  currency,
  productName,
  referenceCode,
}: {
  merchantEmail: string;
  merchantPhone?: string;
  merchantName: string;
  customerPhone: string;
  amount: number;
  currency: string;
  productName: string;
  referenceCode: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  // Email
  const emailResult = await sendEmail({
    to: merchantEmail,
    subject: `💰 New Payment Received - ${referenceCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1a1a2e;">New Payment Received!</h2>
          <p>Hi ${merchantName},</p>
          <p>A customer has submitted a payment that requires your confirmation.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Reference:</td><td style="font-weight: bold;">${referenceCode}</td></tr>
              <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold; color: #22c55e;">${formattedAmount}</td></tr>
              <tr><td style="color: #666;">Product:</td><td>${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
            </table>
          </div>
          
          <a href="${APP_URL}/dashboard/payments" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Review & Confirm Payment
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Please verify the payment before confirming.
          </p>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: merchantEmail,
    recipient_type: 'merchant',
    event_type: 'payment.pending',
    subject: `New Payment Received - ${referenceCode}`,
    body: `Amount: ${formattedAmount}, Customer: ${customerPhone}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });

  // SMS
  if (merchantPhone) {
    const smsResult = await sendSMS({
      to: merchantPhone,
      body: `[Losetify] New payment: ${formattedAmount} for ${productName}. Ref: ${referenceCode}. Customer: ${customerPhone}. Please confirm in your dashboard.`,
    });

    await logNotification({
      channel: 'sms',
      recipient: merchantPhone,
      recipient_type: 'merchant',
      event_type: 'payment.pending',
      body: `New payment: ${formattedAmount} for ${productName}`,
      status: smsResult.success ? 'sent' : 'failed',
      error_message: smsResult.error,
    });
  }
}

// Payment confirmed
export async function notifyMerchantPaymentConfirmed({
  merchantEmail,
  merchantPhone,
  merchantName,
  customerPhone,
  amount,
  currency,
  productName,
  referenceCode,
}: {
  merchantEmail: string;
  merchantPhone?: string;
  merchantName: string;
  customerPhone: string;
  amount: number;
  currency: string;
  productName: string;
  referenceCode: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  // Email
  const emailResult = await sendEmail({
    to: merchantEmail,
    subject: `✅ Payment Confirmed - ${referenceCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #22c55e;">Payment Confirmed! ✅</h2>
          <p>Hi ${merchantName},</p>
          <p>A payment has been successfully confirmed.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Reference:</td><td style="font-weight: bold;">${referenceCode}</td></tr>
              <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold; color: #22c55e;">${formattedAmount}</td></tr>
              <tr><td style="color: #666;">Product:</td><td>${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
              <tr><td style="color: #666;">Status:</td><td style="color: #22c55e;">✅ Confirmed</td></tr>
            </table>
          </div>
          
          <a href="${APP_URL}/dashboard/payments" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View All Payments
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: merchantEmail,
    recipient_type: 'merchant',
    event_type: 'payment.confirmed',
    subject: `Payment Confirmed - ${referenceCode}`,
    body: `Amount: ${formattedAmount}, Customer: ${customerPhone}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });

  // SMS
  if (merchantPhone) {
    const smsResult = await sendSMS({
      to: merchantPhone,
      body: `[Losetify] Payment confirmed! ${formattedAmount} for ${productName}. Ref: ${referenceCode}. Customer subscription is now active.`,
    });

    await logNotification({
      channel: 'sms',
      recipient: merchantPhone,
      recipient_type: 'merchant',
      event_type: 'payment.confirmed',
      body: `Payment confirmed: ${formattedAmount}`,
      status: smsResult.success ? 'sent' : 'failed',
      error_message: smsResult.error,
    });
  }
}

// Payment rejected
export async function notifyMerchantPaymentRejected({
  merchantEmail,
  merchantPhone,
  merchantName,
  customerPhone,
  amount,
  currency,
  productName,
  referenceCode,
  reason,
}: {
  merchantEmail: string;
  merchantPhone?: string;
  merchantName: string;
  customerPhone: string;
  amount: number;
  currency: string;
  productName: string;
  referenceCode: string;
  reason?: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  // Email
  const emailResult = await sendEmail({
    to: merchantEmail,
    subject: `❌ Payment Rejected - ${referenceCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #ef4444;">Payment Rejected ❌</h2>
          <p>Hi ${merchantName},</p>
          <p>A payment has been rejected.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Reference:</td><td style="font-weight: bold;">${referenceCode}</td></tr>
              <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold;">${formattedAmount}</td></tr>
              <tr><td style="color: #666;">Product:</td><td>${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
              <tr><td style="color: #666;">Status:</td><td style="color: #ef4444;">❌ Rejected</td></tr>
              ${reason ? `<tr><td style="color: #666;">Reason:</td><td>${reason}</td></tr>` : ''}
            </table>
          </div>
          
          <a href="${APP_URL}/dashboard/payments" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Payments
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: merchantEmail,
    recipient_type: 'merchant',
    event_type: 'payment.rejected',
    subject: `Payment Rejected - ${referenceCode}`,
    body: `Amount: ${formattedAmount}, Reason: ${reason || 'Not specified'}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });
}

// New subscriber
export async function notifyMerchantNewSubscriber({
  merchantEmail,
  merchantPhone,
  merchantName,
  customerPhone,
  customerEmail,
  productName,
  priceName,
  amount,
  currency,
}: {
  merchantEmail: string;
  merchantPhone?: string;
  merchantName: string;
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  priceName: string;
  amount: number;
  currency: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  // Email
  const emailResult = await sendEmail({
    to: merchantEmail,
    subject: `🎉 New Subscriber - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1a1a2e;">New Subscriber! 🎉</h2>
          <p>Hi ${merchantName},</p>
          <p>Congratulations! You have a new subscriber.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Product:</td><td style="font-weight: bold;">${productName}</td></tr>
              <tr><td style="color: #666;">Plan:</td><td>${priceName}</td></tr>
              <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold; color: #22c55e;">${formattedAmount}</td></tr>
              <tr><td style="color: #666;">Customer Phone:</td><td>${customerPhone}</td></tr>
              ${customerEmail ? `<tr><td style="color: #666;">Customer Email:</td><td>${customerEmail}</td></tr>` : ''}
            </table>
          </div>
          
          <a href="${APP_URL}/dashboard/subscriptions" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Subscribers
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: merchantEmail,
    recipient_type: 'merchant',
    event_type: 'subscription.new',
    subject: `New Subscriber - ${productName}`,
    body: `Customer: ${customerPhone}, Plan: ${priceName}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });

  // SMS
  if (merchantPhone) {
    const smsResult = await sendSMS({
      to: merchantPhone,
      body: `[Losetify] 🎉 New subscriber! ${customerPhone} subscribed to ${productName} (${priceName}) for ${formattedAmount}.`,
    });

    await logNotification({
      channel: 'sms',
      recipient: merchantPhone,
      recipient_type: 'merchant',
      event_type: 'subscription.new',
      body: `New subscriber for ${productName}`,
      status: smsResult.success ? 'sent' : 'failed',
      error_message: smsResult.error,
    });
  }
}

// Subscription expiring soon
export async function notifyMerchantSubscriptionExpiring({
  merchantEmail,
  merchantPhone,
  merchantName,
  customerPhone,
  productName,
  expiryDate,
  daysUntilExpiry,
}: {
  merchantEmail: string;
  merchantPhone?: string;
  merchantName: string;
  customerPhone: string;
  productName: string;
  expiryDate: string;
  daysUntilExpiry: number;
}) {
  // Email
  const emailResult = await sendEmail({
    to: merchantEmail,
    subject: `⚠️ Subscription Expiring Soon - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #f59e0b;">Subscription Expiring Soon ⚠️</h2>
          <p>Hi ${merchantName},</p>
          <p>A customer's subscription is expiring in ${daysUntilExpiry} days.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Product:</td><td style="font-weight: bold;">${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
              <tr><td style="color: #666;">Expires:</td><td style="color: #f59e0b; font-weight: bold;">${new Date(expiryDate).toLocaleDateString()}</td></tr>
              <tr><td style="color: #666;">Days Left:</td><td style="color: #f59e0b; font-weight: bold;">${daysUntilExpiry} days</td></tr>
            </table>
          </div>
          
          <p style="color: #666;">Consider reaching out to encourage renewal.</p>
          
          <a href="${APP_URL}/dashboard/subscriptions" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Subscriptions
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: merchantEmail,
    recipient_type: 'merchant',
    event_type: 'subscription.expiring',
    subject: `Subscription Expiring Soon - ${productName}`,
    body: `Customer: ${customerPhone}, Expires in ${daysUntilExpiry} days`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });
}

// Subscription expired
export async function notifyMerchantSubscriptionExpired({
  merchantEmail,
  merchantPhone,
  merchantName,
  customerPhone,
  productName,
}: {
  merchantEmail: string;
  merchantPhone?: string;
  merchantName: string;
  customerPhone: string;
  productName: string;
}) {
  // Email
  const emailResult = await sendEmail({
    to: merchantEmail,
    subject: `🔴 Subscription Expired - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #ef4444;">Subscription Expired 🔴</h2>
          <p>Hi ${merchantName},</p>
          <p>A customer's subscription has expired.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Product:</td><td style="font-weight: bold;">${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
              <tr><td style="color: #666;">Status:</td><td style="color: #ef4444; font-weight: bold;">Expired</td></tr>
            </table>
          </div>
          
          <p style="color: #666;">The customer can renew by making a new payment.</p>
          
          <a href="${APP_URL}/dashboard/subscriptions" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Subscriptions
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: merchantEmail,
    recipient_type: 'merchant',
    event_type: 'subscription.expired',
    subject: `Subscription Expired - ${productName}`,
    body: `Customer: ${customerPhone}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });

  // SMS
  if (merchantPhone) {
    const smsResult = await sendSMS({
      to: merchantPhone,
      body: `[Losetify] Subscription expired: ${customerPhone}'s subscription to ${productName} has expired.`,
    });

    await logNotification({
      channel: 'sms',
      recipient: merchantPhone,
      recipient_type: 'merchant',
      event_type: 'subscription.expired',
      body: `Subscription expired for ${productName}`,
      status: smsResult.success ? 'sent' : 'failed',
      error_message: smsResult.error,
    });
  }
}

// Subscription renewed
export async function notifyMerchantSubscriptionRenewed({
  merchantEmail,
  merchantPhone,
  merchantName,
  customerPhone,
  productName,
  amount,
  currency,
  newExpiryDate,
}: {
  merchantEmail: string;
  merchantPhone?: string;
  merchantName: string;
  customerPhone: string;
  productName: string;
  amount: number;
  currency: string;
  newExpiryDate: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  // Email
  const emailResult = await sendEmail({
    to: merchantEmail,
    subject: `🔄 Subscription Renewed - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #22c55e;">Subscription Renewed! 🔄</h2>
          <p>Hi ${merchantName},</p>
          <p>Great news! A customer has renewed their subscription.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Product:</td><td style="font-weight: bold;">${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
              <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold; color: #22c55e;">${formattedAmount}</td></tr>
              <tr><td style="color: #666;">New Expiry:</td><td>${new Date(newExpiryDate).toLocaleDateString()}</td></tr>
            </table>
          </div>
          
          <a href="${APP_URL}/dashboard/subscriptions" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Subscriptions
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: merchantEmail,
    recipient_type: 'merchant',
    event_type: 'subscription.renewed',
    subject: `Subscription Renewed - ${productName}`,
    body: `Customer: ${customerPhone}, Amount: ${formattedAmount}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });

  // SMS
  if (merchantPhone) {
    const smsResult = await sendSMS({
      to: merchantPhone,
      body: `[Losetify] 🔄 Subscription renewed! ${customerPhone} renewed ${productName} for ${formattedAmount}. New expiry: ${new Date(newExpiryDate).toLocaleDateString()}.`,
    });

    await logNotification({
      channel: 'sms',
      recipient: merchantPhone,
      recipient_type: 'merchant',
      event_type: 'subscription.renewed',
      body: `Subscription renewed for ${productName}`,
      status: smsResult.success ? 'sent' : 'failed',
      error_message: smsResult.error,
    });
  }
}

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

// New user signup
export async function notifyAdminNewSignup({
  userEmail,
  userName,
  businessName,
}: {
  userEmail: string;
  userName?: string;
  businessName?: string;
}) {
  const emailResult = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🆕 New User Signup - ${businessName || userEmail}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify Admin</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1a1a2e;">New User Signup! 🆕</h2>
          <p>A new merchant has registered on the platform.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Email:</td><td style="font-weight: bold;">${userEmail}</td></tr>
              ${userName ? `<tr><td style="color: #666;">Name:</td><td>${userName}</td></tr>` : ''}
              ${businessName ? `<tr><td style="color: #666;">Business:</td><td>${businessName}</td></tr>` : ''}
              <tr><td style="color: #666;">Time:</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          
          <a href="${APP_URL}/admin/subscribers" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View in Admin Panel
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify Admin</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: ADMIN_EMAIL,
    recipient_type: 'admin',
    event_type: 'user.signup',
    subject: `New User Signup - ${businessName || userEmail}`,
    body: `User: ${userEmail}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });
}

// Payment needs admin confirmation
export async function notifyAdminPaymentPending({
  merchantName,
  customerPhone,
  amount,
  currency,
  productName,
  referenceCode,
}: {
  merchantName: string;
  customerPhone: string;
  amount: number;
  currency: string;
  productName: string;
  referenceCode: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  const emailResult = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `⏳ Payment Awaiting Confirmation - ${referenceCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify Admin</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #f59e0b;">Payment Awaiting Confirmation ⏳</h2>
          <p>A new payment requires admin verification.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Reference:</td><td style="font-weight: bold;">${referenceCode}</td></tr>
              <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold; color: #22c55e;">${formattedAmount}</td></tr>
              <tr><td style="color: #666;">Merchant:</td><td>${merchantName}</td></tr>
              <tr><td style="color: #666;">Product:</td><td>${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
            </table>
          </div>
          
          <a href="${APP_URL}/admin/payments" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Review & Confirm
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify Admin</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: ADMIN_EMAIL,
    recipient_type: 'admin',
    event_type: 'payment.pending',
    subject: `Payment Awaiting Confirmation - ${referenceCode}`,
    body: `Amount: ${formattedAmount}, Merchant: ${merchantName}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });
}

// Payment confirmed by admin
export async function notifyAdminPaymentConfirmed({
  merchantName,
  customerPhone,
  amount,
  currency,
  productName,
  referenceCode,
  confirmedBy,
}: {
  merchantName: string;
  customerPhone: string;
  amount: number;
  currency: string;
  productName: string;
  referenceCode: string;
  confirmedBy: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  const emailResult = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `✅ Payment Confirmed - ${referenceCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #d4ff00; margin: 0;">Losetify Admin</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #22c55e;">Payment Confirmed ✅</h2>
          <p>A payment has been confirmed.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="color: #666;">Reference:</td><td style="font-weight: bold;">${referenceCode}</td></tr>
              <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold; color: #22c55e;">${formattedAmount}</td></tr>
              <tr><td style="color: #666;">Merchant:</td><td>${merchantName}</td></tr>
              <tr><td style="color: #666;">Product:</td><td>${productName}</td></tr>
              <tr><td style="color: #666;">Customer:</td><td>${customerPhone}</td></tr>
              <tr><td style="color: #666;">Confirmed By:</td><td>${confirmedBy}</td></tr>
              <tr><td style="color: #666;">Time:</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          
          <a href="${APP_URL}/admin/payments" style="display: inline-block; background: #d4ff00; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Payments
          </a>
        </div>
        <div style="background: #1a1a2e; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify Admin</p>
        </div>
      </div>
    `,
  });

  await logNotification({
    channel: 'email',
    recipient: ADMIN_EMAIL,
    recipient_type: 'admin',
    event_type: 'payment.confirmed',
    subject: `Payment Confirmed - ${referenceCode}`,
    body: `Amount: ${formattedAmount}, Confirmed by: ${confirmedBy}`,
    status: emailResult.success ? 'sent' : 'failed',
    error_message: emailResult.error,
  });
}

// ============================================
// CUSTOMER NOTIFICATIONS
// ============================================

// Payment confirmed - notify customer
export async function notifyCustomerPaymentConfirmed({
  customerPhone,
  customerEmail,
  amount,
  currency,
  productName,
  merchantName,
  referenceCode,
  expiryDate,
}: {
  customerPhone: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  productName: string;
  merchantName: string;
  referenceCode: string;
  expiryDate?: string;
}) {
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  
  // SMS to customer
  const smsResult = await sendSMS({
    to: customerPhone,
    body: `✅ Payment confirmed! Your ${productName} subscription from ${merchantName} is now active. Amount: ${formattedAmount}. Ref: ${referenceCode}${expiryDate ? `. Valid until: ${new Date(expiryDate).toLocaleDateString()}` : ''}.`,
  });

  await logNotification({
    channel: 'sms',
    recipient: customerPhone,
    recipient_type: 'customer',
    event_type: 'payment.confirmed',
    body: `Payment confirmed for ${productName}`,
    status: smsResult.success ? 'sent' : 'failed',
    error_message: smsResult.error,
  });

  // Email to customer if available
  if (customerEmail) {
    const emailResult = await sendEmail({
      to: customerEmail,
      subject: `✅ Payment Confirmed - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; padding: 20px; text-align: center;">
            <h1 style="color: #d4ff00; margin: 0;">Losetify</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #22c55e;">Payment Confirmed! ✅</h2>
            <p>Your payment has been confirmed and your subscription is now active.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr><td style="color: #666;">Reference:</td><td style="font-weight: bold;">${referenceCode}</td></tr>
                <tr><td style="color: #666;">Product:</td><td style="font-weight: bold;">${productName}</td></tr>
                <tr><td style="color: #666;">Merchant:</td><td>${merchantName}</td></tr>
                <tr><td style="color: #666;">Amount:</td><td style="font-weight: bold; color: #22c55e;">${formattedAmount}</td></tr>
                ${expiryDate ? `<tr><td style="color: #666;">Valid Until:</td><td>${new Date(expiryDate).toLocaleDateString()}</td></tr>` : ''}
              </table>
            </div>
            
            <p style="color: #666;">Thank you for your purchase!</p>
          </div>
          <div style="background: #1a1a2e; padding: 15px; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Losetify. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    await logNotification({
      channel: 'email',
      recipient: customerEmail,
      recipient_type: 'customer',
      event_type: 'payment.confirmed',
      subject: `Payment Confirmed - ${productName}`,
      body: `Amount: ${formattedAmount}`,
      status: emailResult.success ? 'sent' : 'failed',
      error_message: emailResult.error,
    });
  }
}

// Subscription expiring - notify customer
export async function notifyCustomerSubscriptionExpiring({
  customerPhone,
  customerEmail,
  productName,
  merchantName,
  expiryDate,
  daysUntilExpiry,
  renewalLink,
}: {
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  merchantName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  renewalLink?: string;
}) {
  // SMS
  const smsResult = await sendSMS({
    to: customerPhone,
    body: `⚠️ Your ${productName} subscription from ${merchantName} expires in ${daysUntilExpiry} days (${new Date(expiryDate).toLocaleDateString()}). Renew now to avoid interruption.${renewalLink ? ` ${renewalLink}` : ''}`,
  });

  await logNotification({
    channel: 'sms',
    recipient: customerPhone,
    recipient_type: 'customer',
    event_type: 'subscription.expiring',
    body: `Subscription expiring in ${daysUntilExpiry} days`,
    status: smsResult.success ? 'sent' : 'failed',
    error_message: smsResult.error,
  });
}

// Subscription expired - notify customer
export async function notifyCustomerSubscriptionExpired({
  customerPhone,
  customerEmail,
  productName,
  merchantName,
  renewalLink,
}: {
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  merchantName: string;
  renewalLink?: string;
}) {
  // SMS
  const smsResult = await sendSMS({
    to: customerPhone,
    body: `🔴 Your ${productName} subscription from ${merchantName} has expired. Renew now to restore access.${renewalLink ? ` ${renewalLink}` : ''}`,
  });

  await logNotification({
    channel: 'sms',
    recipient: customerPhone,
    recipient_type: 'customer',
    event_type: 'subscription.expired',
    body: `Subscription expired for ${productName}`,
    status: smsResult.success ? 'sent' : 'failed',
    error_message: smsResult.error,
  });
}
