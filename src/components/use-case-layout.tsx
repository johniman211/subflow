'use client';

import Link from 'next/link';
import { ArrowRight, Check, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface Feature {
  text: string;
}

interface UseCaseLayoutProps {
  // Hero
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  
  // Problem
  problemTitle: string;
  problemDescription: string;
  problemPoints?: string[];
  
  // Solution
  solutionTitle: string;
  solutionDescription: string;
  solutionSubtext?: string;
  
  // What you can sell/offer
  offerTitle?: string;
  offerItems?: string[];
  
  // How it works
  steps: Step[];
  
  // Why choose
  whyTitle: string;
  features: Feature[];
  
  // Icon for the page
  icon: LucideIcon;
  iconBg?: string;
}

export function UseCaseLayout({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref = '/auth/register',
  problemTitle,
  problemDescription,
  problemPoints,
  solutionTitle,
  solutionDescription,
  solutionSubtext,
  offerTitle,
  offerItems,
  steps,
  whyTitle,
  features,
  icon: Icon,
  iconBg = 'bg-lemon-400',
}: UseCaseLayoutProps) {
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
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center shadow-lemon">
                <span className="text-dark-900 font-black text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-white">Losetify</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">Features</Link>
              <Link href="/#how-it-works" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">How It Works</Link>
              <Link href="/#pricing" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
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
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-dark-800 pt-4">
              <div className="flex flex-col space-y-4">
                <Link href="/#features" className="text-dark-300 hover:text-white text-sm font-medium">Features</Link>
                <Link href="/#how-it-works" className="text-dark-300 hover:text-white text-sm font-medium">How It Works</Link>
                <Link href="/#pricing" className="text-dark-300 hover:text-white text-sm font-medium">Pricing</Link>
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
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Icon */}
              <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lemon`}>
                <Icon className="h-8 w-8 text-dark-900" />
              </div>
              
              {/* Subtitle */}
              <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">
                {subtitle}
              </p>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                {title}
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-dark-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
              
              {/* CTA */}
              <Link 
                href={ctaHref}
                className="btn-primary btn-lg inline-flex items-center gap-2"
              >
                {ctaText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-dark-900/50 border border-dark-800 rounded-3xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                  {problemTitle}
                </h2>
                <p className="text-dark-300 text-lg mb-6 leading-relaxed">
                  {problemDescription}
                </p>
                {problemPoints && problemPoints.length > 0 && (
                  <ul className="space-y-3">
                    {problemPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3 text-dark-400">
                        <span className="text-danger-400 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                {solutionTitle}
              </h2>
              <p className="text-dark-300 text-lg mb-4 leading-relaxed">
                {solutionDescription}
              </p>
              {solutionSubtext && (
                <p className="text-dark-400 leading-relaxed">
                  {solutionSubtext}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* What You Can Offer Section */}
        {offerTitle && offerItems && offerItems.length > 0 && (
          <section className="py-16 relative">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-bold mb-6 text-white text-center">
                  {offerTitle}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {offerItems.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center"
                    >
                      <p className="text-white font-medium text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-12 text-white text-center">
                How it works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Step Number */}
                    <div className="w-12 h-12 bg-lemon-400 rounded-xl flex items-center justify-center mb-4 shadow-lemon">
                      <span className="text-dark-900 font-black text-xl">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-dark-400 text-sm leading-relaxed">{step.description}</p>
                    
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-6 left-16 w-full h-0.5 bg-gradient-to-r from-lemon-400/50 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-center">
                {whyTitle}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 bg-dark-800/30 border border-dark-700 rounded-xl p-4"
                  >
                    <div className="w-6 h-6 bg-lemon-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-lemon-400" />
                    </div>
                    <span className="text-white font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-gradient-to-br from-lemon-400/10 to-grape-500/10 border border-lemon-400/20 rounded-3xl p-8 md:p-12">
                <div className="w-16 h-16 bg-lemon-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-lemon-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                  Built for trust
                </h2>
                <p className="text-dark-300 text-lg mb-2">
                  Losetify never holds your money.
                </p>
                <p className="text-dark-400">
                  You stay in full control of revenue and customers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ready to get started?
              </h2>
              <p className="text-dark-300 text-lg mb-8">
                Join businesses already using Losetify to manage payments and access.
              </p>
              <Link 
                href={ctaHref}
                className="btn-primary btn-lg inline-flex items-center gap-2"
              >
                {ctaText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lemon-400 rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-black">L</span>
              </div>
              <span className="text-white font-bold">Losetify</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-dark-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            </div>
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} Losetify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
