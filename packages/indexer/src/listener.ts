// TODO(issue): #H5 — Implement full Stellar Horizon polling logic
export interface ListenerConfig {
  horizonUrl: string;
  contractIds: string[];
  pollIntervalMs: number;
}

export class StellarEventListener {
  private intervalId?: NodeJS.Timeout;
  private cursor?: string;

  constructor(
    private config: ListenerConfig,
    private onEventsReceived: (events: any[]) => Promise<void>
  ) {}

  /**
   * Starts the polling mechanism to watch for Stellar contract events.
   */
  start() {
    console.log("Stellar Event Listener starting...");
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        const events = await this.pollLatestTransactions();
        if (events.length > 0) {
          await this.onEventsReceived(events);
        }
      } catch (err: any) {
        console.error("Error in Stellar event listener polling:", err.message);
      }
    }, this.config.pollIntervalMs);
  }

  /**
   * Stops the active polling mechanism.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log("Stellar Event Listener stopped.");
  }

  /**
   * Fetches latest transactions and extracts raw contract events.
   */
  async pollLatestTransactions(): Promise<any[]> {
    // TODO(issue): #H5 — Call Horizon endpoint '/accounts/{contract_id}/transactions', parse envelope XDR, extract events matching contractIds, and advance cursor.
    return [];
  }
}
