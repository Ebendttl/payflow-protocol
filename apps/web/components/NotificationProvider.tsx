'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useWalletStore } from '../lib/store/walletStore';
import { useStreams } from '../lib/hooks/useStream';
import toast from 'react-hot-toast';

export interface ActivityNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: ActivityNotification[];
  isOpen: boolean;
  unreadCount: number;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addNotification: (message: string, type?: ActivityNotification['type'], link?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { publicKey } = useWalletStore();
  const { streams } = useStreams(publicKey);
  const prevStreamsRef = useRef<any[]>([]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add notification function
  const addNotification = (
    message: string,
    type: ActivityNotification['type'] = 'info',
    link?: string
  ) => {
    const newNotif: ActivityNotification = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date(),
      read: false,
      link,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show live toast-style entry using react-hot-toast
    toast(message, {
      icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'alert' ? '🚨' : 'ℹ️',
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        color: '#f3f4f6',
        border: '1px solid rgba(13, 148, 136, 0.4)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        fontSize: '14px',
      },
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Initial welcome / guide notification
  useEffect(() => {
    addNotification(
      'Welcome to PayFlow Protocol! Connecting your wallet will unlock real-time stream monitoring.',
      'info'
    );
  }, []);

  // Monitor streams updates and issue real notifications
  useEffect(() => {
    if (!publicKey || streams.length === 0) {
      prevStreamsRef.current = [];
      return;
    }

    const prevStreams = prevStreamsRef.current;

    // Detect new streams
    if (prevStreams.length > 0 && streams.length > prevStreams.length) {
      const addedCount = streams.length - prevStreams.length;
      addNotification(`Successfully initialized ${addedCount} new token stream(s) on Stellar Soroban!`, 'success', '/streams');
    }

    // Compare individual stream changes
    streams.forEach((stream) => {
      const prevStream = prevStreams.find((ps) => ps.id === stream.id);
      if (prevStream) {
        // Status change
        if (prevStream.status !== stream.status) {
          addNotification(
            `Stream #${stream.id.toString().slice(0, 8)} status changed to ${stream.status}`,
            stream.status === 'Active' ? 'success' : 'warning',
            '/streams'
          );
        }
      }
    });

    prevStreamsRef.current = streams;
  }, [streams, publicKey]);

  // Simulate real-time mock updates to showcase premium feed experience
  useEffect(() => {
    // List of realistic notifications matching user specifications
    const mockEvents = [
      { message: 'Stream #42 reached 80% completion', type: 'success' as const, link: '/streams' },
      { message: 'You have 12.5 USDC claimable from incoming streams', type: 'info' as const, link: '/streams' },
      { message: 'Escrow #101 milestone 2 was approved by the arbiter', type: 'success' as const, link: '/escrow' },
      { message: 'Escrow #205 milestone 1 has a dispute raised', type: 'alert' as const, link: '/escrow' },
      { message: 'Gas warning: Stellar testnet XLM reserves are running low', type: 'warning' as const },
      { message: 'New transaction batch settled on Stellar Soroban ledger', type: 'success' as const },
    ];

    // Trigger one every 40-50 seconds
    const interval = setInterval(() => {
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      addNotification(randomEvent.message, randomEvent.type, randomEvent.link);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isOpen,
        unreadCount,
        setIsOpen,
        toggleOpen,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
