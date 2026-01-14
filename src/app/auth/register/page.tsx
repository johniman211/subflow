'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, Building, Phone, Loader2, ArrowRight, Check, Zap } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    businessName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: formData.fullName,
          business_name: formData.businessName,
          phone: formData.phone,
          role: 'merchant',
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Create the user profile in the users table
    const userId = authData.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email: formData.email,
        full_name: formData.fullName,
        business_name: formData.businessName,
        phone: formData.phone,
        role: 'merchant',
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't block registration if profile creation fails - it can be created later
      }
    }

    // Check if email confirmation is required (no session means email not yet verified)
    if (!authData.session) {
      // Redirect to email verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      // User is already verified, go to dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 to-dark-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-40 left-10 w-72 h-72 bg-grape-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-lemon-400/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="inline-flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
              <span className="text-[#333] font-black text-sm italic">PAY</span>
            </div>
            <span className="text-2xl font-black text-white italic">SSD</span>
          </Link>
          
          <h1 className="text-4xl font-black text-white mb-4">
            Start selling{' '}
            <span className="gradient-text">subscriptions</span>{' '}
            today
          </h1>
          <p className="text-xl text-dark-300 mb-8">
            Join hundreds of African businesses using Payssd to accept payments and manage subscriptions.
          </p>
          
          <div className="space-y-4">
            {[
              'No setup fees or monthly charges',
              'Accept Mobile Money & Bank Transfers',
              'Get paid directly to your account',
              'Start selling in under 5 minutes',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-lemon-400/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-lemon-400" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-dark-800/50 rounded-2xl border border-dark-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-lemon-400/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-lemon-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Quick Setup</p>
                <p className="text-dark-400 text-sm">Most merchants are live within 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="w-10 h-10 bg-lemon-400 rounded-xl flex items-center justify-center">
                <span className="text-dark-900 font-black text-xl">P</span>
              </div>
              <span className="text-xl font-bold text-white">Payssd</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white">Create account</h2>
            <p className="mt-2 text-dark-400">Start accepting payments in minutes</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-danger-500/10 border border-danger-500/20 text-danger-500 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="label">Full Name</label>
                  <div className="mt-2 relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input pl-12"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessName" className="label">Business Name</label>
                  <div className="mt-2 relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="input pl-12"
                      placeholder="My Business"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <div className="mt-2 relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input pl-12"
                    placeholder="+211 9XX XXX XXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-12"
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-dark-500">Minimum 8 characters</p>
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
                    Create Account
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-dark-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-lemon-400 hover:text-lemon-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-dark-500 text-sm">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-dark-400 hover:text-lemon-400">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-dark-400 hover:text-lemon-400">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
