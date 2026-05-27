// TODO(issue): #M8 — Implement stream event notification webhooks
export class WebhookDispatcher {
  /**
   * Dispatches webhooks to registered endpoints for on-chain events.
   */
  async dispatchEvent(eventType: string, payload: any): Promise<void> {
    console.log(`Dispatching webhook event ${eventType} — not implemented`);
    // In future: Query registered webhook urls, construct signed request, submit POST
  }
}
