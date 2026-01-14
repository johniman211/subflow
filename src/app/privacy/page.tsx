import Link from 'next/link';

export default function PrivacyPage() {
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
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
            <p className="text-dark-500">Last updated: January 2024</p>
          </div>

          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-dark-300 leading-relaxed">
                Payssd ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                subscription management platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-lemon-400 mt-4 mb-3">For Merchants</h3>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Account information (name, email, phone number)</li>
                <li>Business information (business name, payment details)</li>
                <li>Product and pricing information</li>
                <li>Transaction and subscription data</li>
              </ul>

              <h3 className="text-lg font-semibold text-lemon-400 mt-6 mb-3">For Customers</h3>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Contact information (phone number, email)</li>
                <li>Payment proof and transaction references</li>
                <li>Subscription history</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>To provide and maintain our service</li>
                <li>To process transactions and manage subscriptions</li>
                <li>To send notifications about payments and subscriptions</li>
                <li>To communicate with you about updates and support</li>
                <li>To improve our platform and develop new features</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Data Sharing</h2>
              <p className="text-dark-300 leading-relaxed mb-4">We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Service providers who assist in operating our platform</li>
                <li>Merchants (for their customer data only)</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Data Security</h2>
              <p className="text-dark-300 leading-relaxed">
                We implement appropriate security measures to protect your information. However, no method 
                of transmission over the Internet is 100% secure. We strive to use commercially acceptable 
                means to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Data Retention</h2>
              <p className="text-dark-300 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide 
                services. We may retain certain information as required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Your Rights</h2>
              <p className="text-dark-300 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Cookies</h2>
              <p className="text-dark-300 leading-relaxed">
                We use cookies and similar technologies to improve user experience, analyze usage, and 
                provide personalized content. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-dark-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">10. Contact Us</h2>
              <p className="text-dark-300 leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
                <p className="text-dark-300"><strong className="text-white">Email:</strong> privacy@payssd.com</p>
                <p className="text-dark-300"><strong className="text-white">Address:</strong> Juba, South Sudan</p>
              </div>
            </section>
          </div>
        </div>
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
