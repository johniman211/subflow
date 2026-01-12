'use client';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { BillingProvider } from '@/contexts/BillingContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useTheme();
  
  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark dashboard-dark bg-dark-950 text-white' : 'dashboard-light bg-gray-50 text-gray-900'}`}>
      {children}
      <UpgradeModal />
    </div>
  );
}

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <BillingProvider>
          <DashboardContent>{children}</DashboardContent>
        </BillingProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
