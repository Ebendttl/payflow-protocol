"use client";

// TODO(issue): #M2 — Implement claim transaction flow

interface ClaimButtonProps {
  streamId: bigint;
}

export default function ClaimButton({ streamId }: ClaimButtonProps) {
  const handleClaim = () => {
    // TODO(issue): #M2 — Connect to SDK StreamClient.claim(), sign with Freighter, submit
    console.log(`claim #${streamId} — not implemented, see issue #M2`);
  };

  return (
    <button
      id={`claim-btn-${streamId}`}
      onClick={handleClaim}
      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white py-2.5 rounded-xl text-sm font-semibold transition"
    >
      Claim
    </button>
  );
}
