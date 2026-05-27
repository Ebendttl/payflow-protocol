// TODO(issue): #M2 — Implement useStream React hook
import type { Stream } from '@payflow/sdk';

interface UseStreamResult {
  stream: Stream | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStream(streamId: bigint): UseStreamResult {
  // TODO(issue): #M2 — Fetch stream from Indexer REST API GET /streams/:id
  // and re-fetch on a polling interval or after mutations.
  return { stream: null, isLoading: false, error: null, refetch: () => {} };
}
