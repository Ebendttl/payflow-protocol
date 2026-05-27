import { PayFlowConfig } from './types.js';
import { StreamClient } from './stream.js';
import { EscrowClient } from './escrow.js';
import { FactoryClient } from './factory.js';

export * from './types.js';
export { StreamClient } from './stream.js';
export { EscrowClient } from './escrow.js';
export { FactoryClient } from './factory.js';

export class PayFlowClient {
  public streams: StreamClient;
  public escrow: EscrowClient;
  public factory: FactoryClient;

  constructor(config: PayFlowConfig) {
    this.streams = new StreamClient(config);
    this.escrow = new EscrowClient(config);
    this.factory = new FactoryClient(config);
  }
}
