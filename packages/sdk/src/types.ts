export type StreamStatus = 'Active' | 'Paused' | 'Cancelled';

export interface Stream {
  id: bigint;
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  claimedAmount: bigint;
  status: StreamStatus;
  lastUpdated: bigint;
}

export interface MilestoneInput {
  title: string;
  amount: bigint;
}

export interface Milestone {
  title: string;
  amount: bigint;
  approvals: string[];
  released: boolean;
}

export interface Escrow {
  id: bigint;
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  milestones: Milestone[];
  approvers: string[];
  threshold: number;
  cancelled: boolean;
}

export interface PayFlowConfig {
  network: 'testnet' | 'mainnet';
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

export interface StreamCreateParams {
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  durationSeconds: bigint;
  autoSubmit?: boolean;
}

export interface EscrowCreateParams {
  sender: string;
  recipient: string;
  token: string;
  totalAmount: bigint;
  milestones: MilestoneInput[];
  approvers: string[];
  threshold: number;
  autoSubmit?: boolean;
}
