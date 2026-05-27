import { Stream, StreamCreateParams, PayFlowConfig } from './types.js';

export class StreamClient {
  constructor(private config: PayFlowConfig) {}

  /**
   * Creates a new payment stream.
   * @returns The signed XDR transaction string or transaction submission response.
   */
  async create(params: StreamCreateParams): Promise<string> {
    // TODO(issue): #18 — Implement create stream transaction builder. Fetch current sequence number, invoke StreamVault contract create_stream, sign via Freighter wallet or wallet provider, and optionally submit to Horizon.
    return Promise.reject("not implemented");
  }

  /**
   * Retrieves the claimable accrued amount for a specific stream.
   */
  async claimableAmount(streamId: bigint): Promise<bigint> {
    // TODO(issue): #19 — Invoke StreamVault contract claimable_amount view method and parse the returning XDR val.
    return Promise.reject("not implemented");
  }

  /**
   * Claims accumulated tokens in a stream.
   */
  async claim(params: { streamId: bigint; autoSubmit?: boolean }): Promise<string> {
    // TODO(issue): #20 — Build, sign, and optionally submit claim transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Cancels a stream (sender only).
   */
  async cancel(params: { streamId: bigint; autoSubmit?: boolean }): Promise<string> {
    // TODO(issue): #21 — Build, sign, and optionally submit cancel_stream transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Pauses an active stream (sender only).
   */
  async pause(params: { streamId: bigint; autoSubmit?: boolean }): Promise<string> {
    // TODO(issue): #22 — Build, sign, and optionally submit pause_stream transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Resumes a paused stream (sender only).
   */
  async resume(params: { streamId: bigint; autoSubmit?: boolean }): Promise<string> {
    // TODO(issue): #23 — Build, sign, and optionally submit resume_stream transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Queries stream state directly from Soroban persistent storage.
   */
  async get(streamId: bigint): Promise<Stream> {
    // TODO(issue): #24 — Query get_stream and parse XDR structure into Stream JS object.
    return Promise.reject("not implemented");
  }
}
