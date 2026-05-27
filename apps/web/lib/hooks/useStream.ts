import { useState, useEffect } from 'react';
import { Stream } from '@payflow/sdk';

export function useStream(streamId?: string) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streamId) return;

    const fetchStream = async () => {
      setLoading(true);
      try {
        // TODO(issue): #54 — Connect to indexer endpoint `GET /streams/:id` and update local React state.
        // Mock data fallback:
        setStream({
          id: BigInt(streamId),
          sender: "GBX...",
          recipient: "GDY...",
          token: "USDC",
          totalAmount: 1000000000n,
          startTime: BigInt(Math.floor(Date.now() / 1000) - 3600),
          endTime: BigInt(Math.floor(Date.now() / 1000) + 3600 * 5),
          claimedAmount: 100000000n,
          status: "Active",
          lastUpdated: BigInt(Math.floor(Date.now() / 1000)),
        });
      } catch (err: any) {
        setError(err.message || "Failed to fetch stream");
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
    const interval = setInterval(fetchStream, 10000);
    return () => clearInterval(interval);
  }, [streamId]);

  return { stream, loading, error };
}
