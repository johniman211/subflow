'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
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
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`),
      color: 'text-green-500',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`),
      color: 'text-blue-400',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`),
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  option.action();
                  if (option.name !== 'Copy Link') setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors text-left"
              >
                <option.icon className={`h-5 w-5 ${option.color}`} />
                <span className="text-white text-sm">{option.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
