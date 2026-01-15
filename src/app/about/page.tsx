'use client';

import Link from 'next/link';
import { ArrowRight, Globe, Users, Shield, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { PublicLayout } from '@/components/public/PublicLayout';

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">About Us</p>
          <h1 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-black mb-6",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>About PaySSD</h1>
          <p className={cn(
            "text-xl max-w-2xl mx-auto",
            theme === 'dark' ? 'text-dark-300' : 'text-gray-600'
          )}>
            We're building the subscription infrastructure for emerging markets, 
            starting with South Sudan and expanding across East Africa.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className={cn(
            "text-3xl font-bold mb-6 text-center",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>Our Mission</h2>
          <p className={cn(
            "text-lg text-center mb-12",
            theme === 'dark' ? 'text-dark-300' : 'text-gray-600'
          )}>
            To empower local businesses to accept recurring payments and manage subscriptions 
            without the complexity of traditional payment processors.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Globe, color: 'lemon', title: 'Built for Africa', desc: "We understand the unique challenges of doing business in emerging markets. Our platform is designed from the ground up for mobile money and local payment methods." },
              { icon: Shield, color: 'grape', title: 'Trust & Transparency', desc: "We never hold your funds. Payments go directly from customer to merchant. We only verify and manage access." },
              { icon: Users, color: 'lemon', title: 'Merchant First', desc: "We're building tools that make it easy for anyone to start selling subscriptions, regardless of technical expertise." },
              { icon: Zap, color: 'grape', title: 'Simple & Fast', desc: "Start accepting payments in minutes. No bank approvals, no complex integrations, no legal headaches." },
            ].map((item, i) => (
              <div key={i} className={cn(
                "rounded-2xl p-8 border",
                theme === 'dark' ? 'bg-dark-900/50 border-dark-800' : 'bg-white border-gray-200 shadow-sm'
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  item.color === 'lemon' ? 'bg-lemon-400/20' : 'bg-grape-500/20'
                )}>
                  <item.icon className={cn("h-6 w-6", item.color === 'lemon' ? 'text-lemon-400' : 'text-grape-400')} />
                </div>
                <h3 className={cn("text-xl font-bold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>{item.title}</h3>
                <p className={theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className={cn(
            "text-3xl font-bold mb-8 text-center",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>Our Story</h2>
          <div className={cn(
            "rounded-2xl p-8 md:p-12 space-y-6 border",
            theme === 'dark' ? 'bg-dark-900/50 border-dark-800' : 'bg-white border-gray-200 shadow-sm'
          )}>
            <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
              PaySSD was born out of a simple observation: businesses in South Sudan and East Africa 
              struggle to accept recurring payments for their digital products and services.
            </p>
            <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
              Traditional payment processors require complex integrations, bank approvals, and often 
              don't support local payment methods like MTN Mobile Money. We saw an opportunity to 
              build something different.
            </p>
            <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
              Instead of trying to be another payment processor, we focused on what businesses really need: 
              a way to verify payments and control access to their products. Let the money flow directly 
              between customer and merchant – we just make sure the right people get access.
            </p>
            <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
              Today, PaySSD powers subscriptions for SaaS founders, app developers, and digital sellers 
              across the region. We're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className={cn(
            "max-w-3xl mx-auto rounded-3xl p-8 md:p-12 text-center border",
            theme === 'dark' 
              ? 'bg-gradient-to-br from-lemon-400/10 to-grape-500/10 border-lemon-400/20' 
              : 'bg-gradient-to-br from-lemon-50 to-grape-50 border-lemon-200'
          )}>
            <h2 className={cn(
              "text-3xl font-bold mb-6",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>Ready to get started?</h2>
            <p className={cn("mb-8", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>Join merchants across South Sudan using PaySSD</p>
            <Link href="/auth/register" className="btn-primary btn-lg inline-flex items-center gap-2">
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
