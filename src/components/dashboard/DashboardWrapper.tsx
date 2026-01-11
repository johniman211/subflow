'use client';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <div className={theme === 'dark' ? 'bg-dark-950 text-white' : 'bg-gray-50 text-gray-900'}>
      {children}
    </div>
  );
}

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardContent>{children}</DashboardContent>
    </ThemeProvider>
  );
}
