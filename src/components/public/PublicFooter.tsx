'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function PublicFooter() {
  const { theme } = useTheme();

  const linkClass = cn(
    "transition-colors",
    theme === 'dark' ? 'text-dark-400 hover:text-lemon-400' : 'text-gray-600 hover:text-gray-900'
  );

  const headingClass = cn(
    "font-semibold mb-4",
    theme === 'dark' ? 'text-white' : 'text-gray-900'
  );

  return (
    <footer className={cn(
      "border-t py-16",
      theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-gray-50 border-gray-200'
    )}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center">
                <span className="text-[#333] font-black text-xs italic">PAY</span>
              </div>
              <span className={cn(
                "text-xl font-black italic",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>SSD</span>
            </Link>
            <p className={cn(
              "text-sm mb-6 max-w-xs",
              theme === 'dark' ? 'text-dark-400' : 'text-gray-600'
            )}>
              The all-in-one subscription, access control, and creator monetization platform built for Africa's digital economy.
            </p>
          </div>
          <div>
            <h4 className={headingClass}>Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#features" className={linkClass}>Features</Link></li>
              <li><Link href="/creator" className={linkClass}>Creator Studio</Link></li>
              <li><Link href="#pricing" className={linkClass}>Pricing</Link></li>
              <li><Link href="#how-it-works" className={linkClass}>How It Works</Link></li>
              <li><Link href="/portal" className={linkClass}>Customer Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className={headingClass}>Developers</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/docs/integration" className={linkClass}>Integration Guide</Link></li>
              <li><Link href="/docs/integration#api-integration" className={linkClass}>API Reference</Link></li>
              <li><Link href="/docs/integration#webhooks" className={linkClass}>Webhooks</Link></li>
            </ul>
          </div>
          <div>
            <h4 className={headingClass}>Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className={linkClass}>About</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className={cn(
          "border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4",
          theme === 'dark' ? 'border-dark-800' : 'border-gray-200'
        )}>
          <p className={cn(
            "text-sm",
            theme === 'dark' ? 'text-dark-500' : 'text-gray-500'
          )}>
            © {new Date().getFullYear()} PaySSD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
