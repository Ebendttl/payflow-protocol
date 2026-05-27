// TODO(issue): #H4 — Implement EscrowClient methods using @stellar/stellar-sdk contract invocation builders
import type {
  Escrow,
  Milestone,
  CreateEscrowParams,
  ApproveMilestoneParams,
  ReleaseMilestoneParams,
  CancelEscrowParams,
  PayFlowConfig,
} from './types.js';

export class EscrowClient {
  constructor(private config: PayFlowConfig) {}

  /** Build and optionally submit a create_escrow transaction. */
  async createEscrow(params: CreateEscrowParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Build and optionally submit an approve_milestone transaction (approver only). */
  async approveMilestone(params: ApproveMilestoneParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Build and optionally submit a release_milestone transaction. */
  async releaseMilestone(params: ReleaseMilestoneParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Build and optionally submit a cancel_escrow transaction (sender only). */
  async cancelEscrow(params: CancelEscrowParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Query on-chain state for a single escrow by ID. */
  async getEscrow(escrowId: bigint): Promise<Escrow> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Query a single milestone by escrow ID and milestone index. */
  async getMilestone(escrowId: bigint, milestoneIndex: number): Promise<Milestone> {
    throw new Error('not implemented — see issue #H4');
  }
}
