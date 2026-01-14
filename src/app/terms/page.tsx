import Link from 'next/link';

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
            <p className="text-dark-500">Last updated: January 2024</p>
          </div>

          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-dark-300 leading-relaxed">
                By accessing or using Payssd's subscription management platform ("Service"), you agree to be 
                bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-dark-300 leading-relaxed mb-4">
                Payssd provides a subscription and access control platform that enables merchants to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Create and manage digital products with subscription pricing</li>
                <li>Accept payments via MTN Mobile Money and bank transfers</li>
                <li>Verify payment proofs and manage customer access</li>
                <li>Track subscriptions, revenue, and customer data</li>
              </ul>
              <div className="mt-4 bg-lemon-400/10 border border-lemon-400/20 rounded-xl p-4">
                <p className="text-lemon-400">
                  <strong>Important:</strong> Payssd does not process or hold funds. All payments are made directly 
                  from customers to merchants. We only verify payments and manage subscription access.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. Account Registration</h2>
              <p className="text-dark-300 leading-relaxed mb-4">To use our Service as a merchant, you must:</p>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Provide accurate and complete registration information</li>
                <li>Be at least 18 years old or the legal age in your jurisdiction</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Merchant Responsibilities</h2>
              <p className="text-dark-300 leading-relaxed mb-4">As a merchant using Payssd, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Provide accurate product descriptions and pricing</li>
                <li>Fulfill your obligations to customers who purchase your products</li>
                <li>Respond to customer inquiries in a timely manner</li>
                <li>Verify payments accurately before confirming</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the Service for illegal or fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Prohibited Uses</h2>
              <p className="text-dark-300 leading-relaxed mb-4">You may not use Payssd to:</p>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Sell illegal products or services</li>
                <li>Engage in fraud or deceptive practices</li>
                <li>Violate intellectual property rights</li>
                <li>Distribute malware or harmful content</li>
                <li>Harass, abuse, or harm others</li>
                <li>Circumvent security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Fees and Payments</h2>
              <p className="text-dark-300 leading-relaxed">
                Payssd may charge fees for certain features or usage tiers. Current pricing is available 
                on our website. We reserve the right to modify pricing with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="text-dark-300 leading-relaxed">
                The Payssd platform, including its design, features, and content, is owned by us and 
                protected by intellectual property laws. You retain ownership of your products and content 
                uploaded to our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-dark-300 leading-relaxed mb-4">
                Payssd is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-dark-300">
                <li>Disputes between merchants and customers</li>
                <li>Payment disputes or chargebacks</li>
                <li>Loss of revenue or business opportunities</li>
                <li>Service interruptions or data loss</li>
                <li>Third-party actions or content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">9. Indemnification</h2>
              <p className="text-dark-300 leading-relaxed">
                You agree to indemnify and hold Payssd harmless from any claims, damages, or expenses 
                arising from your use of the Service or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">10. Termination</h2>
              <p className="text-dark-300 leading-relaxed">
                We may suspend or terminate your account if you violate these terms. You may close your 
                account at any time. Upon termination, your access to the Service will cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">11. Modifications</h2>
              <p className="text-dark-300 leading-relaxed">
                We reserve the right to modify these terms at any time. We will provide notice of significant 
                changes. Continued use of the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">12. Governing Law</h2>
              <p className="text-dark-300 leading-relaxed">
                These terms are governed by the laws of South Sudan. Any disputes shall be resolved in 
                the courts of South Sudan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">13. Contact</h2>
              <p className="text-dark-300 leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
                <p className="text-dark-300"><strong className="text-white">Email:</strong> legal@payssd.com</p>
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
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} Payssd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
