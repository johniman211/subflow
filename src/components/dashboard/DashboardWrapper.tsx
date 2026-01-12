'use client';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useTheme();
  
  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark dashboard-dark bg-dark-950 text-white' : 'dashboard-light bg-gray-50 text-gray-900'}`}>
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
