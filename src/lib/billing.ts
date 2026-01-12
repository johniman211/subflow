import { createClient } from '@/lib/supabase/client';
import { createServiceRoleClient } from '@/lib/supabase/server';

export interface PlatformPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: {
    max_subscribers: number;
    api_access: boolean;
    webhooks: boolean;
    custom_branding: boolean;
    analytics: string;
  };
  is_active: boolean;
  is_featured: boolean;
  trial_days: number;
  sort_order: number;
}

export interface PlatformSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
  current_period_start: string;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  plan?: PlatformPlan;
}

export interface SubscriberLimit {
  current_count: number;
  max_allowed: number;
  is_at_limit: boolean;
  can_add: boolean;
}

export function generateBillingReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BIL-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getUserPlan(userId: string): Promise<{ plan: PlatformPlan | null; subscription: PlatformSubscription | null }> {
  const supabase = createClient();
  
  const { data: subscription } = await supabase
    .from('platform_subscriptions')
    .select('*, plan:platform_plans(*)')
    .eq('user_id', userId)
    .single();

  if (subscription) {
    return {
      plan: subscription.plan as PlatformPlan,
      subscription: subscription as PlatformSubscription
    };
  }

  // Return free plan as default
  const { data: freePlan } = await supabase
    .from('platform_plans')
    .select('*')
    .eq('slug', 'free')
    .single();

  return {
    plan: freePlan as PlatformPlan,
    subscription: null
  };
}

export async function checkSubscriberLimit(userId: string): Promise<SubscriberLimit> {
  const supabase = createClient();
  
  // Get user's current plan and subscriber count
  const { data: user } = await supabase
    .from('users')
    .select('subscriber_count, platform_plan_id, platform_plans(*)')
    .eq('id', userId)
    .single();

  const subscriberCount = user?.subscriber_count || 0;
  const plan = user?.platform_plans as PlatformPlan | null;
  const maxSubscribers = plan?.limits?.max_subscribers ?? 50;

  return {
    current_count: subscriberCount,
    max_allowed: maxSubscribers,
    is_at_limit: maxSubscribers !== -1 && subscriberCount >= maxSubscribers,
    can_add: maxSubscribers === -1 || subscriberCount < maxSubscribers
  };
}

export async function canUseFeature(userId: string, feature: keyof PlatformPlan['limits']): Promise<boolean> {
  const { plan } = await getUserPlan(userId);
  
  if (!plan) return false;
  
  const value = plan.limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return true;
}

export async function getTrialDaysRemaining(userId: string): Promise<number> {
  const supabase = createClient();
  
  const { data: subscription } = await supabase
    .from('platform_subscriptions')
    .select('trial_end, status')
    .eq('user_id', userId)
    .single();

  if (!subscription || subscription.status !== 'trialing' || !subscription.trial_end) {
    return 0;
  }

  const trialEnd = new Date(subscription.trial_end);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining);
}

export async function startProTrial(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Get Pro plan
  const { data: proPlan } = await supabase
    .from('platform_plans')
    .select('*')
    .eq('slug', 'pro')
    .single();

  if (!proPlan) return false;

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + (proPlan.trial_days || 3));

  // Create or update subscription
  const { error } = await supabase
    .from('platform_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: proPlan.id,
      status: 'trialing',
      current_period_start: new Date().toISOString(),
      current_period_end: trialEnd.toISOString(),
      trial_start: new Date().toISOString(),
      trial_end: trialEnd.toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Failed to start trial:', error);
    return false;
  }

  // Update user's plan
  await supabase
    .from('users')
    .update({ platform_plan_id: proPlan.id })
    .eq('id', userId);

  return true;
}

export async function getAdminPaymentInfo(): Promise<any> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'payment_info')
    .single();

  return data?.value || null;
}

export async function isUserPlatformAdmin(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', userId)
    .single();

  return data?.is_platform_admin || false;
}
