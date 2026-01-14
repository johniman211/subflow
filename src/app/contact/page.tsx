import Link from 'next/link';
import { Mail, Phone, MapPin, MessageCircle, ArrowRight } from 'lucide-react';

export default function ContactPage() {
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

      <main className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">Contact Us</p>
              <h1 className="text-4xl md:text-5xl font-black mb-6">Get in Touch</h1>
              <p className="text-xl text-dark-300">We'd love to hear from you. Reach out to our team.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-lemon-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Email</h3>
                      <p className="text-dark-300">support@payssd.com</p>
                      <p className="text-sm text-dark-500">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-grape-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-grape-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Phone</h3>
                      <p className="text-dark-300">+211929385157</p>
                      <p className="text-sm text-dark-500">Mon-Fri, 9am-5pm EAT</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-success-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">WhatsApp</h3>
                      <p className="text-dark-300">+211929385157</p>
                      <p className="text-sm text-dark-500">Quick support via WhatsApp</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-lemon-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Location</h3>
                      <p className="text-dark-300">Juba, South Sudan</p>
                      <p className="text-sm text-dark-500">Serving East Africa</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-lemon-400 focus:ring-0"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-lemon-400 focus:ring-0"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-lemon-400 focus:ring-0"
                      placeholder="+211 9XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-lemon-400 focus:ring-0"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary py-3"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

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
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
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
