'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 to-dark-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-lemon-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-grape-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="inline-flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-lemon-400 rounded-xl flex items-center justify-center shadow-lemon">
              <span className="text-dark-900 font-black text-2xl">L</span>
            </div>
            <span className="text-2xl font-bold text-white">Losetify</span>
          </Link>
          
          <h1 className="text-4xl font-black text-white mb-4">
            Welcome back to your{' '}
            <span className="gradient-text">dashboard</span>
          </h1>
          <p className="text-xl text-dark-300 mb-8">
            Manage subscriptions, track payments, and grow your business.
          </p>
          
          <div className="space-y-4">
            {[
              'Real-time payment tracking',
              'Automated subscription management',
              'Detailed analytics & insights',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-lemon-400/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-lemon-400" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center">
                <span className="text-dark-900 font-black text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-white">Losetify</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white">Sign in</h2>
            <p className="mt-2 text-dark-400">Access your merchant dashboard</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-danger-500/10 border border-danger-500/20 text-danger-500 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="mt-2 relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-12"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full group"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-dark-400">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-lemon-400 hover:text-lemon-300 font-semibold transition-colors">
                  Sign up free
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-dark-500 text-sm">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-dark-400 hover:text-lemon-400">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-dark-400 hover:text-lemon-400">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
