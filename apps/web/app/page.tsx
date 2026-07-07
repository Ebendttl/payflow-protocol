"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWalletStore } from '../lib/store/walletStore';
import { ArrowRight, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import WalletOptionButton from '../components/ui/WalletOptionButton';
import Button from '../components/ui/Button';
import StreamSimulator from '../components/StreamSimulator';


export default function Home() {
  const { publicKey, connect, isConnecting } = useWalletStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleConnect = async (type: 'freighter' | 'lobstr') => {
    setDropdownOpen(false);
    try { await connect(type); } catch (_) {}
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <div className="relative min-h-[calc(100vh-160px)] bg-dark-900 overflow-hidden flex flex-col justify-between">
      {/* Animated background radial mesh */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 flex-grow flex flex-col items-center justify-center text-center relative z-10 pt-16 pb-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8 flex flex-col items-center"
        >
          {/* Floating Brand Logo */}
          <motion.div
            variants={itemVariants}
            className="relative h-16 w-16 overflow-hidden rounded-2xl bg-dark-800 border border-white/5 flex items-center justify-center shadow-lg shadow-primary/10 mb-2"
          >
            <Image
              src="/icon.png"
              alt="PayFlow Logo"
              fill
              priority
              className="object-cover"
            />
          </motion.div>

          {/* Tagline / Subtitle */}
          <motion.div 
            variants={itemVariants} 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary-light"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-ping" />
            Soroban-Native Continuous Flow
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="font-extrabold tracking-tight text-white leading-none text-4xl sm:text-6xl"
          >
            Continuous Token Flow<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-purple">
              Built on Stellar Soroban
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg font-normal text-dark-500 leading-relaxed max-w-xl mx-auto"
          >
            PayFlow enables developers, DAOs, and remote teams to stream tokens continuously, configure multi-sig escrows, and automate milestone disbursements with absolute finality.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="z-20">
            {publicKey ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-5">
                <Link
                  href="/streams"
                  className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition duration-200 flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02]"
                >
                  Streams Dashboard
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/escrow"
                  className="px-8 py-4 glass glass-hover text-white font-semibold rounded-xl transition duration-200 flex items-center gap-2 hover:scale-[1.02]"
                >
                  Milestone Escrows
                  <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div id="tour-connect-btn" className="mt-5 relative">
                <Button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={isConnecting}
                  className="px-8 py-4 font-bold hover:scale-[1.02]"
                >
                  {isConnecting ? 'Connecting…' : 'Connect Wallet to Get Started'}
                </Button>
                {dropdownOpen && !isConnecting && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-dark-900 border border-white/10 rounded-xl p-2 z-[9999] shadow-lg shadow-black/40">
                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-wider px-3 py-1.5 text-left">Select Wallet</p>
                    <div className="flex flex-col gap-1.5">
                      <WalletOptionButton
                        onClick={() => handleConnect('freighter')}
                        label="Freighter Wallet"
                        isConnecting={isConnecting}
                      />
                      <WalletOptionButton
                        onClick={() => handleConnect('lobstr')}
                        label="LOBSTR Wallet"
                        isConnecting={isConnecting}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Stats strip */}
          <motion.div
            id="tour-stats"
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 md:gap-16 py-6 px-10 rounded-2xl bg-dark-800/40 border border-white/5 backdrop-blur-sm w-full max-w-3xl mt-12"
          >
            <div className="text-center min-w-[120px]">
              <p className="text-xxs text-dark-500 font-bold uppercase tracking-wider">Engine</p>
              <p className="text-sm font-semibold text-white mt-1">Soroban-Native</p>
            </div>
            <div className="h-10 w-[1px] bg-white/5 hidden sm:block self-center" />
            <div className="text-center min-w-[120px]">
              <p className="text-xxs text-dark-500 font-bold uppercase tracking-wider">Network</p>
              <p className="text-sm font-semibold text-white mt-1">Stellar Testnet</p>
            </div>
            <div className="h-10 w-[1px] bg-white/5 hidden sm:block self-center" />
            <div className="text-center min-w-[120px]">
              <p className="text-xxs text-dark-500 font-bold uppercase tracking-wider">Access</p>
              <p className="text-sm font-semibold text-white mt-1">Open Source</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Features grid with motion */}
        <div className="grid md:grid-cols-3 w-full gap-6 pt-24 pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl text-left space-y-3 glass hover:border-primary/20 transition-all duration-300 p-7" 
          >
            <div className="h-10 w-10 bg-dark-800 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
              <Activity size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Real-time Streams</h3>
            <p className="text-xs leading-relaxed text-dark-500">Drip assets linearly per second. Recipients can claim accrued balances instantly with low network fees.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl text-left space-y-3 glass hover:border-primary/20 transition-all duration-300 p-7" 
          >
            <div className="h-10 w-10 bg-dark-800 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Milestone Escrow</h3>
            <p className="text-xs leading-relaxed text-dark-500">Disburse contract funds strictly upon milestone completion governed by a multi-sig signer threshold.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl text-left space-y-3 glass hover:border-primary/20 transition-all duration-300 p-7" 
          >
            <div className="h-10 w-10 bg-dark-800 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
              <Cpu size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Soroban-Powered</h3>
            <p className="text-xs leading-relaxed text-dark-500">Built completely on-chain using Soroban WebAssembly, leveraging Stellar&apos;s asset issuance standards.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

