import { describe, it, expect } from 'vitest';
import { PayFlowClient } from './index.js';

describe('PayFlowClient SDK Stubs', () => {
  const client = new PayFlowClient({
    network: 'testnet',
    contractIds: {
      streamVault: 'CDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      milestoneEscrow: 'CBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      streamFactory: 'CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  });

  it('should initialise all three sub-clients', () => {
    expect(client.streams).toBeDefined();
    expect(client.escrow).toBeDefined();
    expect(client.factory).toBeDefined();
  });

  it('streams.createStream validates address and throws on invalid inputs', async () => {
    await expect(
      client.streams.createStream({
        sender: 'GBAAAA',
        recipient: 'GDBBBB',
        token: 'CAAAAA',
        totalAmount: 1_000_000_000n,
        durationSeconds: 2_592_000n,
      })
    ).rejects.toThrow('Unsupported address type');
  });

  it('escrow.createEscrow rejects with not-implemented message', async () => {
    await expect(
      client.escrow.createEscrow({
        sender: 'GBAAAA',
        recipient: 'GDBBBB',
        token: 'CAAAAA',
        totalAmount: 1_000_000_000n,
        milestones: [{ title: 'M1', amount: 1_000_000_000n }],
        approvers: ['GCCCCC'],
        threshold: 1,
      })
    ).rejects.toThrow('not implemented — see issue #H4');
  });

  it('factory.getStreamVault rejects with not-implemented message', async () => {
    await expect(client.factory.getStreamVault()).rejects.toThrow(
      'not implemented — see issue #H4'
    );
  });
});
