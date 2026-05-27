import { Hono } from 'hono';
import { StellarEventListener } from './listener.js';
import { EventProcessor } from './processor.js';

const app = new Hono();

// Stub database connection — TODO(issue): #H5 replace with real Drizzle DB instance
const db = {};

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok' }));

// ─── Streams ──────────────────────────────────────────────────────────────────

// GET /streams?sender=<address>
app.get('/streams', async (c) => {
  // TODO(issue): #H5 — Wire to getStreamsBySender(db, sender) query with pagination
  return c.json({ error: 'not implemented — see issue #H5' }, 501);
});

// GET /streams/:id
app.get('/streams/:id', async (c) => {
  // TODO(issue): #H5 — Wire to getStreamById(db, id) query
  return c.json({ error: 'not implemented — see issue #H5' }, 501);
});

// ─── Escrows ──────────────────────────────────────────────────────────────────

// GET /escrows?sender=<address>
app.get('/escrows', async (c) => {
  // TODO(issue): #H5 — Wire to getEscrowsBySender(db, sender) query
  return c.json({ error: 'not implemented — see issue #H5' }, 501);
});

// GET /escrows/:id
app.get('/escrows/:id', async (c) => {
  // TODO(issue): #H5 — Wire to getEscrowById + getMilestonesForEscrow for full detail view
  return c.json({ error: 'not implemented — see issue #H5' }, 501);
});

// ─── Server bootstrap ─────────────────────────────────────────────────────────
const port = Number(process.env.PORT ?? 3001);
console.log(`Indexer REST API running on port ${port}`);

const listener = new StellarEventListener(
  {
    horizonUrl: process.env.HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
    contractIds: (process.env.CONTRACT_IDS ?? '').split(',').filter(Boolean),
    pollIntervalMs: 5000,
  },
  async (events) => {
    const processor = new EventProcessor(db);
    await processor.processEvents(events);
  }
);

listener.start();

export default { port, fetch: app.fetch };
export { app };
