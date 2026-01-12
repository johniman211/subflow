import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Losetify</span>
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: January 2024</p>

        <div className="prose prose-lg text-gray-600 max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Losetify's subscription management platform ("Service"), you agree to be 
            bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p>
            Losetify provides a subscription and access control platform that enables merchants to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create and manage digital products with subscription pricing</li>
            <li>Accept payments via MTN Mobile Money and bank transfers</li>
            <li>Verify payment proofs and manage customer access</li>
            <li>Track subscriptions, revenue, and customer data</li>
          </ul>
          <p className="mt-4">
            <strong>Important:</strong> Losetify does not process or hold funds. All payments are made directly 
            from customers to merchants. We only verify payments and manage subscription access.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Account Registration</h2>
          <p>To use our Service as a merchant, you must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete registration information</li>
            <li>Be at least 18 years old or the legal age in your jurisdiction</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Merchant Responsibilities</h2>
          <p>As a merchant using Losetify, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate product descriptions and pricing</li>
            <li>Fulfill your obligations to customers who purchase your products</li>
            <li>Respond to customer inquiries in a timely manner</li>
            <li>Verify payments accurately before confirming</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not use the Service for illegal or fraudulent activities</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Prohibited Uses</h2>
          <p>You may not use Losetify to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sell illegal products or services</li>
            <li>Engage in fraud or deceptive practices</li>
            <li>Violate intellectual property rights</li>
            <li>Distribute malware or harmful content</li>
            <li>Harass, abuse, or harm others</li>
            <li>Circumvent security measures</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Fees and Payments</h2>
          <p>
            Losetify may charge fees for certain features or usage tiers. Current pricing is available 
            on our website. We reserve the right to modify pricing with reasonable notice.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
          <p>
            The Losetify platform, including its design, features, and content, is owned by us and 
            protected by intellectual property laws. You retain ownership of your products and content 
            uploaded to our platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            Losetify is provided "as is" without warranties of any kind. We are not liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Disputes between merchants and customers</li>
            <li>Payment disputes or chargebacks</li>
            <li>Loss of revenue or business opportunities</li>
            <li>Service interruptions or data loss</li>
            <li>Third-party actions or content</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold Losetify harmless from any claims, damages, or expenses 
            arising from your use of the Service or violation of these terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these terms. You may close your 
            account at any time. Upon termination, your access to the Service will cease.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice of significant 
            changes. Continued use of the Service after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
          <p>
            These terms are governed by the laws of South Sudan. Any disputes shall be resolved in 
            the courts of South Sudan.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <ul className="list-none pl-0 space-y-1 mt-4">
            <li><strong>Email:</strong> legal@losetify.com</li>
            <li><strong>Address:</strong> Juba, South Sudan</li>
          </ul>
        </div>
      </main>

      <footer className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Losetify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
