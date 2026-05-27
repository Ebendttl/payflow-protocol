// TODO(issue): #H4 — Implement StreamClient methods using @stellar/stellar-sdk contract invocation builders
import type {
  Stream,
  CreateStreamParams,
  ClaimParams,
  CancelStreamParams,
  PauseStreamParams,
  ResumeStreamParams,
  PayFlowConfig,
} from './types.js';

export class StreamClient {
  constructor(private config: PayFlowConfig) {}

  /** Build and optionally submit a create_stream transaction. */
  async createStream(params: CreateStreamParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Read-only view: returns accrued claimable balance for a stream. */
  async claimableAmount(streamId: bigint): Promise<bigint> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Build and optionally submit a claim transaction for the recipient. */
  async claim(params: ClaimParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Build and optionally submit a cancel_stream transaction (sender only). */
  async cancelStream(params: CancelStreamParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Build and optionally submit a pause_stream transaction (sender only). */
  async pauseStream(params: PauseStreamParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Build and optionally submit a resume_stream transaction (sender only). */
  async resumeStream(params: ResumeStreamParams): Promise<string> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Query on-chain state for a single stream by ID. */
  async getStream(streamId: bigint): Promise<Stream> {
    throw new Error('not implemented — see issue #H4');
  }

  /** Query all stream IDs owned by a sender address. */
  async getStreamsBySender(sender: string): Promise<bigint[]> {
    throw new Error('not implemented — see issue #H4');
  }
}
