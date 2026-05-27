import { useState, useEffect } from 'react';
import { Escrow } from '@payflow/sdk';

export function useEscrow(escrowId?: string) {
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!escrowId) return;

    const fetchEscrow = async () => {
      setLoading(true);
      try {
        // TODO(issue): #55 — Fetch escrow information from the indexer API endpoint `GET /escrows/:id`.
        // Mock data fallback:
        setEscrow({
          id: BigInt(escrowId),
          sender: "GBX...",
          recipient: "GDY...",
          token: "USDC",
          totalAmount: 5000000000n,
          threshold: 2,
          approvers: ["GBA...", "GBB...", "GBC..."],
          cancelled: false,
          milestones: [
            { title: "Design Sign-off", amount: 2000000000n, approvals: ["GBA...", "GBB..."], released: true },
            { title: "Smart Contract Audit", amount: 3000000000n, approvals: ["GBA..."], released: false },
          ]
        });
      } catch (err: any) {
        setError(err.message || "Failed to fetch escrow");
      } finally {
        setLoading(false);
      }
    };

    fetchEscrow();
  }, [escrowId]);

  return { escrow, loading, error };
}
