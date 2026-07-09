import {
  Contract,
  rpc,
  TransactionBuilder,
  xdr,
  scValToNative,
  Account,
  TimeoutInfinite,
  Address,
  ScInt,
  Transaction,
} from '@stellar/stellar-sdk';

import type {
  Stream,
  CreateStreamParams,
  ClaimParams,
  CancelStreamParams,
  PauseStreamParams,
  ResumeStreamParams,
  PayFlowConfig,
  StreamStatus,
} from './types.js';

export class StreamClient {
  constructor(private config: PayFlowConfig) {}

  private async getRpcServer(): Promise<rpc.Server> {
    const rpcUrl =
      this.config.rpcUrl ||
      (this.config.network === 'mainnet'
        ? 'https://soroban-mainnet.stellar.org'
        : 'https://soroban-testnet.stellar.org');
    return new rpc.Server(rpcUrl, { allowHttp: true });
  }

  private getNetworkPassphrase(): string {
    return this.config.network === 'mainnet'
      ? 'Public Global Stellar Network ; October 2015'
      : 'Testnet Stellar Network ; September 2015';
  }

  private async prepareTx(
    sourceAddress: string,
    method: string,
    args: xdr.ScVal[]
  ): Promise<Transaction> {
    const server = await this.getRpcServer();
    const contractId = this.config.contractIds.streamVault;
    const contract = new Contract(contractId);

    let sourceAccount;
    try {
      sourceAccount = await server.getAccount(sourceAddress);
    } catch (e) {
      throw new Error(
        `Failed to fetch source account details for ${sourceAddress}. Make sure the account exists and is funded.`
      );
    }

    const callOp = contract.call(method, ...args);
    const passphrase = this.getNetworkPassphrase();

    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: passphrase,
    })
      .addOperation(callOp)
      .setTimeout(TimeoutInfinite)
      .build() as unknown as Transaction;

    const simRes = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simRes)) {
      throw new Error(`Simulation failed: ${simRes.error}`);
    }

    const assembledTx = rpc.assembleTransaction(tx, simRes).build() as unknown as Transaction;
    return assembledTx;
  }

  private async submitTx(signedTx: Transaction): Promise<string> {
    const server = await this.getRpcServer();
    const sendRes = await server.sendTransaction(signedTx);

    if (sendRes.status === 'ERROR') {
      throw new Error(`Failed to submit transaction: ${JSON.stringify(sendRes)}`);
    }

    const txHash = sendRes.hash;
    let attempts = 0;

    while (attempts < 15) {
      const statusRes = await server.getTransaction(txHash);
      const status = statusRes.status as string;
      if (status === 'SUCCESS') {
        return txHash;
      }
      if (status === 'FAILED') {
        throw new Error(`Transaction failed: ${txHash}`);
      }
      // If PENDING or NOT_FOUND, we wait and retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error(`Transaction polling timed out: ${txHash}`);
  }

  private async executeTx(
    sourceAddress: string,
    method: string,
    args: xdr.ScVal[],
    autoSubmit: boolean = true
  ): Promise<string> {
    const assembledTx = await this.prepareTx(sourceAddress, method, args);

    if (!this.config.wallet) {
      throw new Error('No wallet adapter configured for transaction signing');
    }

    const signedXdr = await this.config.wallet.signTransaction(assembledTx.toXDR(), {
      network: this.getNetworkPassphrase(),
    });

    if (autoSubmit === false) {
      return signedXdr;
    }

    const signedTx = TransactionBuilder.fromXDR(
      signedXdr,
      this.getNetworkPassphrase()
    ) as unknown as Transaction;
    return this.submitTx(signedTx);
  }

  private async callReadOnly(method: string, args: xdr.ScVal[]): Promise<any> {
    const server = await this.getRpcServer();
    const contractId = this.config.contractIds.streamVault;
    const contract = new Contract(contractId);
    const passphrase = this.getNetworkPassphrase();

    // Use a dummy address for simulation
    const dummyAddress = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
    const sourceAccount = new Account(dummyAddress, '0');

    const callOp = contract.call(method, ...args);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: passphrase,
    })
      .addOperation(callOp)
      .setTimeout(TimeoutInfinite)
      .build() as unknown as Transaction;

    const simRes = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simRes)) {
      throw new Error(`Simulation failed: ${simRes.error}`);
    }

    if (!simRes.result || !simRes.result.retval) {
      throw new Error('No return value in simulation response');
    }

    return scValToNative(simRes.result.retval);
  }

  /** Build and optionally submit a create_stream transaction. */
  async createStream(params: CreateStreamParams): Promise<string> {
    const senderVal = Address.fromString(params.sender).toScVal();
    const recipientVal = Address.fromString(params.recipient).toScVal();
    const tokenVal = Address.fromString(params.token).toScVal();
    const totalAmountVal = new ScInt(params.totalAmount).toI128();
    const durationSecondsVal = new ScInt(params.durationSeconds).toU64();

    return this.executeTx(
      params.sender,
      'create_stream',
      [senderVal, recipientVal, tokenVal, totalAmountVal, durationSecondsVal],
      params.autoSubmit ?? true
    );
  }

  /** Read-only view: returns accrued claimable balance for a stream. */
  async claimableAmount(streamId: bigint): Promise<bigint> {
    const streamIdVal = new ScInt(streamId).toU64();
    const res = await this.callReadOnly('claimable_amount', [streamIdVal]);
    return BigInt(res);
  }

  /** Build and optionally submit a claim transaction for the recipient. */
  async claim(params: ClaimParams): Promise<string> {
    const stream = await this.getStream(params.streamId);
    const streamIdVal = new ScInt(params.streamId).toU64();
    return this.executeTx(stream.recipient, 'claim', [streamIdVal], params.autoSubmit ?? true);
  }

  /** Build and optionally submit a cancel_stream transaction (sender only). */
  async cancelStream(params: CancelStreamParams): Promise<string> {
    const stream = await this.getStream(params.streamId);
    const streamIdVal = new ScInt(params.streamId).toU64();
    return this.executeTx(stream.sender, 'cancel_stream', [streamIdVal], params.autoSubmit ?? true);
  }

  /** Build and optionally submit a pause_stream transaction (sender only). */
  async pauseStream(params: PauseStreamParams): Promise<string> {
    const stream = await this.getStream(params.streamId);
    const streamIdVal = new ScInt(params.streamId).toU64();
    return this.executeTx(stream.sender, 'pause_stream', [streamIdVal], params.autoSubmit ?? true);
  }

  /** Build and optionally submit a resume_stream transaction (sender only). */
  async resumeStream(params: ResumeStreamParams): Promise<string> {
    const stream = await this.getStream(params.streamId);
    const streamIdVal = new ScInt(params.streamId).toU64();
    return this.executeTx(stream.sender, 'resume_stream', [streamIdVal], params.autoSubmit ?? true);
  }

  /** Query on-chain state for a single stream by ID. */
  async getStream(streamId: bigint): Promise<Stream> {
    const streamIdVal = new ScInt(streamId).toU64();
    const res = await this.callReadOnly('get_stream', [streamIdVal]);

    return {
      id: BigInt(res.id),
      sender: typeof res.sender === 'string' ? res.sender : res.sender.toString(),
      recipient: typeof res.recipient === 'string' ? res.recipient : res.recipient.toString(),
      token: typeof res.token === 'string' ? res.token : res.token.toString(),
      totalAmount: BigInt(res.total_amount),
      claimedAmount: BigInt(res.claimed_amount),
      startTime: BigInt(res.start_time),
      endTime: BigInt(res.end_time),
      pausedAt: res.paused_at ? BigInt(res.paused_at) : null,
      totalPausedDuration: BigInt(res.total_paused_duration),
      status: (typeof res.status === 'string' ? res.status : res.status.name) as StreamStatus,
    };
  }

  /** Query all stream IDs owned by a sender address. */
  async getStreamsBySender(sender: string): Promise<bigint[]> {
    const senderVal = Address.fromString(sender).toScVal();
    const res = await this.callReadOnly('get_streams_by_sender', [senderVal]);
    if (!Array.isArray(res)) {
      return [];
    }
    return res.map((val: any) => BigInt(val));
  }
}
