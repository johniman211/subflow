'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const { theme } = useTheme();

  return (
    <PublicLayout>
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-lemon-400 font-semibold text-sm uppercase tracking-wider mb-4">Contact Us</p>
              <h1 className={cn(
                "text-4xl md:text-5xl font-black mb-6",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>Get in Touch</h1>
              <p className={cn(
                "text-xl",
                theme === 'dark' ? 'text-dark-300' : 'text-gray-600'
              )}>We'd love to hear from you. Reach out to our team.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className={cn(
                  "text-2xl font-bold mb-6",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-lemon-400" />
                    </div>
                    <div>
                      <h3 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Email</h3>
                      <p className={theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}>support@payssd.com</p>
                      <p className={cn("text-sm", theme === 'dark' ? 'text-dark-500' : 'text-gray-500')}>We'll respond within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-grape-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-grape-400" />
                    </div>
                    <div>
                      <h3 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Phone</h3>
                      <p className={theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}>+211929385157</p>
                      <p className={cn("text-sm", theme === 'dark' ? 'text-dark-500' : 'text-gray-500')}>Mon-Fri, 9am-5pm EAT</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-success-500" />
                    </div>
                    <div>
                      <h3 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>WhatsApp</h3>
                      <p className={theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}>+211929385157</p>
                      <p className={cn("text-sm", theme === 'dark' ? 'text-dark-500' : 'text-gray-500')}>Quick support via WhatsApp</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-lemon-400" />
                    </div>
                    <div>
                      <h3 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>Location</h3>
                      <p className={theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}>Juba, South Sudan</p>
                      <p className={cn("text-sm", theme === 'dark' ? 'text-dark-500' : 'text-gray-500')}>Serving East Africa</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className={cn(
                "rounded-2xl p-8 border",
                theme === 'dark' ? 'bg-dark-900/50 border-dark-800' : 'bg-white border-gray-200 shadow-sm'
              )}>
                <h2 className={cn(
                  "text-2xl font-bold mb-6",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>Send a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      theme === 'dark' ? 'text-dark-300' : 'text-gray-700'
                    )}>Name</label>
                    <input
                      type="text"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lemon-400 focus:border-lemon-400",
                        theme === 'dark' 
                          ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      )}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      theme === 'dark' ? 'text-dark-300' : 'text-gray-700'
                    )}>Email</label>
                    <input
                      type="email"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lemon-400 focus:border-lemon-400",
                        theme === 'dark' 
                          ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      )}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      theme === 'dark' ? 'text-dark-300' : 'text-gray-700'
                    )}>Phone</label>
                    <input
                      type="tel"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lemon-400 focus:border-lemon-400",
                        theme === 'dark' 
                          ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      )}
                      placeholder="+211 9XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      theme === 'dark' ? 'text-dark-300' : 'text-gray-700'
                    )}>Message</label>
                    <textarea
                      rows={4}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lemon-400 focus:border-lemon-400",
                        theme === 'dark' 
                          ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      )}
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary py-3"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
