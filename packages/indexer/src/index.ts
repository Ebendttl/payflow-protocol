import { Hono } from 'hono';
import { StellarEventListener } from './listener.js';
import { EventProcessor } from './processor.js';

const app = new Hono();

// Stub Database connection
const db = {};

// GET /streams
app.get('/streams', async (c) => {
  const sender = c.req.query('sender');
  // TODO(issue): #50 — Retrieve streams filtered by sender address with pagination support.
  return c.json({ error: "not implemented" }, 501);
});

// GET /streams/:id
app.get('/streams/:id', async (c) => {
  const id = c.req.param('id');
  // TODO(issue): #51 — Retrieve stream by its primary key string.
  return c.json({ error: "not implemented" }, 501);
});

// GET /escrows
app.get('/escrows', async (c) => {
  const sender = c.req.query('sender');
  // TODO(issue): #52 — Retrieve escrows filtered by sender with pagination.
  return c.json({ error: "not implemented" }, 501);
});

// GET /escrows/:id
app.get('/escrows/:id', async (c) => {
  const id = c.req.param('id');
  // TODO(issue): #53 — Retrieve escrow and its related milestones by escrow id.
  return c.json({ error: "not implemented" }, 501);
});

const port = process.env.PORT || 3001;
console.log(`Indexer REST API running on port ${port}`);

// Initialize Stellar Listener & Processor
const listener = new StellarEventListener(
  {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    contractIds: [],
    pollIntervalMs: 5000,
  },
  async (events) => {
    const processor = new EventProcessor(db);
    await processor.processEvents(events);
  }
);

listener.start();

export default {
  port,
  fetch: app.fetch,
};
export { app };
