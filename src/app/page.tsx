'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Smartphone, Check, X, Lock, BarChart3, Users, Code, Play, CreditCard, Bell, PieChart, Sparkles, ChevronRight, Star, Menu, XIcon, Package } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-lemon-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-grape-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-lemon-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center shadow-lemon">
                <span className="text-dark-900 font-black text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-white">Losetify</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">How It Works</Link>
              <Link href="#pricing" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
              <Link href="/docs" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">Docs</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary btn-sm">
                Get Started Free
              </Link>
            </div>
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-dark-800 pt-4">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-dark-300 hover:text-white text-sm font-medium">Features</Link>
                <Link href="#how-it-works" className="text-dark-300 hover:text-white text-sm font-medium">How It Works</Link>
                <Link href="#pricing" className="text-dark-300 hover:text-white text-sm font-medium">Pricing</Link>
                <Link href="/docs" className="text-dark-300 hover:text-white text-sm font-medium">Docs</Link>
                <hr className="border-dark-800" />
                <Link href="/auth/login" className="text-dark-300 hover:text-white text-sm font-medium">Sign In</Link>
                <Link href="/auth/register" className="btn-primary text-center">Get Started Free</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative">
        {/* Hero Section - Lemon Squeezy Style */}
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
                            <p className="text-lemon-400 font-bold text-sm">$12,459</p>
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
                            { name: 'John D.', amount: '$49', status: 'success' },
                            { name: 'Sarah M.', amount: '$99', status: 'success' },
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
                      <p className="text-xs font-semibold text-white">+$49.00</p>
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
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  Payments &{' '}
                  <span className="gradient-text">Subscriptions</span>
                </h1>
                
                <p className="text-xl text-dark-300 mb-4 max-w-xl">
                  Sell software, digital products, and subscriptions.<br />
                  Accept one-time or recurring payments.<br />
                  Customers pay you directly. We unlock access automatically.
                </p>
                
                <div className="flex flex-col gap-2 text-dark-400 text-sm mb-8">
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
                    Start Free
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
        <section className="py-12 bg-dark-900">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl md:text-2xl text-dark-300 font-medium">
              We verify payments and manage subscriptions — <span className="text-lemon-400">your money goes straight to you.</span>
            </p>
          </div>
        </section>

        {/* Partners / Social Proof */}
        <section className="py-16 border-y border-dark-800">
          <div className="container mx-auto px-4">
            <p className="text-center text-dark-400 mb-8">Trusted partners & integrations</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {['MTN MoMo', 'Equity Bank', 'PaySSD', 'TechStartup', 'Digicash'].map((brand, i) => (
                <span key={i} className="text-xl font-bold text-dark-300 opacity-70 hover:opacity-100 transition-opacity">{brand}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="section-dark">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="badge-grape mb-4">Who It's For</span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Built for</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Code, label: 'SaaS & Software Companies' },
                { icon: Smartphone, label: 'App Developers' },
                { icon: Package, label: 'Digital Product Sellers' },
                { icon: Globe, label: 'Online Services' },
              ].map((item, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-lemon-400/30 transition-all">
                  <item.icon className="h-8 w-8 text-lemon-400 mx-auto mb-3" />
                  <p className="font-semibold text-white text-sm">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-dark-400 mt-8 text-lg">
              If you sell access, licenses, or downloads — <span className="text-lemon-400">this is for you.</span>
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="section-dark">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="badge-lemon mb-4">Access Control</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4">
                The Real{' '}
                <span className="gradient-text">Value We Provide</span>
              </h2>
              <p className="text-xl text-dark-400 max-w-2xl mx-auto">
                We are not a payment processor. We are a subscription & access control platform.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Lock, title: 'Auto Lock & Unlock', desc: 'Automatically lock & unlock subscriptions based on payment status.' },
                { icon: Code, title: 'API Keys', desc: 'API keys for apps & websites. Perfect for software, SaaS, and digital products.' },
                { icon: PieChart, title: 'No-Code Dashboard', desc: 'No-code dashboard for non-technical sellers. View payments, confirm in one click.' },
                { icon: CreditCard, title: 'MTN MoMo & Bank', desc: 'MTN MoMo support and bank transfer support. Guest checkout, no customer login.' },
                { icon: Users, title: 'Customer Management', desc: 'See active subscribers, track revenue & growth, export customer data.' },
                { icon: Smartphone, title: 'Mobile-First', desc: 'Built for South Sudan, expanding to East Africa. Mobile-first design.' },
                { icon: Zap, title: 'Start in Minutes', desc: 'No bank approvals, no MoMo API needed, no legal headache. Scales as you grow.' },
                { icon: Globe, title: 'Multi-Currency', desc: 'Support for SSP, USD, and expanding to more African currencies.' },
                { icon: Shield, title: 'No Fund Holding', desc: 'Customer pays you directly. We never hold funds. No wallets, no escrow.' },
              ].map((feature, i) => (
                <div key={i} className="feature-card">
                  <div className="icon">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-dark-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section-darker">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="badge-grape mb-4">How It Works</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4">
                Three steps to{' '}
                <span className="gradient-text-purple">start selling</span>
              </h2>
              <p className="text-xl text-dark-400">That's it. Simple.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { num: '01', title: 'Create a Product', desc: 'Set price, currency (SSP or USD), and billing (one-time, recurring, or trial period).' },
                { num: '02', title: 'Share Checkout Link', desc: 'Customer pays you directly via MTN MoMo or bank transfer.' },
                { num: '03', title: 'Access Unlocks', desc: 'You confirm payment → we activate the subscription or delivery. Money goes to you.' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="card p-8 h-full hover:border-lemon-400/30 transition-all duration-300 group">
                    <span className="text-6xl font-black text-dark-800 group-hover:text-lemon-400/20 transition-colors">{step.num}</span>
                    <h3 className="text-xl font-bold text-white mt-4 mb-3">{step.title}</h3>
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
        </section>

        {/* Payment Transparency */}
        <section className="section-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="badge-lemon mb-4">Payment Transparency</span>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  Your money, <span className="gradient-text">your control</span>
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card-lemon p-8 text-center">
                  <div className="w-16 h-16 bg-lemon-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-lemon-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Customer</h3>
                  <p className="text-lemon-400 font-semibold">Pays you directly</p>
                </div>
                <div className="card-lemon p-8 text-center">
                  <div className="w-16 h-16 bg-success-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-success-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">You</h3>
                  <p className="text-success-500 font-semibold">Receive money instantly</p>
                </div>
                <div className="card p-8 text-center">
                  <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-dark-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Losetify</h3>
                  <p className="text-dark-400 font-semibold">Never holds funds</p>
                </div>
              </div>
              
              <p className="text-center text-dark-500 mt-8">No wallets. No delays. No financial risk.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
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
              {/* Free Tier */}
              <div className="pricing-card">
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <p className="text-dark-400 mb-6">Perfect for getting started</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-dark-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Up to 50 subscribers', 'Basic dashboard', 'Email support', 'Checkout links'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-dark-300">
                      <Check className="h-5 w-5 text-lemon-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="btn-secondary w-full">
                  Get Started
                </Link>
              </div>
              
              {/* Pro Tier */}
              <div className="pricing-card popular">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <p className="text-dark-400 mb-6">For growing businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">$29</span>
                  <span className="text-dark-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Unlimited subscribers', 'Advanced analytics', 'Priority support', 'API access', 'Webhooks', 'Custom branding'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-dark-300">
                      <Check className="h-5 w-5 text-lemon-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="btn-primary w-full">
                  Start Free Trial
                </Link>
              </div>
              
              {/* Enterprise */}
              <div className="pricing-card">
                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-dark-400 mb-6">For large organizations</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">Custom</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Pro', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'On-premise option'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-dark-300">
                      <Check className="h-5 w-5 text-lemon-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="btn-secondary w-full">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-dark">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="badge-grape mb-4">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-black">
                Loved by <span className="gradient-text-purple">African businesses</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { name: 'John M.', role: 'SaaS Founder, Juba', quote: 'Finally a solution that works for South Sudan! No more chasing payments manually.' },
                { name: 'Sarah K.', role: 'Digital Creator, Nairobi', quote: 'Setup took 5 minutes. Now I focus on creating content, not collecting payments.' },
                { name: 'David O.', role: 'App Developer, Kampala', quote: 'The API is clean and the webhooks work perfectly. Exactly what I needed.' },
              ].map((testimonial, i) => (
                <div key={i} className="card p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-lemon-400 text-lemon-400" />
                    ))}
                  </div>
                  <p className="text-dark-300 mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-dark-400">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-darker relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-lemon-400/10 via-transparent to-grape-500/10" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Start Selling Software & Digital Products <span className="gradient-text">Today</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-dark-400 mb-8">
                <span>No setup fees.</span>
                <span>•</span>
                <span>No money held.</span>
                <span>•</span>
                <span>No risk.</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register" className="btn-primary btn-lg group">
                  Create Merchant Account
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact" className="btn-outline btn-lg">
                  Talk to Sales
                </Link>
              </div>
              <p className="mt-6 text-dark-500 text-sm">No credit card required • Free forever plan available</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center">
                  <span className="text-dark-900 font-black text-xl">L</span>
                </div>
                <span className="text-xl font-bold text-white">Losetify</span>
              </div>
              <p className="text-dark-400 text-sm mb-6 max-w-xs">
                The all-in-one subscription and payment platform built for Africa's digital economy.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-lemon-400 hover:bg-dark-700 transition-all">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-lemon-400 hover:bg-dark-700 transition-all">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="text-dark-400 hover:text-lemon-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-dark-400 hover:text-lemon-400 transition-colors">Pricing</Link></li>
                <li><Link href="#how-it-works" className="text-dark-400 hover:text-lemon-400 transition-colors">How It Works</Link></li>
                <li><Link href="/portal" className="text-dark-400 hover:text-lemon-400 transition-colors">Customer Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-dark-400 hover:text-lemon-400 transition-colors">Documentation</Link></li>
                <li><Link href="/docs/api" className="text-dark-400 hover:text-lemon-400 transition-colors">API Reference</Link></li>
                <li><Link href="/docs/webhooks" className="text-dark-400 hover:text-lemon-400 transition-colors">Webhooks</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-dark-400 hover:text-lemon-400 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-dark-400 hover:text-lemon-400 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-dark-400 hover:text-lemon-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-dark-400 hover:text-lemon-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm">© {new Date().getFullYear()} Losetify. All rights reserved.</p>
            <p className="text-dark-500 text-sm">Built with 💛 for Africa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
