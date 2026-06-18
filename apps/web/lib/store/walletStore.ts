'use client';

import { create } from 'zustand';

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  network: 'testnet' | 'mainnet';
  isConnecting: boolean;
  walletType: 'freighter' | 'lobstr' | null;
  // Actions
  connect: (type?: 'freighter' | 'lobstr') => Promise<void>;
  disconnect: () => void;
  setNetwork: (network: 'testnet' | 'mainnet') => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey:    null,
  isConnected:  false,
  network:      'testnet',
  isConnecting: false,
  walletType:   null,

  connect: async (type = 'freighter') => {
    set({ isConnecting: true });
    try {
      if (type === 'freighter') {
        const { isConnected, getPublicKey } = await import('@stellar/freighter-api');
        const connected = await isConnected();
        if (!connected) throw new Error('Freighter extension not found. Please install it.');
        const publicKey = await getPublicKey();
        set({ publicKey, isConnected: true, isConnecting: false, walletType: 'freighter' });
      } else {
        const { isConnected, getPublicKey } = await import('@lobstrco/signer-extension-api');
        const connected = await isConnected();
        if (!connected) throw new Error('LOBSTR Signer extension not found. Please install it.');
        const publicKey = await getPublicKey();
        set({ publicKey, isConnected: true, isConnecting: false, walletType: 'lobstr' });
      }
    } catch (err: any) {
      set({ isConnecting: false });
      throw err;
    }
  },

  disconnect: () => set({ publicKey: null, isConnected: false, walletType: null }),

  setNetwork: (network) => set({ network }),
}));
