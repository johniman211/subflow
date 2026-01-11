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
} from 'lucide-react';
import { useState } from 'react';

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
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardNavProps {
  user: User | null;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-xl border-b border-dark-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-lemon-400 rounded-lg flex items-center justify-center">
              <span className="text-dark-900 font-black">S</span>
            </div>
            <span className="font-bold text-white">SubFlow</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-dark-900 pt-16">
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
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <hr className="border-dark-800 my-4" />
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-dark-900 border-r border-dark-800 pt-6 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-2">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center shadow-lemon">
                <span className="text-dark-900 font-black text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-white">SubFlow</span>
            </Link>
          </div>

          {/* Back to Home Link */}
          <div className="px-4 mb-6">
            <Link 
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-dark-400 hover:text-lemon-400 transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
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
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  )}
                >
                  <item.icon className={cn(
                    'h-5 w-5 mr-3 transition-colors',
                    isActive ? 'text-lemon-400' : 'text-dark-500 group-hover:text-dark-300'
                  )} />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-lemon-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="px-4 mt-auto">
            <div className="border-t border-dark-800 pt-4">
              <div className="px-4 py-3 rounded-xl bg-dark-800/50 mb-2">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.business_name || user?.full_name}
                </p>
                <p className="text-xs text-dark-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all"
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
