'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Smartphone, Check, X, Lock, BarChart3, Users, Code, Play, CreditCard, Bell, PieChart, Sparkles, ChevronRight, Star, Package, Video, FileText, MessageSquare, Download } from 'lucide-react';
import { PricingSection } from '@/components/landing/PricingSection';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function HomePage() {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "min-h-screen overflow-hidden",
      theme === 'dark' ? 'bg-dark-950 text-white' : 'bg-white text-gray-900'
    )}>
      {/* Noise Overlay - only in dark mode */}
      {theme === 'dark' && <div className="noise-overlay" />}
      
      {/* Background Gradient Orbs - only in dark mode */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-lemon-400/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-grape-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-lemon-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
        </div>
      )}

      <PublicHeader showUseCases={true} />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center">
          <div className="container mx-auto px-4 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Laptop Mockup */}
              <div className="order-2 lg:order-1 relative">
                <div className="laptop-mockup relative z-10">
                  {/* Laptop Frame */}
                  <div className="relative bg-dark-800 rounded-2xl p-2 shadow-2xl border border-dark-700">
                    {/* Screen */}
                    <div className="bg-dark-900 rounded-xl overflow-hidden aspect-[16/10]">
                      {/* Dashboard Preview */}
                      <div className="p-4 h-full">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-lemon-400 rounded-lg flex items-center justify-center">
                              <span className="text-dark-900 font-bold text-xs">S</span>
                            </div>
                            <span className="text-white text-sm font-semibold">Dashboard</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-danger-500" />
                            <div className="w-2 h-2 rounded-full bg-warning-500" />
                            <div className="w-2 h-2 rounded-full bg-success-500" />
                          </div>
                        </div>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-dark-800/50 rounded-lg p-2">
                            <p className="text-dark-400 text-[8px]">Revenue</p>
                            <p className="text-lemon-400 font-bold text-sm">62.3M SSP</p>
                          </div>
                          <div className="bg-dark-800/50 rounded-lg p-2">
                            <p className="text-dark-400 text-[8px]">Subscribers</p>
                            <p className="text-white font-bold text-sm">1,234</p>
                          </div>
                          <div className="bg-dark-800/50 rounded-lg p-2">
                            <p className="text-dark-400 text-[8px]">Growth</p>
                            <p className="text-success-500 font-bold text-sm">+24%</p>
                          </div>
                        </div>
                        {/* Chart Area */}
                        <div className="bg-dark-800/50 rounded-lg p-2 mb-2">
                          <div className="flex items-end gap-1 h-16">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                              <div 
                                key={i}
                                className="flex-1 bg-gradient-to-t from-lemon-500 to-lemon-300 rounded-sm"
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                        </div>
                        {/* Recent Activity */}
                        <div className="space-y-1">
                          {[
                            { name: 'John D.', amount: '245K SSP', status: 'success' },
                            { name: 'Sarah M.', amount: '495K SSP', status: 'success' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-dark-800/30 rounded px-2 py-1">
                              <span className="text-dark-300 text-[8px]">{item.name}</span>
                              <span className="text-success-500 text-[8px] font-medium">{item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Laptop Base */}
                  <div className="h-4 bg-gradient-to-b from-dark-700 to-dark-800 rounded-b-xl mx-8" />
                  <div className="h-2 bg-dark-800 rounded-b-2xl mx-16 shadow-lg" />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-8 -right-4 bg-dark-800 border border-dark-700 rounded-xl p-3 shadow-xl floating-fast z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-success-500/20 rounded-lg flex items-center justify-center">
                      <Check className="h-4 w-4 text-success-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-dark-400">Payment Confirmed</p>
                      <p className="text-xs font-semibold text-white">+245K SSP</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-dark-800 border border-dark-700 rounded-xl p-3 shadow-xl floating z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-lemon-400/20 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-lemon-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-dark-400">New Subscriber</p>
                      <p className="text-xs font-semibold text-white">Pro Plan</p>
                    </div>
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-lemon-400/10 blur-3xl rounded-full -z-10" />
              </div>
              
              {/* Right side - Text Content */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-lemon-400/10 border border-lemon-400/20 text-lemon-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  <span>Built for South Sudan</span>
                </div>
                
                <h1 className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Payments &{' '}
                  <span className="gradient-text">Subscriptions</span>
                </h1>
                
                <p className={cn(
                  "text-xl mb-4 max-w-xl",
                  theme === 'dark' ? 'text-dark-300' : 'text-gray-600'
                )}>
                  Sell software, digital products, subscriptions — and now monetize content.
                </p>
                
                <p className={cn(
                  "text-lg mb-6 max-w-xl",
                  theme === 'dark' ? 'text-dark-400' : 'text-gray-500'
                )}>
                  Customers pay you directly.<br />
                  We unlock access automatically.
                </p>
                
                <div className={cn(
                  "flex flex-col gap-2 text-sm mb-8",
                  theme === 'dark' ? 'text-dark-400' : 'text-gray-600'
                )}>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-lemon-400" />
                    Works with MTN MoMo & Bank Transfer
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-lemon-400" />
                    No payment APIs. No wallets. No escrow. No risk.
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/auth/register" className="w-full sm:w-auto btn-primary btn-lg group">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto btn-outline btn-lg">
                    <Play className="h-5 w-5 mr-2" />
                    See How It Works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* One-Line Explanation */}
        <section className={cn(
          "py-12",
          theme === 'dark' ? 'bg-dark-900' : 'bg-gray-50'
        )}>
          <div className="container mx-auto px-4 text-center">
            <p className={cn(
              "text-xl md:text-2xl font-medium",
              theme === 'dark' ? 'text-dark-300' : 'text-gray-700'
            )}>
              We verify payments and manage subscriptions — <span className="text-lemon-500">your money goes straight to you.</span>
            </p>
          </div>
        </section>

        {/* Partners / Social Proof */}
        <section className={cn(
          "py-16 border-y",
          theme === 'dark' ? 'border-dark-800' : 'border-gray-200'
        )}>
          <div className="container mx-auto px-4">
            <p className={cn(
              "text-center mb-8",
              theme === 'dark' ? 'text-dark-400' : 'text-gray-500'
            )}>Trusted partners & integrations</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {['MTN MoMo', 'Equity Bank', 'Mgurush', 'TechStartup', 'Digicash'].map((brand, i) => (
                <span key={i} className={cn(
                  "text-xl font-bold opacity-70 hover:opacity-100 transition-opacity",
                  theme === 'dark' ? 'text-dark-300' : 'text-gray-600'
                )}>{brand}</span>
              ))}
            </div>
          </div>
        </section>

        {/* NEW - Creator Studio Section - Always dark */}
        <section id="creator-studio" className="py-20 relative overflow-hidden bg-dark-900">
          <div className="absolute inset-0 bg-gradient-to-br from-grape-500/10 via-transparent to-lemon-400/10" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-grape-500/20 border border-grape-500/30 text-grape-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>NEW — Creator Studio</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
                Monetize Any Content with{' '}
                <span className="gradient-text-purple">PaySSD</span>
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-dark-400">
                Creator Studio is a separate dashboard inside PaySSD that lets creators sell access to content using the same trusted PaySSD subscription system.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="p-6 text-center rounded-2xl border bg-dark-800/50 border-dark-700">
                <div className="w-14 h-14 bg-grape-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="h-7 w-7 text-grape-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Creators publish content</h3>
              </div>
              <div className="p-6 text-center rounded-2xl border bg-dark-800/50 border-dark-700">
                <div className="w-14 h-14 bg-lemon-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-7 w-7 text-lemon-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Fans pay directly</h3>
              </div>
              <div className="p-6 text-center rounded-2xl border bg-dark-800/50 border-dark-700">
                <div className="w-14 h-14 bg-success-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-7 w-7 text-success-500" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">PaySSD controls access</h3>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-center mb-8 text-white">What creators can monetize:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                  { icon: Video, title: 'Video embeds', desc: 'YouTube, Facebook, Instagram' },
                  { icon: FileText, title: 'Blog posts & articles', desc: 'Written content' },
                  { icon: Download, title: 'File downloads', desc: 'PDFs, audio, guides' },
                  { icon: MessageSquare, title: 'Members-only community', desc: 'Private discussions' },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-5 text-center border bg-dark-800/50 border-dark-700 hover:border-grape-500/50 transition-all">
                    <item.icon className="h-8 w-8 text-grape-400 mx-auto mb-3" />
                    <p className="font-semibold text-sm text-white">{item.title}</p>
                    <p className="text-xs mt-1 text-dark-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-8 text-center border bg-dark-800/50 border-dark-700">
                <p className="text-lg mb-2 text-dark-300">Creators share one PaySSD link.</p>
                <p className="text-lg mb-2 text-dark-300">Paid users unlock content.</p>
                <p className="text-lg text-dark-300">Others see a paywall.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Link href="/creator" className="btn-primary btn-lg group">
                  Start Creator Studio
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/use-cases/creators" className="btn-outline btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className={cn("py-20", theme === 'dark' ? 'bg-dark-950' : 'bg-white')}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="badge-grape mb-4">Who It's For</span>
              <h2 className={cn("text-3xl md:text-4xl font-black mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Built for</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              {[
                { icon: Code, label: 'SaaS & Software Companies', desc: 'Sell licenses, subscriptions, and access' },
                { icon: Smartphone, label: 'App Developers', desc: 'Control features and usage with subscription logic' },
                { icon: Package, label: 'Digital Product Sellers', desc: 'Sell downloads, tools, and services' },
                { icon: Globe, label: 'Online Services', desc: 'Lock access based on payment status' },
              ].map((item, i) => (
                <div key={i} className={cn(
                  "text-center p-6 rounded-2xl border hover:border-lemon-400/30 transition-all",
                  theme === 'dark' ? 'bg-dark-800/50 border-dark-700' : 'bg-gray-50 border-gray-200'
                )}>
                  <item.icon className="h-8 w-8 text-lemon-500 mx-auto mb-3" />
                  <p className={cn("font-semibold text-sm mb-1", theme === 'dark' ? 'text-white' : 'text-gray-900')}>{item.label}</p>
                  <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-grape-500 mb-4">Creators & Media</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {['Content creators', 'Bloggers & journalists', 'Educators & coaches', 'Public figures & communities'].map((item, i) => (
                  <span key={i} className={cn(
                    "px-4 py-2 rounded-lg text-sm",
                    theme === 'dark' ? 'bg-dark-800/50 text-dark-300' : 'bg-gray-100 text-gray-700'
                  )}>{item}</span>
                ))}
              </div>
            </div>
            
            <p className={cn("text-center text-lg", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
              If you sell access, licenses, downloads, or content — <span className="text-lemon-500">this is for you.</span>
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className={cn("py-20", theme === 'dark' ? 'bg-dark-950' : 'bg-gray-50')}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="badge-lemon mb-4">Access Control</span>
              <h2 className={cn("text-3xl md:text-5xl font-black mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                The Real{' '}
                <span className="gradient-text">Value We Provide</span>
              </h2>
              <p className={cn("text-xl max-w-2xl mx-auto", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                We are not a payment processor. We are a subscription & access control platform.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Lock, title: 'Auto Lock & Unlock', desc: 'Automatically lock and unlock subscriptions and content based on payment status.' },
                { icon: Video, title: 'Creator Studio Access Control', desc: 'Use PaySSD watch pages, gated blog posts, secure downloads, and private communities — all unlocked only for paid users.' },
                { icon: Code, title: 'API Keys', desc: 'API keys for apps & websites. Perfect for software, SaaS, and digital products.' },
                { icon: PieChart, title: 'No-Code Dashboard', desc: 'No-code dashboard for non-technical sellers and creators. View payments and confirm in one click.' },
                { icon: CreditCard, title: 'MTN MoMo & Bank', desc: 'MTN MoMo and bank transfer support. Guest checkout, no customer login required.' },
                { icon: Users, title: 'Customer Management', desc: 'See active subscribers, track revenue & growth, export customer data.' },
                { icon: Smartphone, title: 'Mobile-First', desc: 'Built for South Sudan, expanding to East Africa. Optimized for mobile users.' },
                { icon: Zap, title: 'Start in Minutes', desc: 'No bank approvals. No MoMo API needed. No legal headache. Scales as you grow.' },
                { icon: Globe, title: 'Multi-Currency', desc: 'Support for SSP and USD, with more African currencies coming.' },
                { icon: Shield, title: 'No Fund Holding', desc: 'Customer pays you directly. We never hold funds. No wallets. No escrow.' },
              ].map((feature, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-2xl border transition-all hover:border-lemon-400/30",
                  theme === 'dark' ? 'bg-dark-800/50 border-dark-700' : 'bg-white border-gray-200 shadow-sm'
                )}>
                  <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-lemon-500" />
                  </div>
                  <h3 className={cn("text-lg font-bold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>{feature.title}</h3>
                  <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Always dark */}
        <section id="how-it-works" className="py-20 bg-dark-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="badge-grape mb-4">How It Works</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
                Three steps to{' '}
                <span className="gradient-text-purple">start selling</span>
              </h2>
              <p className="text-xl text-dark-400">That's it. Simple.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              {[
                { num: '01', title: 'Create a Product', desc: 'Set price, currency (SSP or USD), and billing (one-time, recurring, or trial).' },
                { num: '02', title: 'Share Checkout or Content Link', desc: 'Share a PaySSD checkout link or a PaySSD content link.' },
                { num: '03', title: 'Access Unlocks', desc: 'You confirm payment → we activate access automatically.' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="p-8 h-full rounded-2xl border bg-dark-800/50 border-dark-700 hover:border-lemon-400/30 transition-all duration-300 group">
                    <span className="text-6xl font-black text-dark-700 group-hover:text-lemon-400/20 transition-colors">{step.num}</span>
                    <h3 className="text-xl font-bold mt-4 mb-3 text-white">{step.title}</h3>
                    <p className="text-dark-400">{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="h-8 w-8 text-dark-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* For Creators */}
            <div className="max-w-5xl mx-auto">
              <h3 className="text-2xl font-bold text-grape-400 text-center mb-8">For Creators</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { num: '01', title: 'Publish Content', desc: 'Create videos, blog posts, files, or community posts inside Creator Studio.' },
                  { num: '02', title: 'Share PaySSD Link', desc: 'Share one branded PaySSD link with your audience.' },
                  { num: '03', title: 'Access Unlocks', desc: 'Paid users unlock content. Others see a paywall.' },
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className="p-8 h-full rounded-2xl border bg-dark-800/50 border-grape-500/20 hover:border-grape-500/30 transition-all duration-300 group">
                      <span className="text-6xl font-black text-dark-700 group-hover:text-grape-500/20 transition-colors">{step.num}</span>
                      <h3 className="text-xl font-bold mt-4 mb-3 text-white">{step.title}</h3>
                      <p className="text-dark-400">{step.desc}</p>
                    </div>
                    {i < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ChevronRight className="h-8 w-8 text-dark-700" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Payment Transparency */}
        <section className={cn("py-20", theme === 'dark' ? 'bg-dark-950' : 'bg-gray-50')}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="badge-lemon mb-4">Payment Transparency</span>
                <h2 className={cn("text-3xl md:text-4xl font-black mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  Your money. <span className="gradient-text">Your control.</span>
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className={cn(
                  "p-8 text-center rounded-2xl border",
                  theme === 'dark' ? 'bg-dark-800/50 border-lemon-400/20' : 'bg-white border-lemon-200 shadow-sm'
                )}>
                  <div className="w-16 h-16 bg-lemon-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-lemon-500" />
                  </div>
                  <h3 className={cn("text-lg font-bold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Customer</h3>
                  <p className="text-lemon-500 font-semibold">Pays you directly</p>
                </div>
                <div className={cn(
                  "p-8 text-center rounded-2xl border",
                  theme === 'dark' ? 'bg-dark-800/50 border-success-500/20' : 'bg-white border-success-200 shadow-sm'
                )}>
                  <div className="w-16 h-16 bg-success-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-success-500" />
                  </div>
                  <h3 className={cn("text-lg font-bold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>You</h3>
                  <p className="text-success-500 font-semibold">Receive money instantly</p>
                </div>
                <div className={cn(
                  "p-8 text-center rounded-2xl border",
                  theme === 'dark' ? 'bg-dark-800/50 border-dark-700' : 'bg-white border-gray-200 shadow-sm'
                )}>
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                    theme === 'dark' ? 'bg-dark-700' : 'bg-gray-100'
                  )}>
                    <X className={cn("h-8 w-8", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
                  </div>
                  <h3 className={cn("text-lg font-bold mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>PaySSD</h3>
                  <p className={cn("font-semibold", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Never holds funds</p>
                </div>
              </div>
              
              <p className={cn("text-center mt-8", theme === 'dark' ? 'text-dark-500' : 'text-gray-500')}>No wallets. No delays. No financial risk.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section - Dynamic from Database */}
        <PricingSection />

        {/* Testimonials */}
        <section className={cn("py-20", theme === 'dark' ? 'bg-dark-950' : 'bg-white')}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="badge-grape mb-4">Testimonials</span>
              <h2 className={cn("text-3xl md:text-4xl font-black", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Loved by <span className="gradient-text-purple">African businesses & creators</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { name: 'John M.', role: 'SaaS Founder, Juba', quote: 'Finally a solution that works for South Sudan. No more chasing payments manually.' },
                { name: 'Sarah K.', role: 'Digital Creator, Nairobi', quote: 'Setup took 5 minutes. Now I focus on creating content, not collecting payments.' },
                { name: 'David O.', role: 'App Developer, Kampala', quote: 'The API is clean and the webhooks work perfectly. Exactly what I needed.' },
              ].map((testimonial, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-2xl border",
                  theme === 'dark' ? 'bg-dark-800/50 border-dark-700' : 'bg-gray-50 border-gray-200'
                )}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-lemon-400 text-lemon-400" />
                    ))}
                  </div>
                  <p className={cn("mb-6", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>"{testimonial.quote}"</p>
                  <div>
                    <p className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>{testimonial.name}</p>
                    <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Always dark */}
        <section className="py-20 relative overflow-hidden bg-dark-900">
          <div className="absolute inset-0 bg-gradient-to-r from-lemon-400/10 via-transparent to-grape-500/10" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
                Start Selling <span className="gradient-text">Today</span>
              </h2>
              <p className="text-xl mb-6 text-dark-300">
                Sell software, subscriptions, digital products — or monetize your content.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8 text-dark-400">
                <span>No setup fees.</span>
                <span>•</span>
                <span>No money held.</span>
                <span>•</span>
                <span>No risk.</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register" className="btn-primary btn-lg group">
                  Create Account
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact" className="btn-outline btn-lg">
                  Talk to Sales
                </Link>
              </div>
              <p className="mt-6 text-sm text-dark-500">No credit card required • Free forever plan available</p>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
