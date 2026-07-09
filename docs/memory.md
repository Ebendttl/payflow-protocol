# 🧠 PayFlow Protocol Memory & Project Progress Ledger

This document serves as the project memory ledger to track design rules, architectural specifications, completed milestones, and deferred stubs. It prevents regression and ensures consistency across future iterations.

---

## 📌 Project Overview

PayFlow Protocol is a production-grade payments primitive built on Stellar (Soroban). It offers:

1. **Time-Accrued Streaming**: Continuous, second-by-second token payments with pausing, resuming, and cancellation dynamics.
2. **Milestone Escrows**: Multi-sig governed escrow vaults where funds are released incrementally based on milestone sign-offs.

---

## 🎨 Strict UI & Styling Design System

The frontend app (`apps/web/`) has been systematically refactored under strict styling guidelines. **Do not introduce off-palette colors, custom gradients, or arbitrary border radii.**

### 1. Color Palette (Strictly from `tailwind.config.ts`)

- **Primary (Teal)**: `#0D9488` (`text-primary`, `bg-primary`, `hover:bg-primary-light`)
- **Accent (Violet)**: `#8B5CF6` (`text-accent`, `bg-accent`)
- **Dark (Space Black)**: `#090D16` (main background), `#111827` (800), `#1F2937` (700), `#374151` (600)
- **Accent Emerald**: `#10B981` (Success status / checks)
- **Accent Rose**: `#F43F5E` (Errors / danger / cancellation)
- **Accent Amber**: `#F59E0B` (Warning / pending states)
- **Accent Purple**: `#A78BFA`

### 2. Gradient Usage Rule

**ZERO GRADIENTS, NO EXCEPTIONS.**

- **Allowed Locations**:
  1. The hero headline's emphasized text span on the landing page (`/`): `bg-gradient-to-r from-primary-light to-accent-purple bg-clip-text text-transparent` (the "Built on Stellar Soroban" text). That is the single remaining gradient in the whole app.
- **Forbidden Locations**:
  - Absolutely all buttons, badges, progress bars, icon containers, cards, borders, shadows, backgrounds, and text elements must use flat solid colors. No gradients allowed anywhere else.

### 3. Unified Border Radius Scale

- **Small (Badges, tags, status elements)**: `rounded-full` or `rounded-md`
- **Medium (Buttons, inputs, dropdown options, filters)**: `rounded-xl`
- **Large (Cards, main panels, modal dialogs)**: `rounded-2xl`
- _Note: Standardize skeleton loaders to match these values._

### 4. Shadows & Glows

- **Shadows**: Use neutral shadows (`shadow-lg hover:shadow-black/20`).
- **Glows**: Glows (e.g., `shadow-primary/20`) are reserved exclusively for the primary CTA button on hover/focus and the active form step indicator. Remove all ambient card glows.

### 5. Semantic Icon Color Standards

- **Decorative icons**: Neutral gray or white (`text-dark-400` / `text-white`).
- **Actionable / Status icons**:
  - Emerald (`text-emerald-400`) for success checkmarks and completion.
  - Rose (`text-accent-rose`) for warnings, errors, delete trashcans, and cancellation.
  - Teal (`text-primary`) for wallet/brand actions.

---

## 🛠️ Monorepo Modules & State

### Rust Contracts (`contracts/`)

- `stream-vault`: Core contract handling deposit locks, second-by-second rate calculations, and balance claims.
- `milestone-escrow`: Multi-sig escrow vault tracking milestone status approvals, threshold counts, and payouts.
- `stream-factory`: Registry and address deployer for factory streams.

### TypeScript SDK (`packages/sdk/`)

- Located at `packages/sdk/`.
- Acts as a developer interface to interact with deployed contract instances.
- **CRITICAL CONTEXT**: In `apps/web`, client functions for `EscrowClient` (such as `createEscrow`, `approveMilestone`, and `claimMilestone`) are currently stubbed out (intentionally deferred) on the frontend integration level. **Do not overwrite these stubs with complex logic unless explicitly instructed by the user.**

### Event Indexer (`packages/indexer/`)

- Polls the Horizon network for contract event logs.
- Uses Drizzle ORM with an SQLite backend database.
- Exposes a REST API via Hono server.

