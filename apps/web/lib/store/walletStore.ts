'use client';

import { create } from 'zustand';

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  network: 'testnet' | 'mainnet';
  isConnecting: boolean;
  walletType: 'freighter' | 'lobstr' | null;
  connectionError: string | null;
  // Actions
  connect: (type?: 'freighter' | 'lobstr') => Promise<void>;
  disconnect: () => void;
  setNetwork: (network: 'testnet' | 'mainnet') => void;
}

/**
 * Wraps a promise with a timeout to prevent indefinite hangs
 * when browser extensions don't respond.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  isConnected: false,
  network: 'testnet',
  isConnecting: false,
  walletType: null,
  connectionError: null,

  connect: async (type = 'freighter') => {
    set({ isConnecting: true, connectionError: null });
    try {
      if (type === 'freighter') {
        // ── Freighter flow ──────────────────────────────────────────
        const freighterApi = await import('@stellar/freighter-api');

        // CRITICAL: Freighter v2 isConnected() returns the window.freighter
        // object (truthy!) when installed, or { isConnected: false } when not.
        // We must coerce properly.
        const connResult = await withTimeout(
          freighterApi.isConnected(),
          3000,
          'Freighter isConnected'
        );
        const isInstalled =
          typeof connResult === 'boolean'
            ? connResult
            : !!(connResult && (connResult as any).isConnected !== false);

        if (!isInstalled) {
          throw new Error(
            'Freighter extension not detected. Please install it from freighter.app and reload.'
          );
        }

        // requestAccess() triggers the Freighter popup for authorization
        // and returns the public key string on success.
        const accessResult = await withTimeout(
          freighterApi.requestAccess(),
          30000,
          'Freighter requestAccess'
        );

        // v2 may return { address: string } or a plain string depending on version
        const publicKey =
          typeof accessResult === 'string'
            ? accessResult
            : (accessResult as any)?.address || (accessResult as any)?.publicKey || '';

        if (!publicKey) {
          throw new Error('Freighter authorization was rejected or the wallet is locked.');
        }

        set({
          publicKey,
          isConnected: true,
          isConnecting: false,
          walletType: 'freighter',
          connectionError: null,
        });
      } else {
        // ── LOBSTR flow ─────────────────────────────────────────────
        const lobstrApi = await import('@lobstrco/signer-extension-api');

        const connResult = await withTimeout(lobstrApi.isConnected(), 3000, 'LOBSTR isConnected');
        const isInstalled =
          typeof connResult === 'boolean'
            ? connResult
            : !!(connResult && (connResult as any).isConnected !== false);

        if (!isInstalled) {
          throw new Error(
            'LOBSTR Signer extension not detected. Please install it from the Chrome Web Store and reload.'
          );
        }

        // getPublicKey() triggers the LOBSTR popup for authorization.
        const publicKey = await withTimeout(lobstrApi.getPublicKey(), 30000, 'LOBSTR getPublicKey');

        if (!publicKey) {
          throw new Error('LOBSTR authorization was rejected or the wallet is locked.');
        }

        set({
          publicKey,
          isConnected: true,
          isConnecting: false,
          walletType: 'lobstr',
          connectionError: null,
        });
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error(`[WalletStore] Connection failed (${type}):`, msg);
      set({ isConnecting: false, connectionError: msg });
      throw err;
    }
  },

  disconnect: () =>
    set({ publicKey: null, isConnected: false, walletType: null, connectionError: null }),

  setNetwork: (network) => set({ network }),
}));
