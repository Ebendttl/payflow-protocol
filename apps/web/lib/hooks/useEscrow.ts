// TODO(issue): #M3 — Implement useEscrow React hook
import type { Escrow } from '@payflow/sdk';

interface UseEscrowResult {
  escrow: Escrow | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEscrow(escrowId: bigint): UseEscrowResult {
  // TODO(issue): #M3 — Fetch escrow from Indexer REST API GET /escrows/:id
  // and re-fetch on a polling interval or after mutations.
  return { escrow: null, isLoading: false, error: null, refetch: () => {} };
}
