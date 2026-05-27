# PayFlow TypeScript SDK Reference Guide

<!-- TODO(issue): #T5 — Write full SDK developer documentation -->

The `@payflow/sdk` library allows client-side applications, indexers, backend servers, and command-line tools to interface with PayFlow's Soroban smart contracts. It abstracts transaction building, footprint registration, signature collection, and network submission.

---

## 1. Installation & Environment Support

Install the package via your preferred package manager (requires Node v18+ or ES2022 browser compatibility):

```bash
npm install @payflow/sdk
# or using pnpm
pnpm add @payflow/sdk
```

---

## 2. client Initialization

The `PayFlowClient` acts as the single gateway for all interaction. It dynamically namespaces modules for **Streams**, **Escrows**, and **Factories**.

```typescript
import { PayFlowClient } from '@payflow/sdk';

const client = new PayFlowClient({
  network: 'testnet', // 'testnet' | 'mainnet' | 'standalone'
  rpcUrl: 'https://soroban-testnet.stellar.org',
  contractIds: {
    streamVault: 'CDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    milestoneEscrow: 'CBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    streamFactory: 'CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  },
  // Provide either a browser wallet object or a Node.js secret key provider
  wallet: {
    signTransaction: async (xdr: string) => {
      // e.g., Integrate Freighter wallet
      const { signTransaction } = await import('@stellar/freighter-api');
      return signTransaction({ xdr, network: 'TESTNET' });
    }
  }
});
```

---

## 3. Streams API (`client.streams`)

### Create a Token Stream
Deploy and lock funds into a continuous streaming ledger. Returns a raw transaction envelope or submits to network.

```typescript
import { CreateStreamParams } from '@payflow/sdk';

const params: CreateStreamParams = {
  sender: 'GD3FA2...',
  recipient: 'GDYAAA...',
  token: 'CDUSDC...',       // Soroban Token Contract Address
  totalAmount: 1000000000n, // i128 (with 7 decimal places, e.g. 100.0000000 USDC)
  durationSeconds: 2592000n, // 30 days
  autoSubmit: true          // Builds, signs via Freighter, and submits
};

try {
  const txResult = await client.streams.create(params);
  console.log('Stream created in ledger block. Hash:', txResult.hash);
} catch (error) {
  console.error('Failed to create stream:', error);
}
```

### Claim Accrued Balances
Invoked by the recipient to withdraw all tokens accrued since the last claim block.

```typescript
const claimTx = await client.streams.claim({
  streamId: 42n,
  autoSubmit: true
});
```

### Stream Lifecycle Control
Senders can temporarily pause streaming or cancel a stream entirely to reclaim remaining locked tokens.

```typescript
// Pause stream
await client.streams.pause({ streamId: 42n, autoSubmit: true });

// Resume stream
await client.streams.resume({ streamId: 42n, autoSubmit: true });

// Cancel stream
const refundResult = await client.streams.cancel({
  streamId: 42n,
  autoSubmit: true
});
console.log('Refund processed successfully. Refunded amount:', refundResult.refundedAmount);
```

---

## 4. Escrow & Milestone API (`client.escrow`)

Escrows let senders distribute funds locked in a multi-sig vault upon milestone approvals.

### Create Milestone Escrow
```typescript
const escrowTx = await client.escrow.create({
  sender: 'GD3FA2...',
  recipient: 'GDYAAA...',
  token: 'CDUSDC...',
  totalAmount: 5000000000n, // 500.0000000 USDC
  threshold: 2,             // Requires 2 of 3 approver signatures to release a milestone
  approvers: [
    'GBAAAA...',
    'GBBBBB...',
    'GBCCCC...'
  ],
  milestones: [
    { title: 'System Architecture Specification', amount: 2000000000n },
    { title: 'Soroban Smart Contract Implementation', amount: 3000000000n }
  ],
  autoSubmit: true
});
```

### Approve & Disburse Milestones
Approvers use this interface to sign off on specific milestone accomplishments. Once the approval count matches the required threshold, the escrow contract auto-releases the allocated tranche.

```typescript
const approveTx = await client.escrow.approveMilestone({
  escrowId: 101n,
  milestoneIndex: 0, // Indexes from 0
  approver: 'GBAAAA...',
  autoSubmit: true
});
```

---

## 5. Event Subscription & Indexer Queries

For fast, reactive UI rendering, do not query the Soroban host ledger directly for active lists. Use our high-performance indexer API:

```typescript
// Query the event-driven indexer REST API
const response = await fetch('http://localhost:3001/api/streams?sender=GD3FA2...');
const streamsList = await response.json();

console.log(`Active Streams for sender: ${streamsList.length}`);
```

