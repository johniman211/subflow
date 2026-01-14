'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Loader2, CheckCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setResending(true);
    setError('');
    
    const supabase = createClient();
    
    // Get the email from URL params or session
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    
    if (!email) {
      setError('Email not found. Please try registering again.');
      setResending(false);
      return;
    }

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setResent(true);
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-lemon-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-lemon-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-dark-400 mb-6">
            We've sent a verification link to your email address. 
            Please click the link to verify your account and start using Payssd.
          </p>

          {error && (
            <div className="bg-danger-500/10 border border-danger-500/20 text-danger-500 p-4 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {resent ? (
            <div className="flex items-center justify-center gap-2 text-success-500 mb-6">
              <CheckCircle className="w-5 h-5" />
              <span>Verification email resent!</span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center justify-center gap-2 text-dark-400 hover:text-lemon-400 transition-colors mb-6 mx-auto"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Resend verification email
            </button>
          )}

          <div className="pt-6 border-t border-dark-700">
            <p className="text-dark-500 text-sm mb-4">
              Already verified?
            </p>
            <Link
              href="/auth/login"
              className="btn-primary inline-flex"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-dark-500 text-sm">
          Didn't receive the email? Check your spam folder or{' '}
          <Link href="/contact" className="text-lemon-400 hover:text-lemon-300">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
