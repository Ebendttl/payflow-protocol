import {
  isConnected,
  getPublicKey,
  signTransaction,
} from '@lobstrco/signer-extension-api';

export class LobstrWalletAdapter {
  private checkInstallation() {
    if (typeof window === 'undefined' || !(window as any).lobstrSignerExtensionApi) {
      throw new Error('LOBSTR extension is not installed. Please install the LOBSTR Signer extension.');
    }
  }

  /** Returns true when the LOBSTR extension is available and the user has granted access. */
  async isConnected(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !(window as any).lobstrSignerExtensionApi) {
        return false;
      }
      const connected = await isConnected();
      return !!connected;
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
        throw new Error('No active Stellar account found. Please unlock your LOBSTR wallet.');
      }
      return publicKey;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('User rejected') || msg.includes('declined')) {
        throw new Error('LOBSTR connection request was rejected by the user.');
      }
      throw new Error(msg || 'Failed to retrieve public key from LOBSTR wallet.');
    }
  }

  /**
   * Prompts the user to sign an XDR-encoded transaction envelope.
   * @param xdr Base64-encoded transaction envelope XDR string
   * @param networkPassphrase The Stellar network passphrase (unused by LOBSTR but kept for interface compatibility)
   */
  async signTransaction(xdr: string, networkPassphrase?: string): Promise<string> {
    try {
      this.checkInstallation();
      const signedXdr = await signTransaction(xdr);
      if (!signedXdr) {
        throw new Error('LOBSTR returned an empty signature.');
      }
      return signedXdr;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('User rejected') || msg.includes('declined')) {
        throw new Error('Transaction signing was rejected by the user.');
      }
      throw new Error(msg || 'Failed to sign transaction with LOBSTR wallet.');
    }
  }
}
