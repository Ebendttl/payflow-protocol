// TODO(issue): #M5 — Implement Stellar path payment routing in SDK
export class PathPaymentRouter {
  /**
   * Finds the best payment path and executes the path payment transaction.
   */
  async routePayment(
    sourceAsset: string,
    destinationAsset: string,
    amount: bigint,
    recipient: string
  ): Promise<string> {
    console.log(
      `Routing path payment from ${sourceAsset} to ${destinationAsset} — not implemented`
    );
    throw new Error('not implemented');
  }
}
