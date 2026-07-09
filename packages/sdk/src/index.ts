import type { PayFlowConfig } from './types.js';
import { StreamClient } from './stream.js';
import { EscrowClient } from './escrow.js';
import { FactoryClient } from './factory.js';

export * from './types.js';
export { StreamClient } from './stream.js';
export { EscrowClient } from './escrow.js';
export { FactoryClient } from './factory.js';
export { FreighterWalletAdapter } from './wallet/freighter.js';
export { LobstrWalletAdapter } from './wallet/lobstr.js';
export { AxelarBridgeAdapter } from './bridge/axelar.js';
export { PathPaymentRouter } from './payments/path-payment.js';

export class PayFlowClient {
  public readonly streams: StreamClient;
  public readonly escrow: EscrowClient;
  public readonly factory: FactoryClient;

  constructor(config: PayFlowConfig) {
    this.streams = new StreamClient(config);
    this.escrow = new EscrowClient(config);
    this.factory = new FactoryClient(config);
  }
}
