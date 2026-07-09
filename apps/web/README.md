# PayFlow Web App (`apps/web`)

Next.js 14 App Router dApp for the PayFlow Protocol. This is the primary user interface — it connects to the Soroban contracts via the Freighter wallet, displays real-time streaming progress, and provides milestone management.

## Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Framework | Next.js 14 (App Router)                 |
| Styling   | Tailwind CSS (dark glassmorphism theme) |
| State     | Zustand (wallet + stream state)         |
| Wallet    | `@stellar/freighter-api`                |
| Forms     | `react-hook-form` + `zod`               |
| SDK       | `@payflow/sdk` (workspace dependency)   |

## Directory Structure

```
app/
├── page.tsx               # Landing page — hero + CTA + feature grid
├── streams/
│   ├── page.tsx           # Streams dashboard — live StreamCards
│   └── create/
│       └── page.tsx       # 3-step stream creation wizard
└── escrow/
    ├── page.tsx           # Escrow list dashboard
    └── [id]/
        └── page.tsx       # Milestone detail + approval UI
components/
├── StreamCard.tsx         # Animated real-time progress bar card
├── CreateStreamForm.tsx   # Multi-step wizard (react-hook-form + zod)
├── MilestoneCard.tsx      # Approver quorum card with approve action
├── EscrowPanel.tsx        # Full escrow detail manager
├── WalletButton.tsx       # Freighter connect/disconnect toggle
└── ClaimButton.tsx        # Claim accrued stream tokens
lib/
├── stellar.ts             # Freighter API wrappers
├── hooks/
│   ├── useStream.ts       # React hook — subscribe to stream state from indexer
│   └── useEscrow.ts       # React hook — subscribe to escrow state from indexer
└── store/
    └── walletStore.ts     # Zustand global wallet/address state
```

## Local Setup

### 1. Install Dependencies (from monorepo root)

```bash
pnpm install
```

### 2. Set Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_INDEXER_URL=http://localhost:3001
NEXT_PUBLIC_STREAM_VAULT_CONTRACT=CDAAA...
NEXT_PUBLIC_MILESTONE_ESCROW_CONTRACT=CBAAA...
NEXT_PUBLIC_STREAM_FACTORY_CONTRACT=CCAAA...
```

### 3. Run Development Server

```bash
pnpm --filter payflow-web dev
# App runs at http://localhost:3000
```

## Connecting Freighter

Install the [Freighter browser extension](https://www.freighter.app/) and switch to **Testnet** before connecting. The `WalletButton` component handles connection state via the Zustand `walletStore`.

## Contributing

Key TODOs for contributors (see issue numbers in source files):

- **#54** — Connect `useStream` hook to indexer REST API
- **#55** — Connect `useEscrow` hook to indexer REST API
- **#56** — Wire `ClaimButton` to SDK `streams.claim()`
- **#57, #58** — Wire Pause/Resume buttons in `StreamCard`
- **#59** — Wire `CreateStreamForm` submit to SDK `factory.deployStreamVault()`
- **#60** — Wire `MilestoneCard` approve to SDK `escrow.approveMilestone()`
- **#61** — Wire `EscrowPanel` cancel to SDK `escrow.cancelEscrow()`
- **#63, #64** — Load real data in streams/escrow dashboard pages from indexer
