// TODO(issue): #M7 — Implement Freighter wallet adapter
// Install peer dep: pnpm add -D @stellar/freighter-api

/** Shape of the Freighter browser extension API */
interface FreighterAPI {
  isConnected: () => Promise<{ isConnected: boolean }>;
  getPublicKey: () => Promise<string>;
  signTransaction: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>;
  getNetwork: () => Promise<{ network: string; networkPassphrase: string }>;
}

declare const window: { freighter?: FreighterAPI } & Window;

export class FreighterWalletAdapter {
  private api(): FreighterAPI {
    if (typeof window === 'undefined' || !window.freighter) {
      throw new Error('Freighter wallet extension is not installed or not available in this environment');
    }
    return window.freighter;
  }

  /** Returns true when the Freighter extension is available and the user has granted access. */
  async isConnected(): Promise<boolean> {
    // TODO(issue): #M7 — Call freighter API and return connection state
    throw new Error('not implemented — see issue #M7');
  }

  /** Returns the user's active Stellar public key (G-address). */
  async getPublicKey(): Promise<string> {
    // TODO(issue): #M7 — Retrieve public key from Freighter
    throw new Error('not implemented — see issue #M7');
  }

  /**
   * Prompts the user to sign an XDR-encoded transaction envelope.
   * @param xdr Base64-encoded transaction envelope XDR string
   * @param networkPassphrase The Stellar network passphrase
   */
  async signTransaction(xdr: string, networkPassphrase?: string): Promise<string> {
    // TODO(issue): #M7 — Pass XDR to Freighter for signing and return the signed envelope
    throw new Error('not implemented — see issue #M7');
  }

  /** Returns the currently selected network name and passphrase from Freighter. */
  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    // TODO(issue): #M7 — Query Freighter for active network
    throw new Error('not implemented — see issue #M7');
  }
}
