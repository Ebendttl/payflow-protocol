import { describe, it, expect } from 'vitest';
import { PayFlowClient } from './index.js';

describe('PayFlowClient SDK Stubs', () => {
  const client = new PayFlowClient({
    network: 'testnet',
    contractIds: {
      streamVault: 'CDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      milestoneEscrow: 'CBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      streamFactory: 'CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    }
  });

  it('should initialize clients', () => {
    expect(client.streams).toBeDefined();
    expect(client.escrow).toBeDefined();
    expect(client.factory).toBeDefined();
  });

  it('should return reject promises for unimplemented methods', async () => {
    await expect(client.streams.create({
      sender: 'GB...',
      recipient: 'GD...',
      token: 'CA...',
      totalAmount: 1000n,
      durationSeconds: 3600n
    })).rejects.toBe('not implemented');
  });
});
