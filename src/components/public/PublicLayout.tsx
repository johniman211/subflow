'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

interface PublicLayoutProps {
  children: React.ReactNode;
  showUseCases?: boolean;
}

export function PublicLayout({ children, showUseCases = false }: PublicLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "min-h-screen overflow-hidden",
      theme === 'dark' ? 'bg-dark-950 text-white' : 'bg-white text-gray-900'
    )}>
      {/* Noise Overlay - only in dark mode */}
      {theme === 'dark' && <div className="noise-overlay" />}
      
      {/* Background Gradient Orbs - only in dark mode */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-lemon-400/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-grape-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      )}

      <PublicHeader showUseCases={showUseCases} />
      
      <main className="relative">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
