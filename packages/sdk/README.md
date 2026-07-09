# @payflow/sdk

The official TypeScript SDK for interacting with PayFlow Protocol's Soroban contracts.

## Installation

```bash
pnpm add @payflow/sdk @stellar/stellar-sdk @stellar/freighter-api
```

## Usage

```typescript
import { PayFlowClient } from '@payflow/sdk';

const client = new PayFlowClient({
  network: 'testnet',
  contractIds: {
    streamVault: 'CD...',
    milestoneEscrow: 'CB...',
    streamFactory: 'CC...',
  },
});

// Stream operations
const claimable = await client.streams.claimableAmount(1n);
console.log('Claimable accrued amount:', claimable);
```

## Running Tests

To run the TypeScript SDK vitest suite:

```bash
pnpm test
```
