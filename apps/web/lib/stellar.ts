import { isConnected, getPublicKey, signTransaction } from "@stellar/freighter-api";
import { Horizon } from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const horizon = new Horizon.Server(HORIZON_URL);

/**
 * Checks if the Freighter Wallet extension is installed.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    return await isConnected();
  } catch {
    return false;
  }
}

/**
 * Connects Freighter wallet and returns the active public key.
 */
export async function connectFreighter(): Promise<string> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error("Freighter wallet is not installed");
  }
  try {
    const publicKey = await getPublicKey();
    return publicKey;
  } catch (error) {
    throw new Error(`Freighter connection rejected: ${error}`);
  }
}

/**
 * Prompts Freighter to sign a raw transaction transaction XDR.
 */
export async function signWithFreighter(xdr: string, network: "TESTNET" | "PUBLIC" = "TESTNET"): Promise<string> {
  try {
    const signedXdr = await signTransaction(xdr, { network });
    return signedXdr;
  } catch (error) {
    throw new Error(`Transaction signing failed: ${error}`);
  }
}
