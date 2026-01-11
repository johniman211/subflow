import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Smartphone, Check, X, Lock, BarChart3, Users, Code, Play } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SubFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm font-medium">How It Works</Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pricing</Link>
              <Link href="/portal" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Customer Portal</Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                Start Free
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Check className="h-4 w-4" /> Works with MTN MoMo & Bank Transfer
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Accept Subscriptions with Mobile Money —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Without Holding Funds</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
              Sell software, digital products, and subscriptions.<br />
              Customers pay you directly.<br />
              We unlock access automatically.
            </p>
            <p className="text-gray-500 mb-8">
              No payment APIs. No wallets. No risk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all hover:scale-105 flex items-center justify-center gap-2">
                Start Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto bg-gray-100 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Play className="h-5 w-5" /> See How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* One-Line Explanation */}
        <section className="bg-gray-900 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl md:text-2xl text-white font-medium">
              We verify payments and manage subscriptions — <span className="text-green-400">we never touch your money.</span>
            </p>
          </div>
        </section>

        {/* Who It's For */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built For</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Code, label: 'SaaS Founders' },
              { icon: Smartphone, label: 'App Developers' },
              { icon: Globe, label: 'Digital Sellers' },
              { icon: Users, label: 'Online Services' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <item.icon className="h-8 w-8 text-gray-900 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8 text-lg">If you sell access, this is for you.</p>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600">Three simple steps to start selling</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create a Product</h3>
                <p className="text-gray-600">
                  Set price, currency (SSP or USD), and billing (one-time or monthly).
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Share Checkout Link</h3>
                <p className="text-gray-600">
                  Customer pays you directly via MTN MoMo or bank transfer.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                  <Check className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Access Unlocks Automatically</h3>
                <p className="text-gray-600">
                  You confirm payment → we activate the subscription. That's it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Transparency */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Transparency</h2>
              <p className="text-gray-600">Your money, your control</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <Check className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <p className="font-semibold text-gray-900">Customer</p>
                <p className="text-green-700 font-medium">Pays you directly</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <Check className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <p className="font-semibold text-gray-900">You</p>
                <p className="text-green-700 font-medium">Receive money instantly</p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-6 text-center">
                <X className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="font-semibold text-gray-900">We</p>
                <p className="text-gray-600 font-medium">Never hold funds</p>
              </div>
            </div>
            <p className="text-center text-gray-500 mt-8">No wallets. No delays. No financial risk.</p>
          </div>
        </section>

        {/* Access Control Features */}
        <section id="features" className="bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Access Control</h2>
              <p className="text-gray-400">The real value we provide</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Lock, text: 'Automatically lock & unlock subscriptions' },
                { icon: Code, text: 'API keys for apps & websites' },
                { icon: BarChart3, text: 'No-code dashboard for non-technical sellers' },
                { icon: Zap, text: 'Works for software & digital products' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 text-center">
                  <item.icon className="h-8 w-8 text-green-400 mx-auto mb-4" />
                  <p className="text-white font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built For Our Market */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built For Our Market</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'MTN MoMo support',
                'Bank transfer support',
                'Guest checkout (no customer login)',
                'Mobile-first design',
                'Works in South Sudan',
                'Expanding to East Africa',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Merchant Dashboard */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Merchant Dashboard</h2>
              <p className="text-gray-600">Everything you need in one place</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                'View all payments',
                'Confirm in one click',
                'See active subscribers',
                'Track revenue & growth',
                'Export customer data',
                'Manage coupons & referrals',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-900 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Merchants Love It */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Merchants Love It</h2>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              'Start in minutes',
              'No bank approvals',
              'No MoMo API needed',
              'No legal headache',
              'Scales as you grow',
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-center">
                <Zap className="h-6 w-6 text-green-400 mx-auto mb-3" />
                <p className="text-white font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Positioning */}
        <section className="bg-gray-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl text-gray-400 mb-2">We are not a payment processor.</p>
            <p className="text-2xl md:text-3xl text-white font-bold">We are a subscription & access control platform.</p>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section id="pricing" className="container mx-auto px-4 py-20">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600 mb-2">Start free. Upgrade when you grow.</p>
            <p className="text-gray-500 mb-8">Simple monthly pricing for merchants.</p>
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all hover:scale-105">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-green-600 to-emerald-600 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Start Selling Subscriptions Today</h2>
            <div className="flex flex-wrap justify-center gap-4 text-green-100 mb-8">
              <span>No setup fees.</span>
              <span>•</span>
              <span>No money held.</span>
              <span>•</span>
              <span>No risk.</span>
            </div>
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-green-700 px-10 py-4 rounded-xl text-lg font-bold hover:bg-green-50 transition-colors">
              Create Merchant Account <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold text-white">SubFlow</span>
              </div>
              <p className="text-sm">
                Subscription & access control platform for South Sudan and East Africa.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/portal" className="hover:text-white transition-colors">Customer Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/api" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/docs/webhooks" className="hover:text-white transition-colors">Webhooks</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} SubFlow. All rights reserved.</p>
            <p className="text-sm">Built with ❤️ for South Sudan & East Africa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
