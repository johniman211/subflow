'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_featured: boolean;
  trial_days: number;
}

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('platform_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (data) {
      const formattedPlans = data.map(p => ({
        ...p,
        features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features || [],
      }));
      setPlans(formattedPlans);
    }
    setLoading(false);
  };

  // Fallback plans if database is empty
  const fallbackPlans: Plan[] = [
    {
      id: '1',
      name: 'Starter',
      slug: 'free',
      description: 'Perfect for getting started',
      price_monthly: 0,
      price_yearly: 0,
      features: ['Up to 50 subscribers', 'Basic dashboard', 'Email support', 'Checkout links'],
      is_featured: false,
      trial_days: 0,
    },
    {
      id: '2',
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses',
      price_monthly: 29,
      price_yearly: 290,
      features: ['Unlimited subscribers', 'Advanced analytics', 'Priority support', 'API access', 'Webhooks', 'Custom branding'],
      is_featured: true,
      trial_days: 3,
    },
    {
      id: '3',
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large organizations',
      price_monthly: 0,
      price_yearly: 0,
      features: ['Everything in Pro', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'On-premise option'],
      is_featured: false,
      trial_days: 0,
    },
  ];

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;

  if (loading) {
    return (
      <section id="pricing" className="section-darker">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge-lemon mb-4">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Start free. <span className="gradient-text">Upgrade when you grow.</span>
            </h2>
          </div>
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-lemon-400" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="section-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="badge-lemon mb-4">Pricing</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Start free. <span className="gradient-text">Upgrade when you grow.</span>
          </h2>
          <p className="text-xl text-dark-400">Simple monthly pricing for merchants.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {displayPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.is_featured ? 'popular' : ''}`}
            >
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-dark-400 mb-6">{plan.description}</p>
              <div className="mb-6">
                {plan.slug === 'enterprise' && plan.price_monthly === 0 ? (
                  <span className="text-4xl font-black text-white">Custom</span>
                ) : (
                  <>
                    <span className="text-4xl font-black text-white">${plan.price_monthly}</span>
                    <span className="text-dark-400">/month</span>
                  </>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features?.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-dark-300">
                    <Check className="h-5 w-5 text-lemon-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {plan.slug === 'enterprise' ? (
                <Link href="/contact" className="btn-secondary w-full">
                  Contact Sales
                </Link>
              ) : plan.slug === 'free' ? (
                <Link href="/auth/register" className="btn-secondary w-full">
                  Get Started
                </Link>
              ) : (
                <Link href="/auth/register" className="btn-primary w-full">
                  {plan.trial_days > 0 ? 'Start Free Trial' : 'Get Started'}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
