'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Key,
  Webhook,
  LogOut,
  Menu,
  X,
  Tag,
  FileText,
  Gift,
  PieChart,
  ChevronRight,
  Home,
  Sun,
  Moon,
  Crown,
  Wallet,
  BookOpen,
  ExternalLink,
  Bell,
} from 'lucide-react';
import { NotificationBell } from './notification-bell';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency } from '@/contexts/CurrencyContext';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Users },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Coupons', href: '/dashboard/coupons', icon: Tag },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Referrals', href: '/dashboard/referrals', icon: Gift },
  { name: 'Reports', href: '/dashboard/reports', icon: PieChart },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { name: 'Billing', href: '/dashboard/billing', icon: Wallet },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardNavProps {
  user: User | null;
  isAdmin?: boolean;
}

export function DashboardNav({ user, isAdmin }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b px-4 py-3",
        theme === 'dark' ? 'bg-dark-900/95 border-dark-800' : 'bg-white/95 border-gray-200'
      )}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-lemon-400 rounded-lg flex items-center justify-center">
              <span className="text-dark-900 font-black">L</span>
            </div>
            <span className={cn("font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Losetify</span>
          </Link>
          <div className="flex items-center gap-2">
            {user && <NotificationBell userId={user.id} />}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-colors",
                theme === 'dark' ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "p-2 transition-colors",
                theme === 'dark' ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              )}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={cn(
          "lg:hidden fixed inset-0 z-40 pt-16",
          theme === 'dark' ? 'bg-dark-900' : 'bg-white'
        )}>
          <nav className="px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all',
                    isActive
                      ? 'bg-lemon-400/10 text-lemon-400 border border-lemon-400/20'
                      : theme === 'dark' 
                        ? 'text-dark-300 hover:bg-dark-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <hr className={theme === 'dark' ? 'border-dark-800' : 'border-gray-200'} />
            <button
              onClick={handleSignOut}
              className={cn(
                "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all",
                theme === 'dark' 
                  ? 'text-dark-400 hover:text-white hover:bg-dark-800' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className={cn(
          "flex flex-col flex-grow border-r pt-6 pb-4 overflow-y-auto",
          theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'
        )}>
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-2">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center shadow-lemon">
                <span className="text-dark-900 font-black text-xl">L</span>
              </div>
              <span className={cn("text-xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Losetify</span>
            </Link>
          </div>

          {/* Back to Home + Currency + Theme Toggle */}
          <div className="px-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <Link 
                href="/"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm hover:text-lemon-400 transition-colors",
                  theme === 'dark' ? 'text-dark-400' : 'text-gray-500'
                )}
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-1">
                {user && <NotificationBell userId={user.id} />}
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    theme === 'dark' 
                      ? 'text-dark-400 hover:text-white hover:bg-dark-800' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Currency Toggle */}
            <div className={cn(
              "flex items-center justify-between p-1 rounded-xl",
              theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
            )}>
              <button
                onClick={() => setCurrency('SSP')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  currency === 'SSP' 
                    ? 'bg-lemon-400 text-dark-900' 
                    : theme === 'dark' ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                )}
              >
                SSP
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  currency === 'USD' 
                    ? 'bg-lemon-400 text-dark-900' 
                    : theme === 'dark' ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                )}
              >
                USD
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-lemon-400/10 text-lemon-400 border border-lemon-400/20'
                      : theme === 'dark'
                        ? 'text-dark-300 hover:bg-dark-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn(
                    'h-5 w-5 mr-3 transition-colors',
                    isActive 
                      ? 'text-lemon-400' 
                      : theme === 'dark' 
                        ? 'text-dark-500 group-hover:text-dark-300'
                        : 'text-gray-400 group-hover:text-gray-600'
                  )} />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-lemon-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Integration Guide Link */}
          <div className="px-4 mb-4">
            <Link
              href="/docs/integration"
              target="_blank"
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all border",
                theme === 'dark'
                  ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400 hover:bg-emerald-900/30'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              )}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              Integration Guide
              <ExternalLink className="ml-auto h-4 w-4 opacity-50" />
            </Link>
          </div>

          {/* User Section */}
          <div className="px-4 mt-auto">
            <div className={cn("border-t pt-4", theme === 'dark' ? 'border-dark-800' : 'border-gray-200')}>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all mb-2",
                    "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                  )}
                >
                  <Crown className="h-5 w-5 mr-3" />
                  Admin Panel
                </Link>
              )}
              <div className={cn(
                "px-4 py-3 rounded-xl mb-2",
                theme === 'dark' ? 'bg-dark-800/50' : 'bg-gray-100'
              )}>
                <p className={cn("text-sm font-semibold truncate", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {user?.business_name || user?.full_name}
                </p>
                <p className={cn("text-xs truncate", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className={cn(
                  "flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all",
                  theme === 'dark' 
                    ? 'text-dark-400 hover:text-white hover:bg-dark-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
