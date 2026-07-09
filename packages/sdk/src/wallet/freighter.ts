import {
  isConnected,
  getPublicKey,
  signTransaction,
  getNetworkDetails,
} from '@stellar/freighter-api';

export class FreighterWalletAdapter {
  private checkInstallation() {
    if (typeof window === 'undefined' || !(window as any).freighter) {
      throw new Error(
        'Freighter extension is not installed. Please install Freighter from freighter.app.'
      );
    }
  }

  /** Returns true when the Freighter extension is available and the user has granted access. */
  async isConnected(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !(window as any).freighter) {
        return false;
      }
      const result = await isConnected();
      // Freighter v2 may return the window.freighter object or { isConnected: boolean }
      if (typeof result === 'boolean') return result;
      if (result && typeof result === 'object') {
        return (result as any).isConnected !== false;
      }
      return !!result;
    } catch (err: any) {
      return false;
    }
  }

  /** Returns the user's active Stellar public key (G-address). */
  async getPublicKey(): Promise<string> {
    try {
      this.checkInstallation();
      const publicKey = await getPublicKey();
      if (!publicKey) {
        throw new Error('No active Stellar account found. Please unlock your Freighter wallet.');
      }
      return publicKey;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('User rejected') || msg.includes('declined')) {
        throw new Error('Freighter connection request was rejected by the user.');
      }
      throw new Error(msg || 'Failed to retrieve public key from Freighter wallet.');
    }
  }

  /**
   * Prompts the user to sign an XDR-encoded transaction envelope.
   * @param xdr Base64-encoded transaction envelope XDR string
   * @param networkPassphrase The Stellar network passphrase
   */
  async signTransaction(xdr: string, networkPassphrase?: string): Promise<string> {
    try {
      this.checkInstallation();

      let details;
      try {
        details = await getNetworkDetails();
      } catch (e) {
        // Ignore network details query failure and proceed
      }

      if (details && networkPassphrase && details.networkPassphrase !== networkPassphrase) {
        throw new Error(
          `Freighter is configured for a different network. Please switch Freighter to the network with passphrase: ${networkPassphrase}`
        );
      }

      const signedXdr = await signTransaction(xdr, {
        networkPassphrase,
      });

      if (!signedXdr) {
        throw new Error('Freighter returned an empty signature.');
      }
      return signedXdr;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('User rejected') || msg.includes('declined')) {
        throw new Error('Transaction signing was rejected by the user.');
      }
      throw new Error(msg || 'Failed to sign transaction with Freighter wallet.');
    }
  }

  /** Returns the currently selected network name and passphrase from Freighter. */
  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      this.checkInstallation();
      const details = await getNetworkDetails();
      if (!details) {
        throw new Error('Could not retrieve network details from Freighter.');
      }
      return {
        network: details.network,
        networkPassphrase: details.networkPassphrase,
      };
    } catch (err: any) {
      const msg = err.message || String(err);
      throw new Error(msg || 'Failed to retrieve selected network from Freighter.');
    }
  }
}
