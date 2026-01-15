'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Video, 
  FileText, 
  Download, 
  MessageSquare, 
  Wallet, 
  Users, 
  ArrowRight, 
  Loader2,
  Check,
  Home
} from 'lucide-react';

export default function CreatorOnboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const features = [
    {
      icon: Video,
      title: 'Video Content',
      description: 'Embed videos from YouTube, Facebook, Instagram, or TikTok',
    },
    {
      icon: FileText,
      title: 'Blog Posts',
      description: 'Write and publish premium articles with rich content',
    },
    {
      icon: Download,
      title: 'Digital Downloads',
      description: 'Sell files, PDFs, templates, and other digital products',
    },
    {
      icon: MessageSquare,
      title: 'Community',
      description: 'Build a members-only community with exclusive posts',
    },
    {
      icon: Wallet,
      title: 'Easy Payments',
      description: 'Accept MTN MoMo and bank transfers from your audience',
    },
    {
      icon: Users,
      title: 'Subscriber Management',
      description: 'Track subscribers, verify payments, and manage access',
    },
  ];

  const handleEnableCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !displayName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      setError('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?next=/creator/onboard');
        return;
      }

      // Check if username is already taken
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();

      if (existingCreator) {
        setError('This username is already taken. Please choose another.');
        setIsLoading(false);
        return;
      }

      // Enable creator role on user
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_creator: true })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Create creator profile
      const { error: creatorError } = await supabase
        .from('creators')
        .insert({
          user_id: user.id,
          username: username.toLowerCase(),
          display_name: displayName.trim(),
          is_active: true,
        });

      if (creatorError) {
        // Rollback user update if creator creation fails
        await supabase
          .from('users')
          .update({ is_creator: false })
          .eq('id', user.id);
        throw creatorError;
      }

      // Redirect to creator dashboard
      router.push('/creator');
      router.refresh();
    } catch (err: any) {
      console.error('Error enabling creator:', err);
      setError(err.message || 'Failed to enable Creator Studio. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen",
      theme === 'dark' ? 'bg-dark-950' : 'bg-gray-50'
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-xl border-b",
        theme === 'dark' ? 'bg-dark-950/80 border-dark-800' : 'bg-white/80 border-gray-200'
      )}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
              <span className="text-[#333] font-black text-xs italic">PAY</span>
            </div>
            <span className={cn(
              "text-xl font-black italic",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>SSD</span>
          </Link>
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center gap-2 transition-colors",
              theme === 'dark' ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border",
            theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
          )}>
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-purple-600 text-sm font-medium">Creator Studio</span>
          </div>
          <h1 className={cn(
            "text-4xl md:text-5xl font-black mb-4",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Start Monetizing Your{' '}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Content
            </span>
          </h1>
          <p className={cn(
            "text-xl max-w-2xl mx-auto",
            theme === 'dark' ? 'text-dark-300' : 'text-gray-600'
          )}>
            Create and sell premium videos, blog posts, files, and build a community. 
            Accept payments via MTN MoMo and bank transfer.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature, i) => (
            <div 
              key={i}
              className={cn(
                "rounded-2xl p-6 border transition-colors",
                theme === 'dark' 
                  ? 'bg-dark-900/50 border-dark-800 hover:border-purple-500/30' 
                  : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm'
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-100'
              )}>
                <feature.icon className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className={cn(
                "font-semibold mb-2",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>{feature.title}</h3>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-dark-400' : 'text-gray-600'
              )}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Enable Creator Form */}
        <div className="max-w-lg mx-auto">
          <div className={cn(
            "rounded-2xl p-8 border",
            theme === 'dark' ? 'bg-dark-900/50 border-dark-800' : 'bg-white border-gray-200 shadow-sm'
          )}>
            <h2 className={cn(
              "text-2xl font-bold mb-2 text-center",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Enable Creator Studio
            </h2>
            <p className={cn(
              "text-center mb-6",
              theme === 'dark' ? 'text-dark-400' : 'text-gray-600'
            )}>
              Choose your unique username to get started
            </p>

            <form onSubmit={handleEnableCreator} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="displayName" className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? 'text-dark-200' : 'text-gray-700'
                )}>
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Creator Name"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500",
                    theme === 'dark' 
                      ? 'bg-dark-800 border-dark-700 text-white placeholder:text-dark-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  )}
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? 'text-dark-200' : 'text-gray-700'
                )}>
                  Username
                </label>
                <div className="flex items-center">
                  <span className={cn(
                    "px-4 py-3 border border-r-0 rounded-l-xl text-sm",
                    theme === 'dark' 
                      ? 'bg-dark-800 border-dark-700 text-dark-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  )}>
                    payssd.com/c/
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="yourname"
                    className={cn(
                      "flex-1 px-4 py-3 rounded-r-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500",
                      theme === 'dark' 
                        ? 'bg-dark-800 border-dark-700 text-white placeholder:text-dark-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    )}
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </div>
                <p className={cn(
                  "text-xs mt-2",
                  theme === 'dark' ? 'text-dark-500' : 'text-gray-500'
                )}>
                  3-30 characters. Letters, numbers, underscores, and hyphens only.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username.trim() || !displayName.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Enable Creator Studio
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className={cn(
              "mt-6 pt-6 border-t",
              theme === 'dark' ? 'border-dark-800' : 'border-gray-200'
            )}>
              <div className={cn(
                "flex items-start gap-3 text-sm",
                theme === 'dark' ? 'text-dark-400' : 'text-gray-600'
              )}>
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  You can still subscribe to other creators and access content as an audience member.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
