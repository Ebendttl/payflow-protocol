import { Networks } from '@stellar/stellar-sdk';
import type { PayFlowConfig, NetworkConfig } from '@payflow/sdk';

// ─── Network configurations ───────────────────────────────────────────────────

export const NETWORK_CONFIG: Record<'testnet' | 'mainnet', NetworkConfig> = {
  testnet: {
    rpcUrl: typeof window !== 'undefined' ? '/api/rpc' : (process.env.NEXT_PUBLIC_HORIZON_RPC_URL || 'https://soroban-rpc.testnet.stellar.gateway.fm'),
    networkPassphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
  },
  mainnet: {
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://mainnet.stellar.validationcloud.io/v1/soroban/rpc',
    networkPassphrase: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
  },
};

// ─── Contract ID helpers ─────────────────────────────────────────────────────

export function getContractIds() {
  return {
    streamVault:    process.env.NEXT_PUBLIC_STREAM_VAULT_CONTRACT_ID    ?? '',
    milestoneEscrow: process.env.NEXT_PUBLIC_MILESTONE_ESCROW_CONTRACT_ID ?? '',
    streamFactory:  process.env.NEXT_PUBLIC_STREAM_FACTORY_CONTRACT_ID  ?? '',
  };
}

// ─── PayFlowClient factory ───────────────────────────────────────────────────

/**
 * Creates a fully configured PayFlowClient instance bound to the active network
 * and a wallet signing adapter.
 *
 * @param wallet - An object exposing signTransaction and getPublicKey, e.g. FreighterWalletAdapter
 */
export function createPayFlowClient(wallet: PayFlowConfig['wallet']) {
  const network = (process.env.NEXT_PUBLIC_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';
  const net = NETWORK_CONFIG[network];
  const contractIds = getContractIds();

  // Dynamic import avoids SSR issues with Stellar SDK in Next.js
  const { PayFlowClient } = require('@payflow/sdk');
  return new PayFlowClient({
    network,
    rpcUrl: net.rpcUrl,
    contractIds,
    wallet,
  }) as InstanceType<typeof import('@payflow/sdk').PayFlowClient>;
}

/**
 * Returns the appropriate SDK wallet adapter based on the active connection type
 */
export async function getActiveWalletAdapter(walletType: 'freighter' | 'lobstr' | null): Promise<PayFlowConfig['wallet']> {
  if (walletType === 'lobstr') {
    const { LobstrWalletAdapter } = await import('@payflow/sdk');
    return new LobstrWalletAdapter() as any;
  }
  const { FreighterWalletAdapter } = await import('@payflow/sdk');
  return new FreighterWalletAdapter() as any;
}