### Next.js 14 Frontend (`apps/web/`)

- Next.js 14 App Router, built with TypeScript, Tailwind CSS, Framer Motion, and Zustand state stores.
- Uses `react-hot-toast` for toast alerts.
- Active wallet store resides in `lib/store/walletStore.ts`.

---

## 🏆 Completed Milestones & Refactorings

1.  **Shared Layout Extraction**: Extracted global `Navbar` containing unified logo markings, responsive mobile drawer menu, and clean links.
2.  **Wallet Selection Unification**: Extracted `WalletOptionButton` to eliminate inline styling and standardize Freighter and LOBSTR select states.
3.  **Visual Cleanups**:
    - Refactored `streams/page.tsx` empty-state panel and connection actions.
    - Simplified landing page features layout and unified primary CTA gradients.
    - Cleaned up custom buttons inside `MilestoneCard.tsx` and `ClaimButton.tsx` to use flat primary/secondary properties.
    - Refactored `CreateStreamForm.tsx` and `escrow/create/page.tsx` inputs/buttons to comply with border-radius (`rounded-xl`) and color codes.
    - Verified Next.js compiler execution (compilation completed with exit code 0).
4.  **Flat Button Component & Absolute Gradient Pass**:
    - Created the shared, reusable `Button` component under `apps/web/components/ui/Button.tsx` to handle flat primary, secondary, and danger styles.
    - Performed an exhaustive, app-wide gradient removal pass, replacing all gradient CTAs and progress bars with flat `bg-primary` styles.
    - Configured ESLint with compatible versions and resolved unescaped quotes to ensure `pnpm lint` and `pnpm build` compile with zero errors.

---

## 🚀 Production Deployment & Hosting

The PayFlow Protocol monorepo is fully deployed to production with the following architecture:

### 1. Frontend Web App (Vercel)

- **Live URL**: `https://payflow-protocol-web.vercel.app`
- **Build command override**: `pnpm --filter @payflow/sdk build && next build` (compiles the shared SDK before compiling Next.js).
- **Environment Variables**:
  - `NEXT_PUBLIC_NETWORK`: `testnet`
  - `NEXT_PUBLIC_HORIZON_RPC_URL`: `https://soroban-rpc.testnet.stellar.gateway.fm`
  - `NEXT_PUBLIC_STREAM_FACTORY_CONTRACT_ID`: `CARYVEW3UGDWVTF6DXG2PJ4AMGLTXS377HGMJQI7QWVSXWSZIUO4XHZZ`
  - `NEXT_PUBLIC_MILESTONE_ESCROW_CONTRACT_ID`: `CATLNHGZPOCUVKZQXAXMJO46Z5A44XN3TBOGU7JTRIN6R4CO7SHGUWBZ`
  - `NEXT_PUBLIC_STREAM_VAULT_CONTRACT_ID`: `CDAFGGCUE4VQPXY5SIZ3SENQK4VXAOQMW5L6NWPRX2JTO5IERRPKPQ2D`
  - `NEXT_PUBLIC_INDEXER_URL`: `https://payflow-indexer.onrender.com`

### 2. Event Indexer Backend (Render)

- **Live Web Service URL**: `https://payflow-indexer.onrender.com`
- **Build command**: `pnpm install && pnpm --filter @payflow/indexer build`
- **Start command**: `node packages/indexer/dist/index.js`
- **Instance Type**: Free Web Service (restarted and bound to the port using `@hono/node-server`).
- **Database**: Persistent Render Postgres (`codesync-db` in region `Oregon`).
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: Connection string to active Render Postgres.
  - `HORIZON_URL`: `https://horizon-testnet.stellar.org`
  - `CONTRACT_IDS`: `CARYVEW3UGDWVTF6DXG2PJ4AMGLTXS377HGMJQI7QWVSXWSZIUO4XHZZ,CATLNHGZPOCUVKZQXAXMJO46Z5A44XN3TBOGU7JTRIN6R4CO7SHGUWBZ,CDAFGGCUE4VQPXY5SIZ3SENQK4VXAOQMW5L6NWPRX2JTO5IERRPKPQ2D`
  - `PORT`: `10000` (Assigned dynamically by Render)
