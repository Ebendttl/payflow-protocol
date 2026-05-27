import { create } from 'zustand';
import { connectFreighter, isFreighterInstalled } from '../stellar.js';

interface WalletState {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  hasFreighter: boolean;
  checkFreighter: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnecting: false,
  error: null,
  hasFreighter: false,

  checkFreighter: async () => {
    const installed = await isFreighterInstalled();
    set({ hasFreighter: installed });
  },

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      const address = await connectFreighter();
      set({ address, isConnecting: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to connect wallet', isConnecting: false });
    }
  },

  disconnect: () => {
    set({ address: null, error: null });
  }
}));
