'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Check, Bell, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNotifications, ActivityNotification } from '../NotificationProvider';
import Link from 'next/link';

export default function NotificationDrawer() {
  const {
    notifications,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const getIcon = (type: ActivityNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
      case 'alert':
        return <AlertCircle size={16} className="text-rose-400 shrink-0" />;
      default:
        return <Info size={16} className="text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ActivityNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20';
      case 'warning':
        return 'border-amber-500/20';
      case 'alert':
        return 'border-rose-500/20';
      default:
        return 'border-white/5';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-96 max-w-full bg-dark-900 border-l border-white/5 p-6 flex flex-col justify-between shadow-2xl"
          >
            {/* Header */}
            <div className="flex flex-col space-y-4 pb-4 border-b border-white/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-primary-light" />
                  <h3 className="font-bold text-lg text-white">Activity Feed</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-dark-800 border border-white/5 text-dark-500 hover:text-white transition"
                  aria-label="Close activity feed"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex justify-between gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-primary-light hover:text-primary transition flex items-center gap-1"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-dark-500 hover:text-accent-rose transition flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto py-4 space-y-3 pr-1 -mr-2 scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                  <div className="h-12 w-12 bg-dark-800 rounded-full border border-white/5 flex items-center justify-center text-dark-500">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">No new activity</p>
                    <p className="text-xs text-dark-500 max-w-[200px] mx-auto mt-1">
                      Platform updates and smart contract alerts will show up here.
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3.5 rounded-xl border ${getBorderColor(
                      n.type
                    )} ${
                      n.read ? 'bg-dark-800/30 opacity-70' : 'bg-dark-800/80'
                    } transition-all duration-200 hover:scale-[1.01] hover:bg-dark-800 cursor-pointer relative group flex gap-3`}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <span className="absolute top-3.5 right-3.5 h-1.5 w-1.5 rounded-full bg-primary-light" />
                    )}

                    {getIcon(n.type)}

                    <div className="flex-grow space-y-1">
                      {n.link ? (
                        <Link href={n.link} onClick={() => setIsOpen(false)}>
                          <p className="text-xs font-medium text-white group-hover:text-primary-light transition-colors leading-relaxed pr-2">
                            {n.message}
                          </p>
                        </Link>
                      ) : (
                        <p className="text-xs font-medium text-white leading-relaxed pr-2">
                          {n.message}
                        </p>
                      )}
                      <span className="text-[10px] text-dark-500 font-medium">
                        {new Date(n.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/5 text-center">
              <span className="text-xxs text-dark-600 font-medium uppercase tracking-wider">
                Stellar Soroban Ledger Telemetry
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
