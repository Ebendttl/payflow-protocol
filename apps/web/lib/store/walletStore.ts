'use client';

import { create } from 'zustand';

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  network: 'testnet' | 'mainnet';
  isConnecting: boolean;
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (network: 'testnet' | 'mainnet') => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey:    null,
  isConnected:  false,
  network:      'testnet',
  isConnecting: false,

  connect: async () => {
    set({ isConnecting: true });
    try {
      // Dynamic import to avoid SSR crash — Freighter only exists in browser
      const { isConnected, getPublicKey } = await import('@stellar/freighter-api');
      const connected = await isConnected();
      if (!connected) throw new Error('Freighter extension not found. Please install it.');
      const publicKey = await getPublicKey();
      set({ publicKey, isConnected: true, isConnecting: false });
    } catch (err: any) {
      set({ isConnecting: false });
      throw err;
    }
  },

  disconnect: () => set({ publicKey: null, isConnected: false }),

  setNetwork: (network) => set({ network }),
}));
