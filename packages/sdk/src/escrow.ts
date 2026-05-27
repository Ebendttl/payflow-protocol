import { Escrow, EscrowCreateParams, Milestone, PayFlowConfig } from './types.js';

export class EscrowClient {
  constructor(private config: PayFlowConfig) {}

  /**
   * Creates a milestone-gated escrow contract.
   */
  async create(params: EscrowCreateParams): Promise<string> {
    // TODO(issue): #25 — Build, sign, and optionally submit create_escrow transaction using MilestoneEscrow contract.
    return Promise.reject("not implemented");
  }

  /**
   * Approves a specific milestone inside an escrow.
   */
  async approveMilestone(params: {
    escrowId: bigint;
    milestoneIndex: number;
    approver: string;
    autoSubmit?: boolean;
  }): Promise<string> {
    // TODO(issue): #26 — Build, sign, and optionally submit approve_milestone transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Releases a milestone if the threshold is reached.
   */
  async releaseMilestone(params: {
    escrowId: bigint;
    milestoneIndex: number;
    autoSubmit?: boolean;
  }): Promise<string> {
    // TODO(issue): #27 — Build, sign, and optionally submit release_milestone transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Cancels the escrow, returning remaining unreleased milestone funds to the sender.
   */
  async cancelEscrow(params: { escrowId: bigint; autoSubmit?: boolean }): Promise<string> {
    // TODO(issue): #28 — Build, sign, and optionally submit cancel_escrow transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Fetches the complete escrow status.
   */
  async get(escrowId: bigint): Promise<Escrow> {
    // TODO(issue): #29 — Invoke get_escrow view call and parse XDR structure into Escrow JS object.
    return Promise.reject("not implemented");
  }

  /**
   * Fetches specific milestone status.
   */
  async getMilestone(params: { escrowId: bigint; index: number }): Promise<Milestone> {
    // TODO(issue): #30 — Invoke get_milestone view call and parse returning XDR structure.
    return Promise.reject("not implemented");
  }
}
