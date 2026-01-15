'use client';

import Link from 'next/link';
import { Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthWallProps {
  contentTitle?: string;
  creatorName?: string;
  redirectUrl: string;
  contentType?: 'video' | 'post' | 'file' | 'community';
}

export function AuthWall({ 
  contentTitle, 
  creatorName, 
  redirectUrl,
  contentType = 'video'
}: AuthWallProps) {
  const contentTypeLabels = {
    video: 'video',
    post: 'article',
    file: 'file',
    community: 'community',
  };

  return (
    <div className="bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700 p-8 md:p-12 max-w-lg mx-auto text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-purple-400" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Premium Content
      </h2>

      {contentTitle && (
        <p className="text-lg text-white font-medium mb-2">
          "{contentTitle}"
        </p>
      )}

      <p className="text-dark-300 mb-8">
        {creatorName ? (
          <>This {contentTypeLabels[contentType]} by <span className="text-purple-400 font-medium">{creatorName}</span> is for members only.</>
        ) : (
          <>This {contentTypeLabels[contentType]} is for members only.</>
        )}
        <br />
        <span className="text-dark-400">Create an account or sign in to continue.</span>
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/auth/register?next=${encodeURIComponent(redirectUrl)}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <UserPlus className="h-5 w-5" />
          Create Account
        </Link>
        <Link
          href={`/auth/login?next=${encodeURIComponent(redirectUrl)}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-800 border border-dark-600 text-white font-semibold rounded-xl hover:bg-dark-700 transition-colors"
        >
          <LogIn className="h-5 w-5" />
          Sign In
        </Link>
      </div>

      <p className="mt-8 text-dark-500 text-sm">
        After signing in, you'll be redirected back to this content.
      </p>
    </div>
  );
}
