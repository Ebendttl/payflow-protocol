'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPayFlowClient } from '../stellar';
import { FreighterWalletAdapter } from '@payflow/sdk';
import type { Stream } from '@payflow/sdk';

interface UseStreamResult {
  stream: Stream | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStream(streamId: bigint): UseStreamResult {
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = new FreighterWalletAdapter();
      const client = createPayFlowClient(wallet);
      const detail = await client.streams.getStream(streamId);
      setStream(detail);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchStream();
    // Poll every 5 seconds for status updates
    const interval = setInterval(fetchStream, 5000);
    return () => clearInterval(interval);
  }, [fetchStream]);

  return { stream, isLoading, error, refetch: fetchStream };
}

interface UseStreamsResult {
  streams: Stream[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStreams(sender: string | null): UseStreamsResult {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreams = useCallback(async () => {
    if (!sender) {
      setStreams([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const wallet = new FreighterWalletAdapter();
      const client = createPayFlowClient(wallet);
      const ids = await client.streams.getStreamsBySender(sender);

      const details = await Promise.all(
        ids.map(async (id) => {
          return client.streams.getStream(id);
        })
      );
      setStreams(details);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }, [sender]);

  useEffect(() => {
    fetchStreams();
    // Poll every 10 seconds for new streams or status updates
    const interval = setInterval(fetchStreams, 10000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  return { streams, isLoading, error, refetch: fetchStreams };
}
