'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bell, Check, CheckCheck, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import type { Notification } from '@/types/database';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel(`notifications:user:${userId}`)
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
          
          // Dedupe and prepend
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotification.id)) {
              return prev;
            }
            return [newNotification, ...prev].slice(0, 10);
          });
          
          // Increment unread count
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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
      setIsOpen(false);
      router.push(notification.link);
    }

    // API call
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notification.id }),
      });

      if (!response.ok) {
        // Rollback on error
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read_at: null } : n
          )
        );
        if (!notification.read_at) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    
    // Optimistic update
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
        // Rollback on error
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          theme === 'dark'
            ? 'text-dark-400 hover:text-white hover:bg-dark-800'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - Fixed position to avoid sidebar clipping */}
      {isOpen && (
        <div 
          className={cn(
            "fixed left-4 lg:left-auto lg:absolute lg:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] rounded-xl shadow-2xl border overflow-hidden",
            theme === 'dark' ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'
          )}
          style={{ zIndex: 9999 }}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between px-4 py-3 border-b",
            theme === 'dark' ? 'border-dark-700' : 'border-gray-200'
          )}>
            <h3 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className={cn(
                  "text-xs font-medium flex items-center gap-1 transition-colors",
                  theme === 'dark' 
                    ? 'text-lemon-400 hover:text-lemon-300' 
                    : 'text-blue-600 hover:text-blue-700'
                )}
              >
                {markingAllRead ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className={cn("h-6 w-6 animate-spin mx-auto", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleMarkRead(notification)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors flex gap-3 border-b last:border-b-0",
                    !notification.read_at && (theme === 'dark' ? 'bg-dark-800/50' : 'bg-blue-50/50'),
                    theme === 'dark' 
                      ? 'border-dark-800 hover:bg-dark-800' 
                      : 'border-gray-100 hover:bg-gray-50'
                  )}
                >
                  {/* Unread indicator */}
                  <div className="flex-shrink-0 pt-1">
                    {!notification.read_at ? (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    ) : (
                      <div className="w-2 h-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className={cn(
                        "text-xs mt-0.5 line-clamp-2",
                        theme === 'dark' ? 'text-dark-400' : 'text-gray-500'
                      )}>
                        {notification.body}
                      </p>
                    )}
                    <p className={cn(
                      "text-xs mt-1",
                      theme === 'dark' ? 'text-dark-500' : 'text-gray-400'
                    )}>
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className={cn(
                "p-8 text-center text-sm",
                theme === 'dark' ? 'text-dark-500' : 'text-gray-500'
              )}>
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No notifications yet
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn(
            "px-4 py-3 border-t",
            theme === 'dark' ? 'border-dark-700' : 'border-gray-200'
          )}>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/dashboard/notifications');
              }}
              className={cn(
                "w-full text-center text-sm font-medium py-2 rounded-lg transition-colors",
                theme === 'dark'
                  ? 'text-lemon-400 hover:bg-dark-800'
                  : 'text-blue-600 hover:bg-gray-100'
              )}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
