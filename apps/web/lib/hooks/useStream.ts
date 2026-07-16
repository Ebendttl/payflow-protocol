'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    try {
      const wallet = new FreighterWalletAdapter() as any;
      const client = createPayFlowClient(wallet);
      const detail = await client.streams.getStream(streamId);
      setStream(detail);
      setError(null); // only clear error on success
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchStream();
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

  // Only show skeleton on the very first fetch
  const isInitialFetch = useRef(true);
  // Once we have data, never replace it with an error on a background poll failure
  const hasData = useRef(false);

  const fetchStreams = useCallback(async () => {
    if (!sender) {
      setStreams([]);
      setError(null);
      isInitialFetch.current = true;
      hasData.current = false;
      return;
    }
    if (isInitialFetch.current) setIsLoading(true);
    try {
      const wallet = new FreighterWalletAdapter() as any;
      const client = createPayFlowClient(wallet);
      const ids = await client.streams.getStreamsBySender(sender);
      const details = await Promise.all(ids.map((id) => client.streams.getStream(id)));
      setStreams(details);
      setError(null); // only clear error on SUCCESS — never before
      hasData.current = true;
    } catch (err: any) {
      // If we already displayed data before, ignore the background error silently
      if (!hasData.current) {
        setError(err.message || String(err));
      }
    } finally {
      setIsLoading(false);
      isInitialFetch.current = false;
    }
  }, [sender]);

  useEffect(() => {
    // Reset flags whenever the sender address changes
    isInitialFetch.current = true;
    hasData.current = false;
    fetchStreams();
    const interval = setInterval(fetchStreams, 10000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  return { streams, isLoading, error, refetch: fetchStreams };
}

export function useIncomingStreams(recipient: string | null): UseStreamsResult {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInitialFetch = useRef(true);
  const hasData = useRef(false);

  const fetchStreams = useCallback(async () => {
    if (!recipient) {
      setStreams([]);
      setError(null);
      isInitialFetch.current = true;
      hasData.current = false;
      return;
    }
    if (isInitialFetch.current) setIsLoading(true);
    try {
      const wallet = new FreighterWalletAdapter() as any;
      const client = createPayFlowClient(wallet);
      // Parallel scan of first 50 IDs to find matching incoming streams
      const ids = Array.from({ length: 50 }, (_, i) => BigInt(i + 1));
      const results = await Promise.allSettled(ids.map((id) => client.streams.getStream(id)));
      const details: Stream[] = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.recipient === recipient) {
          details.push(res.value);
        }
      });
      setStreams(details);
      setError(null);
      hasData.current = true;
    } catch (err: any) {
      if (!hasData.current) {
        setError(err.message || String(err));
      }
    } finally {
      setIsLoading(false);
      isInitialFetch.current = false;
    }
  }, [recipient]);

  useEffect(() => {
    isInitialFetch.current = true;
    hasData.current = false;
    fetchStreams();
    const interval = setInterval(fetchStreams, 10000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  return { streams, isLoading, error, refetch: fetchStreams };
}
