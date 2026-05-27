// TODO(issue): #T2 — Add JSDoc comments to all exported types

/** Current state of a payment stream on-chain */
export type StreamStatus = 'Active' | 'Paused' | 'Cancelled' | 'Completed';

/** On-chain Stream struct, mapped to TypeScript */
export interface Stream {
  id: bigint;
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  claimedAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  pausedAt: bigint | null;
  totalPausedDuration: bigint;
  status: StreamStatus;
}

/** Input payload for creating a stream */
export interface CreateStreamParams {
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  durationSeconds: bigint;
  autoSubmit?: boolean;
}

export interface ClaimParams {
  streamId: bigint;
  autoSubmit?: boolean;
}

export interface CancelStreamParams {
  streamId: bigint;
  autoSubmit?: boolean;
}

export interface PauseStreamParams {
  streamId: bigint;
  autoSubmit?: boolean;
}

export interface ResumeStreamParams {
  streamId: bigint;
  autoSubmit?: boolean;
}

/** Current approval state of a milestone */
export type MilestoneStatus = 'Pending' | 'Approved' | 'Released';

/** Current state of an escrow vault */
export type EscrowStatus = 'Active' | 'Cancelled' | 'Completed';

/** Input shape for a single milestone when creating an escrow */
export interface MilestoneInput {
  title: string;
  amount: bigint;
}

/** On-chain Milestone struct, mapped to TypeScript */
export interface Milestone {
  title: string;
  amount: bigint;
  approvalCount: number;
  status: MilestoneStatus;
}

/** On-chain Escrow struct, mapped to TypeScript */
export interface Escrow {
  id: bigint;
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  milestones: Milestone[];
  approvers: string[];
  threshold: number;
  status: EscrowStatus;
}

/** Input payload for creating a milestone escrow */
export interface CreateEscrowParams {
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  milestones: MilestoneInput[];
  approvers: string[];
  threshold: number;
  autoSubmit?: boolean;
}

export interface ApproveMilestoneParams {
  escrowId: bigint;
  milestoneIndex: number;
  approver: string;
  autoSubmit?: boolean;
}

export interface ReleaseMilestoneParams {
  escrowId: bigint;
  milestoneIndex: number;
  autoSubmit?: boolean;
}

export interface CancelEscrowParams {
  escrowId: bigint;
  autoSubmit?: boolean;
}

/** RPC/network connection config for a specific Stellar network */
export interface NetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
  horizonUrl: string;
}

/** Top-level configuration for PayFlowClient */
export interface PayFlowConfig {
  network: 'testnet' | 'mainnet';
  rpcUrl?: string;
  contractIds: {
    streamVault: string;
    milestoneEscrow: string;
    streamFactory: string;
  };
  wallet?: {
    signTransaction: (xdr: string, opts?: { network?: string }) => Promise<string>;
    getPublicKey: () => Promise<string>;
  };
}
