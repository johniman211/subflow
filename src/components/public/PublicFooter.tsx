'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function PublicFooter() {
  const { theme } = useTheme();

  return (
    <footer className={cn(
      "border-t py-12",
      theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-gray-50 border-gray-200'
    )}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#F7C500] rounded-full flex items-center justify-center">
              <span className="text-[#333] font-black text-[10px] italic">PAY</span>
            </div>
            <span className={cn(
              "font-black italic",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>SSD</span>
          </Link>
          <div className={cn(
            "flex items-center gap-6 text-sm",
            theme === 'dark' ? 'text-dark-400' : 'text-gray-500'
          )}>
            <Link href="/privacy" className={cn(
              "transition-colors",
              theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
            )}>Privacy</Link>
            <Link href="/terms" className={cn(
              "transition-colors",
              theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
            )}>Terms</Link>
            <Link href="/contact" className={cn(
              "transition-colors",
              theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
            )}>Contact</Link>
            <Link href="/about" className={cn(
              "transition-colors",
              theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
            )}>About</Link>
          </div>
          <p className={cn(
            "text-sm",
            theme === 'dark' ? 'text-dark-500' : 'text-gray-400'
          )}>
            © {new Date().getFullYear()} PaySSD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
