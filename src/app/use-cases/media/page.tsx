import Link from 'next/link';
import { Newspaper, ArrowRight, Check, Shield } from 'lucide-react';

export default function MediaUseCasePage() {
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
              <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
                <span className="text-[#333] font-black text-xs italic">PAY</span>
              </div>
              <span className="text-xl font-black text-white italic">SSD</span>
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
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Newspaper className="h-8 w-8 text-white" />
              </div>
              <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">
                Media & Publishers
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Monetize News and Content Without Giving Up Control
              </h1>
              <p className="text-lg md:text-xl text-dark-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Offer memberships, premium articles, or supporter access while keeping full ownership of your revenue and audience.
              </p>
              <Link href="/auth/register" className="btn-primary btn-lg inline-flex items-center gap-2">
                Explore Media Monetization
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
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">The problem</h2>
                <p className="text-dark-300 text-lg mb-6 leading-relaxed">
                  Media organizations struggle to monetize sustainably.
                </p>
                <ul className="space-y-3">
                  {["Monetize content sustainably", "Rely on ads alone", "Control access to premium articles"].map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-dark-400">
                      <span className="text-danger-400 mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">The solution</h2>
              <p className="text-dark-300 text-lg mb-4 leading-relaxed">
                Payssd enables reader-supported journalism.
              </p>
              <p className="text-dark-400 leading-relaxed">
                Readers pay you directly. Payssd manages who can access premium content.
              </p>
            </div>
          </div>
        </section>

        {/* Monetization Options */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-6 text-white text-center">Monetization options</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Premium articles", "Members-only sections", "Supporter subscriptions", "Paid archives"].map((item, index) => (
                  <div key={index} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
                    <p className="text-white font-medium text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-12 text-white text-center">How it works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: "Create a membership or premium plan", description: "Define pricing and access rules." },
                  { title: "Share your checkout link", description: "Readers pay directly to you." },
                  { title: "Control access automatically", description: "Only active members can read premium content." }
                ].map((step, index) => (
                  <div key={index} className="relative">
                    <div className="w-12 h-12 bg-lemon-400 rounded-xl flex items-center justify-center mb-4 shadow-lemon">
                      <span className="text-dark-900 font-black text-xl">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-dark-400 text-sm leading-relaxed">{step.description}</p>
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
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-center">Why publishers choose Payssd</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {["No revenue sharing", "No platform dependency", "Transparent access control", "Works with local payments"].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-dark-800/30 border border-dark-700 rounded-xl p-4">
                    <div className="w-6 h-6 bg-lemon-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-lemon-400" />
                    </div>
                    <span className="text-white font-medium">{feature}</span>
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
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Built for trust</h2>
                <p className="text-dark-300 text-lg mb-2">Payssd never holds your money.</p>
                <p className="text-dark-400">You stay in full control of revenue and audience.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to get started?</h2>
              <p className="text-dark-300 text-lg mb-8">Join publishers already using Payssd to monetize content.</p>
              <Link href="/auth/register" className="btn-primary btn-lg inline-flex items-center gap-2">
                Explore Media Monetization
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
              <div className="w-8 h-8 bg-[#F7C500] rounded-full flex items-center justify-center">
                <span className="text-[#333] font-black text-[10px] italic">PAY</span>
              </div>
              <span className="text-white font-black italic">SSD</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-dark-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-dark-500 text-sm">© {new Date().getFullYear()} Payssd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
