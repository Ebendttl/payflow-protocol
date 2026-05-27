export interface ListenerConfig {
  horizonUrl: string;
  contractIds: string[];
  pollIntervalMs: number;
}

export class StellarEventListener {
  private intervalId?: NodeJS.Timeout;

  constructor(
    private config: ListenerConfig,
    private onEventsReceived: (events: any[]) => Promise<void>
  ) {}

  /**
   * Starts the polling mechanism to watch for Soroban transactions.
   */
  start() {
    // TODO(issue): #43 — Setup dynamic polling of Stellar Horizon for transactions containing contract interactions. Emit parsed events to onEventsReceived callback.
    console.log("Stellar Event Listener starting...");
  }

  /**
   * Stops the active polling mechanism.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Fetches latest transactions and extracts raw contract events.
   */
  async pollLatestTransactions(): Promise<any[]> {
    // TODO(issue): #44 — Fetch Horizon endpoint '/accounts/{contract_id}/transactions', filter by ledger time/cursor, and return transactions for parsing.
    throw new Error("not implemented");
  }
}
