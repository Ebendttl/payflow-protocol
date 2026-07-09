# @payflow/indexer

A lightweight Node.js event indexer for PayFlow contracts. It polls the Stellar Horizon REST API, extracts transaction-level events, stores contract state transitions in SQLite (development) or Postgres (production) using Drizzle ORM, and exposes an API endpoint using Hono.js.

## API Endpoints

- `GET /streams?sender={address}` - Get paginated list of streams.
- `GET /streams/{id}` - Get single stream information.
- `GET /escrows?sender={address}` - Get active escrows list.
- `GET /escrows/{id}` - Get detailed escrow milestones and approvals status.

## Environment Setup

Create a `.env` file in the indexer directory:

```env
DATABASE_URL=file:local.db
PORT=3001
HORIZON_URL=https://horizon-testnet.stellar.org
```

## Running locally

1. **Install Dependencies:**

   ```bash
   pnpm install
   ```

2. **Start Dev Mode:**
   ```bash
   pnpm dev
   ```

## Running Tests

To execute tests:

```bash
pnpm test
```
