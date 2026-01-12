'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlatformPlan, PlatformSubscription, SubscriberLimit, checkSubscriberLimit, getUserPlan, getTrialDaysRemaining } from '@/lib/billing';

interface BillingContextType {
  plan: PlatformPlan | null;
  subscription: PlatformSubscription | null;
  limits: SubscriberLimit | null;
  trialDaysRemaining: number;
  isLoading: boolean;
  showUpgradeModal: boolean;
  upgradeReason: string;
  setShowUpgradeModal: (show: boolean) => void;
  checkAndShowUpgradeModal: (reason?: string) => Promise<boolean>;
  refreshBilling: () => Promise<void>;
  canUseFeature: (feature: string) => boolean;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlatformPlan | null>(null);
  const [subscription, setSubscription] = useState<PlatformSubscription | null>(null);
  const [limits, setLimits] = useState<SubscriberLimit | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const refreshBilling = useCallback(async () => {
    if (!userId) return;
    
    try {
      const [planData, limitData, trialDays] = await Promise.all([
        getUserPlan(userId),
        checkSubscriberLimit(userId),
        getTrialDaysRemaining(userId)
      ]);

      setPlan(planData.plan);
      setSubscription(planData.subscription);
      setLimits(limitData);
      setTrialDaysRemaining(trialDays);
    } catch (error) {
      console.error('Error refreshing billing:', error);
    }
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
      }
      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (userId) {
      refreshBilling();
    }
  }, [userId, refreshBilling]);

  const checkAndShowUpgradeModal = useCallback(async (reason?: string): Promise<boolean> => {
    if (!userId) return true;

    const limitData = await checkSubscriberLimit(userId);
    setLimits(limitData);

    if (limitData.is_at_limit) {
      setUpgradeReason(reason || 'You have reached your subscriber limit');
      setShowUpgradeModal(true);
      return false;
    }

    return true;
  }, [userId]);

  const canUseFeature = useCallback((feature: string): boolean => {
    if (!plan) return false;
    
    const limits = plan.limits as any;
    const value = limits[feature];
    
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    return true;
  }, [plan]);

  return (
    <BillingContext.Provider
      value={{
        plan,
        subscription,
        limits,
        trialDaysRemaining,
        isLoading,
        showUpgradeModal,
        upgradeReason,
        setShowUpgradeModal,
        checkAndShowUpgradeModal,
        refreshBilling,
        canUseFeature,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
