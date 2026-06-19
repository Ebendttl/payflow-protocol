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
*   **Primary (Teal)**: `#0D9488` (`text-primary`, `bg-primary`, `hover:bg-primary-light`)
*   **Accent (Violet)**: `#8B5CF6` (`text-accent`, `bg-accent`)
*   **Dark (Space Black)**: `#090D16` (main background), `#111827` (800), `#1F2937` (700), `#374151` (600)
*   **Accent Emerald**: `#10B981` (Success status / checks)
*   **Accent Rose**: `#F43F5E` (Errors / danger / cancellation)
*   **Accent Amber**: `#F59E0B` (Warning / pending states)
*   **Accent Purple**: `#A78BFA`

### 2. Gradient Usage Rule
**The teal-to-violet gradient (`bg-gradient-to-r from-primary to-accent`) has exactly ONE job.**
*   **Allowed Locations**:
    1. The hero headline's emphasized text span on the landing page (`/`).
    2. The single primary CTA button per view (e.g. "Connect Wallet to Get Started", "Sign & Create" / "Sign & Deploy Escrow", "New Stream" / "New Escrow").
*   **Forbidden Locations**:
    - Intermediate next/back steps, status badges, secondary buttons, sidebar elements, cards, and text fills (other than hero) must use flat solid colors.

### 3. Unified Border Radius Scale
*   **Small (Badges, tags, status elements)**: `rounded-full` or `rounded-md`
*   **Medium (Buttons, inputs, dropdown options, filters)**: `rounded-xl`
*   **Large (Cards, main panels, modal dialogs)**: `rounded-2xl`
*   *Note: Standardize skeleton loaders to match these values.*

### 4. Shadows & Glows
*   **Shadows**: Use neutral shadows (`shadow-lg hover:shadow-black/20`).
*   **Glows**: Glows (e.g., `shadow-primary/20`) are reserved exclusively for the primary CTA button on hover/focus and the active form step indicator. Remove all ambient card glows.

### 5. Semantic Icon Color Standards
*   **Decorative icons**: Neutral gray or white (`text-dark-400` / `text-white`).
*   **Actionable / Status icons**:
    - Emerald (`text-emerald-400`) for success checkmarks and completion.
    - Rose (`text-accent-rose`) for warnings, errors, delete trashcans, and cancellation.
    - Teal (`text-primary`) for wallet/brand actions.

---

## 🛠️ Monorepo Modules & State

### Rust Contracts (`contracts/`)
*   `stream-vault`: Core contract handling deposit locks, second-by-second rate calculations, and balance claims.
*   `milestone-escrow`: Multi-sig escrow vault tracking milestone status approvals, threshold counts, and payouts.
*   `stream-factory`: Registry and address deployer for factory streams.

### TypeScript SDK (`packages/sdk/`)
*   Located at `packages/sdk/`.
*   Acts as a developer interface to interact with deployed contract instances.
*   **CRITICAL CONTEXT**: In `apps/web`, client functions for `EscrowClient` (such as `createEscrow`, `approveMilestone`, and `claimMilestone`) are currently stubbed out (intentionally deferred) on the frontend integration level. **Do not overwrite these stubs with complex logic unless explicitly instructed by the user.**

### Event Indexer (`packages/indexer/`)
*   Polls the Horizon network for contract event logs.
*   Uses Drizzle ORM with an SQLite backend database.
*   Exposes a REST API via Hono server.

### Next.js 14 Frontend (`apps/web/`)
*   Next.js 14 App Router, built with TypeScript, Tailwind CSS, Framer Motion, and Zustand state stores.
*   Uses `react-hot-toast` for toast alerts.
*   Active wallet store resides in `lib/store/walletStore.ts`.

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
