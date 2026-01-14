import Link from 'next/link';
import { ArrowRight, Globe, Users, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-lemon-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-grape-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center shadow-lemon">
                <span className="text-dark-900 font-black text-xl">P</span>
              </div>
              <span className="text-xl font-bold text-white">Payssd</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary btn-sm">
                Get Started Free
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">About Us</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">About Payssd</h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              We're building the subscription infrastructure for emerging markets, 
              starting with South Sudan and expanding across East Africa.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-dark-300 text-center mb-12">
              To empower local businesses to accept recurring payments and manage subscriptions 
              without the complexity of traditional payment processors.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8">
                <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-lemon-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Built for Africa</h3>
                <p className="text-dark-300">
                  We understand the unique challenges of doing business in emerging markets. 
                  Our platform is designed from the ground up for mobile money and local payment methods.
                </p>
              </div>
              <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8">
                <div className="w-12 h-12 bg-grape-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-grape-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Trust & Transparency</h3>
                <p className="text-dark-300">
                  We never hold your funds. Payments go directly from customer to merchant. 
                  We only verify and manage access.
                </p>
              </div>
              <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8">
                <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-lemon-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Merchant First</h3>
                <p className="text-dark-300">
                  We're building tools that make it easy for anyone to start selling subscriptions, 
                  regardless of technical expertise.
                </p>
              </div>
              <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8">
                <div className="w-12 h-12 bg-grape-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-grape-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Simple & Fast</h3>
                <p className="text-dark-300">
                  Start accepting payments in minutes. No bank approvals, no complex integrations, 
                  no legal headaches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8 md:p-12 space-y-6">
              <p className="text-dark-300 leading-relaxed">
                Payssd was born out of a simple observation: businesses in South Sudan and East Africa 
                struggle to accept recurring payments for their digital products and services.
              </p>
              <p className="text-dark-300 leading-relaxed">
                Traditional payment processors require complex integrations, bank approvals, and often 
                don't support local payment methods like MTN Mobile Money. We saw an opportunity to 
                build something different.
              </p>
              <p className="text-dark-300 leading-relaxed">
                Instead of trying to be another payment processor, we focused on what businesses really need: 
                a way to verify payments and control access to their products. Let the money flow directly 
                between customer and merchant – we just make sure the right people get access.
              </p>
              <p className="text-dark-300 leading-relaxed">
                Today, Payssd powers subscriptions for SaaS founders, app developers, and digital sellers 
                across the region. We're just getting started.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-lemon-400/10 to-grape-500/10 border border-lemon-400/20 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
              <p className="text-dark-300 mb-8">Join merchants across South Sudan using Payssd</p>
              <Link href="/auth/register" className="btn-primary btn-lg inline-flex items-center gap-2">
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-dark-900 border-t border-dark-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lemon-400 rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-black">P</span>
              </div>
              <span className="text-white font-bold">Payssd</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-dark-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} Payssd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
