"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-white/5 bg-dark-900/50 backdrop-blur-sm py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo and Tagline */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center font-bold text-white text-xs">
              P
            </div>
            <span className="font-bold text-[#F0EEE9] tracking-tight" style={{ fontSize: '15px', letterSpacing: '-0.02em' }}>
              PayFlow Protocol
            </span>
          </div>
          <p className="text-xs text-dark-500 max-w-sm leading-relaxed">
            Continuous token streaming and secure milestone-based escrow contracts built on Stellar Soroban.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-8 text-xs font-semibold text-dark-550">
          <a
            href="https://github.com/Ebendttl/payflow-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-light transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/Ebendttl/payflow-protocol/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-light transition-colors"
          >
            Documentation
          </a>
          <Link
            href="/admin"
            className="hover:text-primary-light transition-colors"
          >
            Admin Controls
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xxs text-dark-600 text-center md:text-right font-mono">
          &copy; {new Date().getFullYear()} PayFlow Protocol. Built on Stellar Soroban.
        </div>
      </div>
    </footer>
  );
}
