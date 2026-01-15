'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sun, Moon, ChevronRight, Code, BookOpen, Newspaper, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface PublicHeaderProps {
  showUseCases?: boolean;
}

export function PublicHeader({ showUseCases = true }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={cn(
      "sticky top-0 z-50 backdrop-blur-xl border-b",
      theme === 'dark' ? 'bg-dark-950/80 border-dark-800' : 'bg-white/80 border-gray-200'
    )}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
              <span className="text-[#333] font-black text-xs italic">PAY</span>
            </div>
            <span className={cn(
              "text-xl font-black italic",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>SSD</span>
          </Link>
          
          {showUseCases && (
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className={cn(
                "text-sm font-medium transition-colors",
                theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}>Features</Link>
              <Link href="#creator-studio" className={cn(
                "text-sm font-medium transition-colors",
                theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}>Creator Studio</Link>
              <Link href="#how-it-works" className={cn(
                "text-sm font-medium transition-colors",
                theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}>How It Works</Link>
              
              {/* Use Cases Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setUseCasesOpen(true)}
                onMouseLeave={() => setUseCasesOpen(false)}
              >
                <button className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors",
                  theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                )}>
                  Use Cases
                  <ChevronRight className={`h-4 w-4 transition-transform ${useCasesOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {useCasesOpen && (
                  <div className={cn(
                    "absolute top-full left-0 mt-2 w-64 border rounded-xl shadow-xl overflow-hidden z-50",
                    theme === 'dark' ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'
                  )}>
                    <Link 
                      href="/use-cases/saas" 
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors",
                        theme === 'dark' ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="w-8 h-8 bg-lemon-400/20 rounded-lg flex items-center justify-center">
                        <Code className="h-4 w-4 text-lemon-400" />
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>SaaS & Software</p>
                        <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Subscription software</p>
                      </div>
                    </Link>
                    <Link 
                      href="/use-cases/courses" 
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors",
                        theme === 'dark' ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="w-8 h-8 bg-lemon-400/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-lemon-400" />
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Courses & Digital Products</p>
                        <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Online education</p>
                      </div>
                    </Link>
                    <Link 
                      href="/use-cases/media" 
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors",
                        theme === 'dark' ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="w-8 h-8 bg-lemon-400/20 rounded-lg flex items-center justify-center">
                        <Newspaper className="h-4 w-4 text-lemon-400" />
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Media & Publishers</p>
                        <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Content monetization</p>
                      </div>
                    </Link>
                    <Link 
                      href="/use-cases/creators" 
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors",
                        theme === 'dark' ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="w-8 h-8 bg-lemon-400/20 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-lemon-400" />
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Creators & Public Figures</p>
                        <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Audience monetization</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
              
              <Link href="#pricing" className={cn(
                "text-sm font-medium transition-colors",
                theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}>Pricing</Link>
              <Link href="/docs" className={cn(
                "text-sm font-medium transition-colors",
                theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}>Docs</Link>
            </div>
          )}
          
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-colors",
                theme === 'dark' 
                  ? 'text-dark-400 hover:text-white hover:bg-dark-800' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <Link href="/auth/login" className={cn(
              "text-sm font-medium transition-colors",
              theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            )}>
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary btn-sm">
              Get Started Free
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-colors",
                theme === 'dark' 
                  ? 'text-dark-400 hover:text-white' 
                  : 'text-gray-500 hover:text-gray-900'
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={cn(
            "md:hidden mt-4 pb-4 border-t pt-4",
            theme === 'dark' ? 'border-dark-800' : 'border-gray-200'
          )}>
            <div className="flex flex-col space-y-4">
              {showUseCases && (
                <>
                  <Link href="#features" className={cn(
                    "text-sm font-medium",
                    theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  )}>Features</Link>
                  <Link href="#creator-studio" className={cn(
                    "text-sm font-medium",
                    theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  )}>Creator Studio</Link>
                  <Link href="#how-it-works" className={cn(
                    "text-sm font-medium",
                    theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  )}>How It Works</Link>
                  
                  {/* Use Cases - Mobile */}
                  <div className="space-y-2">
                    <p className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      theme === 'dark' ? 'text-dark-500' : 'text-gray-400'
                    )}>Use Cases</p>
                    <Link href="/use-cases/saas" className={cn(
                      "flex items-center gap-2 text-sm font-medium pl-2",
                      theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    )}>
                      <Code className="h-4 w-4 text-lemon-400" />
                      SaaS & Software
                    </Link>
                    <Link href="/use-cases/courses" className={cn(
                      "flex items-center gap-2 text-sm font-medium pl-2",
                      theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    )}>
                      <BookOpen className="h-4 w-4 text-lemon-400" />
                      Courses & Digital Products
                    </Link>
                    <Link href="/use-cases/media" className={cn(
                      "flex items-center gap-2 text-sm font-medium pl-2",
                      theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    )}>
                      <Newspaper className="h-4 w-4 text-lemon-400" />
                      Media & Publishers
                    </Link>
                    <Link href="/use-cases/creators" className={cn(
                      "flex items-center gap-2 text-sm font-medium pl-2",
                      theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    )}>
                      <Users className="h-4 w-4 text-lemon-400" />
                      Creators & Public Figures
                    </Link>
                  </div>
                  
                  <Link href="#pricing" className={cn(
                    "text-sm font-medium",
                    theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  )}>Pricing</Link>
                  <Link href="/docs" className={cn(
                    "text-sm font-medium",
                    theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  )}>Docs</Link>
                </>
              )}
              <hr className={theme === 'dark' ? 'border-dark-800' : 'border-gray-200'} />
              <Link href="/auth/login" className={cn(
                "text-sm font-medium",
                theme === 'dark' ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}>Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-center">Get Started Free</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
