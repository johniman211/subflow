'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Video,
  Download,
  Users,
  Package,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  MessageSquare,
  Share2,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Creator {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
}

const navigation = [
  { name: 'Overview', href: '/creator', icon: LayoutDashboard },
  { name: 'All Content', href: '/creator/content', icon: FileText },
  { name: 'Blog Posts', href: '/creator/content/blog', icon: FileText },
  { name: 'Videos', href: '/creator/content/videos', icon: Video },
  { name: 'Files', href: '/creator/content/files', icon: Download },
  { name: 'Community', href: '/creator/community', icon: MessageSquare },
  { name: 'Products', href: '/creator/products', icon: Package },
  { name: 'Subscribers', href: '/creator/subscribers', icon: Users },
  { name: 'Payments', href: '/creator/payments', icon: CreditCard },
  { name: 'Settings', href: '/creator/settings', icon: Settings },
];

interface CreatorNavProps {
  user: User | null;
  creator: Creator | null;
  isCreator?: boolean;
}

export function CreatorNav({ user, creator, isCreator = true }: CreatorNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
          <Link href="/creator" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className={cn("font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Creator Studio</span>
          </Link>
          <div className="flex items-center gap-2">
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
                "p-2 rounded-lg",
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
          <nav className="px-4 py-4 space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-4",
                theme === 'dark' 
                  ? 'text-dark-400 hover:text-white hover:bg-dark-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/creator' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? theme === 'dark'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-purple-100 text-purple-700'
                      : theme === 'dark'
                        ? 'text-dark-400 hover:text-white hover:bg-dark-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mt-4",
                theme === 'dark'
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-red-600 hover:bg-red-50'
              )}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col border-r",
        theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'
      )}>
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 mb-6">
            <Link href="/creator" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">C</span>
              </div>
              <div>
                <span className={cn("font-bold block", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  Creator Studio
                </span>
                <span className="text-xs text-dark-400">by PaySSD</span>
              </div>
            </Link>
          </div>

          {/* Back to Dashboard */}
          <div className="px-3 mb-4">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                theme === 'dark' 
                  ? 'text-dark-400 hover:text-white hover:bg-dark-800 border border-dark-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Creator Profile Preview */}
          {creator && (
            <div className={cn(
              "mx-3 mb-4 p-3 rounded-xl",
              theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {creator.display_name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm truncate", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {creator.display_name}
                  </p>
                  <p className="text-xs text-dark-400 truncate">@{creator.username}</p>
                </div>
                <Link
                  href={`/c/${creator.username}`}
                  target="_blank"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-200 text-gray-500'
                  )}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/creator' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-sm'
                        : 'bg-purple-100 text-purple-700'
                      : theme === 'dark'
                        ? 'text-dark-400 hover:text-white hover:bg-dark-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className={cn(
            "flex-shrink-0 px-3 pt-4 border-t",
            theme === 'dark' ? 'border-dark-800' : 'border-gray-200'
          )}>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                theme === 'dark' ? 'bg-dark-700' : 'bg-gray-200'
              )}>
                <span className={cn("text-sm font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-dark-400 truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    theme === 'dark' ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleSignOut}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    theme === 'dark' ? 'text-dark-400 hover:text-red-400 hover:bg-dark-800' : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
