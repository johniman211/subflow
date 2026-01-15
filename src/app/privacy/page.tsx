'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { PublicLayout } from '@/components/public/PublicLayout';

export default function PrivacyPage() {
  const { theme } = useTheme();

  return (
    <PublicLayout>
      <div className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">Legal</p>
            <h1 className={cn(
              "text-4xl md:text-5xl font-black mb-4",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>Privacy Policy</h1>
            <p className={theme === 'dark' ? 'text-dark-500' : 'text-gray-500'}>Last updated: January 2024</p>
          </div>

          <div className={cn(
            "rounded-2xl p-8 md:p-12 space-y-8 border",
            theme === 'dark' ? 'bg-dark-900/50 border-dark-800' : 'bg-white border-gray-200 shadow-sm'
          )}>
            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>1. Introduction</h2>
              <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                PaySSD ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                subscription management platform.
              </p>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-lemon-500 mt-4 mb-3">For Merchants</h3>
              <ul className={cn("list-disc pl-6 space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                <li>Account information (name, email, phone number)</li>
                <li>Business information (business name, payment details)</li>
                <li>Product and pricing information</li>
                <li>Transaction and subscription data</li>
              </ul>

              <h3 className="text-lg font-semibold text-lemon-500 mt-6 mb-3">For Customers</h3>
              <ul className={cn("list-disc pl-6 space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                <li>Contact information (phone number, email)</li>
                <li>Payment proof and transaction references</li>
                <li>Subscription history</li>
              </ul>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>3. How We Use Your Information</h2>
              <ul className={cn("list-disc pl-6 space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                <li>To provide and maintain our service</li>
                <li>To process transactions and manage subscriptions</li>
                <li>To send notifications about payments and subscriptions</li>
                <li>To communicate with you about updates and support</li>
                <li>To improve our platform and develop new features</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>4. Data Sharing</h2>
              <p className={cn("leading-relaxed mb-4", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>We do not sell your personal information. We may share data with:</p>
              <ul className={cn("list-disc pl-6 space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                <li>Service providers who assist in operating our platform</li>
                <li>Merchants (for their customer data only)</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>5. Data Security</h2>
              <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                We implement appropriate security measures to protect your information. However, no method 
                of transmission over the Internet is 100% secure. We strive to use commercially acceptable 
                means to protect your data.
              </p>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>6. Data Retention</h2>
              <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                We retain your information for as long as your account is active or as needed to provide 
                services. We may retain certain information as required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>7. Your Rights</h2>
              <p className={cn("leading-relaxed mb-4", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>You have the right to:</p>
              <ul className={cn("list-disc pl-6 space-y-2", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>8. Cookies</h2>
              <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                We use cookies and similar technologies to improve user experience, analyze usage, and 
                provide personalized content. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>9. Changes to This Policy</h2>
              <p className={cn("leading-relaxed", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className={cn("text-xl font-bold mb-4", theme === 'dark' ? 'text-white' : 'text-gray-900')}>10. Contact Us</h2>
              <p className={cn("leading-relaxed mb-4", theme === 'dark' ? 'text-dark-300' : 'text-gray-600')}>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className={cn(
                "rounded-xl p-4 space-y-2",
                theme === 'dark' ? 'bg-dark-800/50' : 'bg-gray-50'
              )}>
                <p className={theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}>
                  <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Email:</strong> privacy@payssd.com
                </p>
                <p className={theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}>
                  <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Address:</strong> Juba, South Sudan
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
