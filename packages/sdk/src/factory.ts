// TODO(issue): #H4 — Implement FactoryClient methods using @stellar/stellar-sdk contract invocation builders
import type { PayFlowConfig } from './types.js';

export class FactoryClient {
  constructor(private config: PayFlowConfig) {}

  /** Query the registered StreamVault contract address from the factory. */
  async getStreamVault(): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Query the registered MilestoneEscrow contract address from the factory. */
  async getMilestoneEscrow(): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }
}
