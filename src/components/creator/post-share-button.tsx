'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle, Link2 } from 'lucide-react';

interface PostShareButtonProps {
  postId: string;
  creatorUsername: string;
  postTitle?: string;
}

export function PostShareButton({ postId, creatorUsername, postTitle }: PostShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${creatorUsername}/community/post/${postId}`;
  const shareTitle = postTitle || 'Check out this post';

  const copyLink = async () => {
    await navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      action: copyLink,
      color: copied ? 'text-green-400' : 'text-dark-300',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${postUrl}`)}`),
      color: 'text-green-500',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(postUrl)}`),
      color: 'text-blue-400',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`),
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors text-sm"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-dark-700">
              <p className="text-xs text-dark-400">Share this post</p>
            </div>
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  option.action();
                  if (option.name !== 'Copy Link') setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-700 transition-colors text-left"
              >
                <option.icon className={`h-4 w-4 ${option.color}`} />
                <span className="text-white text-sm">{option.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
