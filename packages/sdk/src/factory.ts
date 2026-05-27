import { PayFlowConfig, StreamCreateParams, EscrowCreateParams } from './types.js';

export class FactoryClient {
  constructor(private config: PayFlowConfig) {}

  /**
   * Initializes the factory with WASM codes.
   */
  async initialize(params: {
    vaultWasmHash: string;
    escrowWasmHash: string;
    autoSubmit?: boolean;
  }): Promise<string> {
    // TODO(issue): #31 — Build, sign, and optionally submit initialize transaction on StreamFactory.
    return Promise.reject("not implemented");
  }

  /**
   * Deploys a new stream vault using the factory.
   */
  async deployStreamVault(params: StreamCreateParams & { autoSubmit?: boolean }): Promise<string> {
    // TODO(issue): #32 — Build, sign, and optionally submit deploy_stream_vault transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Deploys a new milestone escrow using the factory.
   */
  async deployMilestoneEscrow(params: EscrowCreateParams & { autoSubmit?: boolean }): Promise<string> {
    // TODO(issue): #33 — Build, sign, and submit deploy_milestone_escrow transaction.
    return Promise.reject("not implemented");
  }

  /**
   * Lists stream IDs associated with a specific sender.
   */
  async listStreamsBySender(sender: string): Promise<bigint[]> {
    // TODO(issue): #34 — Invoke list_streams_by_sender view call and return list.
    return Promise.reject("not implemented");
  }
}
