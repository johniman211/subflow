'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Users, Search, Phone, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Subscriber {
  id: string;
  customer_phone: string;
  customer_email: string | null;
  status: 'active' | 'past_due' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  product: {
    name: string;
  };
}

export default function SubscribersPage() {
  const { theme } = useTheme();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Get subscriptions for this merchant's products
    const { data } = await supabase
      .from('subscriptions')
      .select(`
        id,
        customer_phone,
        customer_email,
        status,
        current_period_start,
        current_period_end,
        product:products(name)
      `)
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSubscribers(data.map(sub => ({
        ...sub,
        product: sub.product as unknown as { name: string }
      })));
    }

    setLoading(false);
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.customer_phone.includes(searchQuery) ||
    sub.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.status === 'active').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'past_due':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-dark-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10';
      case 'past_due':
        return 'text-amber-500 bg-amber-500/10';
      case 'cancelled':
      case 'expired':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-dark-400 bg-dark-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div>
        <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
          Subscribers
        </h1>
        <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
          {activeCount} active subscribers · {subscribers.length} total
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <p className={cn("text-2xl font-bold text-green-500")}>{activeCount}</p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Active</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <p className={cn("text-2xl font-bold text-amber-500")}>
            {subscribers.filter(s => s.status === 'past_due').length}
          </p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Past Due</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <p className={cn("text-2xl font-bold text-red-500")}>
            {subscribers.filter(s => s.status === 'cancelled').length}
          </p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Cancelled</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <p className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            {subscribers.length}
          </p>
          <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>Total</p>
        </div>
      </div>

      {/* Search */}
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-xl border",
        theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex-1 relative">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
          <input
            type="text"
            placeholder="Search by phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg border",
              theme === 'dark' 
                ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-400' 
                : 'bg-gray-50 border-gray-300'
            )}
          />
        </div>
      </div>

      {/* Subscribers List */}
      {filteredSubscribers.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <Users className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No subscribers yet
          </h3>
          <p className={cn("", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Share your content to start getting subscribers
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border",
                theme === 'dark' 
                  ? 'bg-dark-800 border-dark-700' 
                  : 'bg-white border-gray-200'
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                theme === 'dark' ? 'bg-dark-700' : 'bg-gray-200'
              )}>
                <Phone className="h-5 w-5 text-dark-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {subscriber.customer_phone}
                </p>
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                  {subscriber.product?.name || 'Unknown product'}
                </p>
              </div>

              <div className="hidden md:block text-right">
                <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                  Expires
                </p>
                <p className={cn("text-sm font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {new Date(subscriber.current_period_end).toLocaleDateString()}
                </p>
              </div>

              <span className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize",
                getStatusColor(subscriber.status)
              )}>
                {getStatusIcon(subscriber.status)}
                {subscriber.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
