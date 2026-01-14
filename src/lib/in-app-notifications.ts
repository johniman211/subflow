import { createServiceRoleClient } from '@/lib/supabase/server';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export async function createInAppNotification({
  userId,
  type,
  title,
  body,
  link,
  metadata = {},
}: CreateNotificationParams) {
  try {
    const supabase = createServiceRoleClient();
    
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      body,
      link,
      metadata,
    });

    if (error) {
      console.error('Error creating in-app notification:', error);
    }
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
}

// Payment notifications
export async function notifyPaymentReceived(merchantId: string, params: {
  customerPhone: string;
  amount: number;
  currency: string;
  productName: string;
  referenceCode: string;
}) {
  await createInAppNotification({
    userId: merchantId,
    type: 'payment_received',
    title: 'New Payment Received',
    body: `${params.customerPhone} paid ${params.currency} ${params.amount.toLocaleString()} for ${params.productName}`,
    link: '/dashboard/payments',
    metadata: params,
  });
}

export async function notifyPaymentConfirmed(merchantId: string, params: {
  customerPhone: string;
  amount: number;
  currency: string;
  productName: string;
  referenceCode: string;
}) {
  await createInAppNotification({
    userId: merchantId,
    type: 'payment_confirmed',
    title: 'Payment Confirmed',
    body: `Payment of ${params.currency} ${params.amount.toLocaleString()} from ${params.customerPhone} has been confirmed`,
    link: '/dashboard/payments',
    metadata: params,
  });
}

export async function notifyNewSubscriber(merchantId: string, params: {
  customerPhone: string;
  productName: string;
  priceName: string;
}) {
  await createInAppNotification({
    userId: merchantId,
    type: 'new_subscriber',
    title: 'New Subscriber!',
    body: `${params.customerPhone} subscribed to ${params.productName} (${params.priceName})`,
    link: '/dashboard/subscriptions',
    metadata: params,
  });
}

export async function notifySubscriptionRenewed(merchantId: string, params: {
  customerPhone: string;
  productName: string;
  newExpiryDate: string;
}) {
  await createInAppNotification({
    userId: merchantId,
    type: 'subscription_renewed',
    title: 'Subscription Renewed',
    body: `${params.customerPhone} renewed ${params.productName}`,
    link: '/dashboard/subscriptions',
    metadata: params,
  });
}

export async function notifySubscriptionExpiring(merchantId: string, params: {
  customerPhone: string;
  productName: string;
  expiryDate: string;
}) {
  await createInAppNotification({
    userId: merchantId,
    type: 'subscription_expiring',
    title: 'Subscription Expiring Soon',
    body: `${params.customerPhone}'s subscription to ${params.productName} expires soon`,
    link: '/dashboard/subscriptions',
    metadata: params,
  });
}

export async function notifySubscriptionExpired(merchantId: string, params: {
  customerPhone: string;
  productName: string;
}) {
  await createInAppNotification({
    userId: merchantId,
    type: 'subscription_expired',
    title: 'Subscription Expired',
    body: `${params.customerPhone}'s subscription to ${params.productName} has expired`,
    link: '/dashboard/subscriptions',
    metadata: params,
  });
}

// Admin notifications
export async function notifyAdminNewUser(adminId: string, params: {
  userEmail: string;
  userName?: string;
}) {
  await createInAppNotification({
    userId: adminId,
    type: 'new_user',
    title: 'New User Registered',
    body: `${params.userName || params.userEmail} just signed up`,
    link: '/admin/subscribers',
    metadata: params,
  });
}

export async function notifyAdminPayment(adminId: string, params: {
  merchantName: string;
  amount: number;
  currency: string;
  status: string;
}) {
  await createInAppNotification({
    userId: adminId,
    type: 'platform_payment',
    title: `Platform Payment ${params.status}`,
    body: `${params.merchantName} - ${params.currency} ${params.amount.toLocaleString()}`,
    link: '/admin/payments',
    metadata: params,
  });
}
