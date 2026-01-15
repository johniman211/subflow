'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
              <span className="text-[#333] font-black text-xs italic">PAY</span>
            </div>
            <span className="text-xl font-black text-white italic">SSD</span>
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Creator Studio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Start Monetizing Your{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Content
            </span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Create and sell premium videos, blog posts, files, and build a community. 
            Accept payments via MTN MoMo and bank transfer.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="bg-dark-900/50 border border-dark-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-dark-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Enable Creator Form */}
        <div className="max-w-lg mx-auto">
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Enable Creator Studio
            </h2>
            <p className="text-dark-400 text-center mb-6">
              Choose your unique username to get started
            </p>

            <form onSubmit={handleEnableCreator} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-dark-200 mb-2">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Creator Name"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-dark-200 mb-2">
                  Username
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-dark-800 border border-dark-700 border-r-0 rounded-l-xl text-dark-400">
                    payssd.com/c/
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="yourname"
                    className="input flex-1 rounded-l-none"
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </div>
                <p className="text-dark-500 text-xs mt-2">
                  3-30 characters. Letters, numbers, underscores, and hyphens only.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username.trim() || !displayName.trim()}
                className="w-full btn-primary py-4 text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Enable Creator Studio
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-dark-800">
              <div className="flex items-start gap-3 text-sm text-dark-400">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
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
