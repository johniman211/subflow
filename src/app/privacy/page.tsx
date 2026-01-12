import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: January 2024</p>

        <div className="prose prose-lg text-gray-600 max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p>
            Losetify ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our 
            subscription management platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">For Merchants</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (name, email, phone number)</li>
            <li>Business information (business name, payment details)</li>
            <li>Product and pricing information</li>
            <li>Transaction and subscription data</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">For Customers</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact information (phone number, email)</li>
            <li>Payment proof and transaction references</li>
            <li>Subscription history</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To process transactions and manage subscriptions</li>
            <li>To send notifications about payments and subscriptions</li>
            <li>To communicate with you about updates and support</li>
            <li>To improve our platform and develop new features</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers who assist in operating our platform</li>
            <li>Merchants (for their customer data only)</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information. However, no method 
            of transmission over the Internet is 100% secure. We strive to use commercially acceptable 
            means to protect your data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide 
            services. We may retain certain information as required by law or for legitimate business purposes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Cookies</h2>
          <p>
            We use cookies and similar technologies to improve user experience, analyze usage, and 
            provide personalized content. You can control cookies through your browser settings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-none pl-0 space-y-1 mt-4">
            <li><strong>Email:</strong> privacy@losetify.com</li>
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
