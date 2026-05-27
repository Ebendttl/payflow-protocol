# SDK Reference Guide

The `@payflow/sdk` library allows developers to interface with PayFlow Soroban contracts from Node.js and browser runtimes.

## Initialization

```typescript
import { PayFlowClient } from '@payflow/sdk';

const client = new PayFlowClient({
  network: 'testnet',
  contractIds: {
    streamVault: 'CC...',
    milestoneEscrow: 'CD...',
    streamFactory: 'CB...'
  },
  wallet: window.freighter // or custom wallet interface
});
```

## Streams

### Create Stream
```typescript
const xdr = await client.streams.create({
  sender: 'GB...',
  recipient: 'GD...',
  token: 'CA...',
  totalAmount: 1000000000n, // 100 XLM / USDC
  durationSeconds: 2592000n, // 30 days
});
```

### Claim Stream
```typescript
await client.streams.claim({ streamId: 1n, autoSubmit: true });
```

## Escrows

### Create Escrow
```typescript
const xdr = await client.escrow.create({
  sender: 'GB...',
  recipient: 'GD...',
  token: 'CA...',
  totalAmount: 5000000000n,
  milestones: [
    { title: 'Milestone 1', amount: 2000000000n },
    { title: 'Milestone 2', amount: 3000000000n }
  ],
  approvers: ['GA...', 'GB...', 'GC...'],
  threshold: 2
});
```
