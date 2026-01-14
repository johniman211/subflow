'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bell, Check, CheckCheck, Loader2, Filter, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import type { Notification } from '@/types/database';

export default function NotificationsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    getUserId();
  }, [filter]);

  const getUserId = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel(`notifications:page:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotification.id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });
          
          if (!newNotification.read_at) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotifications = async (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        limit: '20',
        unreadOnly: filter === 'unread' ? '1' : '0',
      });
      if (cursor) {
        params.set('cursor', cursor);
      }

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (cursor) {
          setNotifications((prev) => [...prev, ...(data.data || [])]);
        } else {
          setNotifications(data.data || []);
        }
        
        setUnreadCount(data.unreadCount || 0);
        setNextCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleMarkRead = async (notification: Notification) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    if (!notification.read_at) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link);
    }

    // API call
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notification.id }),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) {
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!userId) return;
    
    setSendingTest(true);
    
    try {
      const supabase = createClient();
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'demo',
        title: 'Test notification',
        body: 'This is a realtime test notification. If you see this, realtime is working!',
        link: '/dashboard/notifications',
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setSendingTest(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Notifications
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isDev && (
            <button
              onClick={handleSendTestNotification}
              disabled={sendingTest}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors",
                theme === 'dark'
                  ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border border-purple-800'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
              )}
            >
              {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Test
            </button>
          )}
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAllRead}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors",
                theme === 'dark'
                  ? 'bg-dark-800 text-white hover:bg-dark-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              )}
            >
              {markingAllRead ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={cn(
        "flex items-center p-1 rounded-xl w-fit",
        theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
      )}>
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            filter === 'all'
              ? theme === 'dark' ? 'bg-dark-700 text-white' : 'bg-white text-gray-900 shadow-sm'
              : theme === 'dark' ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            filter === 'unread'
              ? theme === 'dark' ? 'bg-dark-700 text-white' : 'bg-white text-gray-900 shadow-sm'
              : theme === 'dark' ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          )}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      <div className={cn(
        "rounded-2xl border overflow-hidden",
        theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'
      )}>
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className={cn("h-8 w-8 animate-spin mx-auto", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-dark-800">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleMarkRead(notification)}
                className={cn(
                  "w-full px-6 py-4 text-left transition-colors flex gap-4",
                  !notification.read_at && (theme === 'dark' ? 'bg-dark-800/30' : 'bg-blue-50/50'),
                  theme === 'dark' ? 'hover:bg-dark-800' : 'hover:bg-gray-50'
                )}
              >
                {/* Unread indicator */}
                <div className="flex-shrink-0 pt-1">
                  {!notification.read_at ? (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  ) : (
                    <div className="w-2.5 h-2.5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={cn(
                        "font-medium",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className={cn(
                          "text-sm mt-1",
                          theme === 'dark' ? 'text-dark-400' : 'text-gray-500'
                        )}>
                          {notification.body}
                        </p>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs flex-shrink-0",
                      theme === 'dark' ? 'text-dark-500' : 'text-gray-400'
                    )}>
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  
                  {notification.link && (
                    <p className={cn(
                      "text-xs mt-2",
                      theme === 'dark' ? 'text-lemon-400' : 'text-blue-600'
                    )}>
                      Click to view →
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={cn(
            "p-12 text-center",
            theme === 'dark' ? 'text-dark-500' : 'text-gray-500'
          )}>
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">
              {filter === 'unread' ? "You've read all your notifications" : "You don't have any notifications yet"}
            </p>
          </div>
        )}

        {/* Load More */}
        {nextCursor && !loading && (
          <div className={cn(
            "px-6 py-4 border-t",
            theme === 'dark' ? 'border-dark-800' : 'border-gray-200'
          )}>
            <button
              onClick={() => fetchNotifications(nextCursor)}
              disabled={loadingMore}
              className={cn(
                "w-full py-2 text-sm font-medium rounded-xl transition-colors",
                theme === 'dark'
                  ? 'text-lemon-400 hover:bg-dark-800'
                  : 'text-blue-600 hover:bg-gray-100'
              )}
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Load more'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
