import Link from 'next/link';
import { ArrowRight, Globe, Users, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SubFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About SubFlow</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building the subscription infrastructure for emerging markets, 
            starting with South Sudan and expanding across East Africa.
          </p>
        </section>

        {/* Mission */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-600 text-center mb-12">
              To empower local businesses to accept recurring payments and manage subscriptions 
              without the complexity of traditional payment processors.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8">
                <Globe className="h-10 w-10 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Built for Africa</h3>
                <p className="text-gray-600">
                  We understand the unique challenges of doing business in emerging markets. 
                  Our platform is designed from the ground up for mobile money and local payment methods.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8">
                <Shield className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trust & Transparency</h3>
                <p className="text-gray-600">
                  We never hold your funds. Payments go directly from customer to merchant. 
                  We only verify and manage access.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8">
                <Users className="h-10 w-10 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Merchant First</h3>
                <p className="text-gray-600">
                  We're building tools that make it easy for anyone to start selling subscriptions, 
                  regardless of technical expertise.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8">
                <Zap className="h-10 w-10 text-amber-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Simple & Fast</h3>
                <p className="text-gray-600">
                  Start accepting payments in minutes. No bank approvals, no complex integrations, 
                  no legal headaches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="container mx-auto px-4 py-20 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg text-gray-600 mx-auto">
            <p>
              SubFlow was born out of a simple observation: businesses in South Sudan and East Africa 
              struggle to accept recurring payments for their digital products and services.
            </p>
            <p>
              Traditional payment processors require complex integrations, bank approvals, and often 
              don't support local payment methods like MTN Mobile Money. We saw an opportunity to 
              build something different.
            </p>
            <p>
              Instead of trying to be another payment processor, we focused on what businesses really need: 
              a way to verify payments and control access to their products. Let the money flow directly 
              between customer and merchant – we just make sure the right people get access.
            </p>
            <p>
              Today, SubFlow powers subscriptions for SaaS founders, app developers, and digital sellers 
              across the region. We're just getting started.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
            <p className="text-gray-400 mb-8">Join merchants across South Sudan using SubFlow</p>
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100">
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} SubFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
