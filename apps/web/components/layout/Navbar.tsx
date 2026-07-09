'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Activity, ShieldCheck, BarChart3, Link2 } from 'lucide-react';
import WalletButton from '../WalletButton';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Streams', path: '/streams', icon: Activity },
    { label: 'Escrow', path: '/escrow', icon: ShieldCheck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Request', path: '/request', icon: Link2 },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-dark-900/80 backdrop-blur-lg border-b border-white/5 shadow-lg shadow-black/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
          {/* Logo / Wordmark */}
          <Link href="/" id="tour-logo" className="flex items-center gap-2 group">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-dark-800 border border-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-md shadow-primary/10">
              <Image src="/icon.png" alt="PayFlow Logo" fill priority className="object-cover" />
            </div>
            <span
              className="font-bold text-lg tracking-tight text-[#F0EEE9] group-hover:text-primary-light transition-colors duration-200"
              style={{ fontSize: '18px', letterSpacing: '-0.02em', fontWeight: 700 }}
            >
              PayFlow
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  id={`tour-nav-${link.label.toLowerCase()}`}
                  className={`relative py-2 text-sm font-semibold transition-colors duration-200 ${
                    isActive ? 'text-primary-light font-bold' : 'text-dark-500 hover:text-[#F0EEE9]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action / Wallet button & mobile toggle */}
          <div className="flex items-center gap-3">
            <div id="tour-wallet-btn" className="hidden sm:block">
              <WalletButton />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-dark-800 border border-white/5 text-dark-500 hover:text-white transition"
              aria-label="Open mobile menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 max-w-full bg-dark-900 border-l border-white/5 p-6 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div className="space-y-8">
                {/* Header inside drawer */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-dark-800 border border-white/5 flex items-center justify-center">
                      <Image src="/icon.png" alt="PayFlow Logo" fill className="object-cover" />
                    </div>
                    <span className="font-bold text-md text-[#F0EEE9]">PayFlow</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl bg-dark-800 border border-white/5 text-dark-500 hover:text-white transition"
                    aria-label="Close mobile menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Vertical links */}
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => {
                    const isActive =
                      pathname === link.path ||
                      (link.path !== '/' && pathname.startsWith(link.path));
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        href={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/10 text-primary-light border border-primary/20'
                            : 'text-dark-500 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Icon size={18} />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Wallet button in drawer for mobile view (if not sm screen size) */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="block sm:hidden w-full">
                  <WalletButton />
                </div>
                <p className="text-xxs text-dark-600 text-center font-medium">
                  Stellar Soroban Continuous Flow
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
