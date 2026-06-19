# 🌊 PayFlow Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar: Soroban](https://img.shields.io/badge/Stellar-Soroban-blue.svg)](https://stellar.org/developers)
[![Built for Drips Wave](https://img.shields.io/badge/Drips%20Wave-Program-teal.svg)](#)
[![TypeScript: v5](https://img.shields.io/badge/TypeScript-v5-purple.svg)](https://www.typescriptlang.org/)

**PayFlow Protocol** is a production-ready, Soroban-native real-time payment streaming and multi-sig milestone-gated escrow primitive built on the Stellar blockchain. Designed as a foundational payment layer, it enables DAO payroll, automated grant distributions, trustless contractor agreements, and programmatic treasury management with high speed, predictable fees, and absolute transparency.

---

## 📖 Table of Contents
1. Core Features & Primitives
2. Monorepo Architecture
3. Visual & Design System Discipline
4. Getting Started & Local Environment Setup
5. Smart Contract Compiling & Testing
6. Local Indexer & Web Dashboard Orchestration
7. Drips Wave Contribution Guidelines
8. Documentation Directory
9. License

---

## ⚡ Core Features & Primitives

PayFlow encapsulates two core payment primitives implemented as Rust smart contracts on Stellar's Soroban virtual machine:

### 1. Time-Accrued Streaming (`stream-vault`)
Continuous, second-by-second token payments locked in a secure vault. 
*   **Linear Accrual**: Balances accrue continuously based on time elapsed since the start block/timestamp.
*   **Sender Control**: Senders can pause, resume, or cancel streams.
*   **Recipient Claims**: Recipients can claim accrued balances at any time without terminating the stream.
*   **Security**: Unclaimed/remaining balances are securely returned to the sender upon cancellation.

### 2. Milestone Escrows (`milestone-escrow`)
Multi-signature governed escrow vaults where funds are locked on-chain and disbursed incrementally based on milestone verification.
*   **Structured Releases**: Funds are allocated to distinct project milestones.
*   **Threshold Multi-Sig**: Milestone payouts require a configurable quorum (threshold) of approvals from designated governing addresses.
*   **On-Chain Accountability**: Fully auditable progress logging, milestone descriptions, and approval states.

---

## 🏗️ Monorepo Architecture

PayFlow is organized as a unified monorepo managed via `pnpm` workspaces to isolate modules, enforce distinct separation of concerns, and maintain a robust build graph.

```
payflow-protocol/
├── contracts/                  # Soroban Rust Smart Contracts
│   ├── stream-vault/           # Time-accrued, pause/resume payment streaming engine
│   ├── milestone-escrow/       # Multi-sig, threshold milestone locked-token vault
│   └── stream-factory/         # Unified directory registry & address factory
├── packages/
│   ├── sdk/                    # TypeScript SDK wrapping contract invocations & Freighter
│   └── indexer/                # Horizon event polling daemon, SQLite/Drizzle store, & Hono REST API
├── apps/
│   └── web/                    # Next.js 14 Web Application featuring real-time cards & Zustand stores
├── cli/                        # Node.js Command-Line Interface for automated dev/admin tasks
└── docs/                       # Specifications, audits, threat models, and architectural guides
```

### Module Specifications
| Module | Location | Tech Stack | Responsibility |
| :--- | :--- | :--- | :--- |
| **Smart Contracts** | `contracts/` | Rust, Soroban SDK | Vault logic, state management, validation. |
| **TypeScript SDK** | `packages/sdk/` | TypeScript, `@stellar/stellar-sdk` | Contract bindings, payload assembly, signer connections. |
| **Event Indexer** | `packages/indexer/` | Node.js, SQLite, Drizzle, Hono | Horizon event sync, cached API endpoints for streams/escrows. |
| **Web Dashboard** | `apps/web/` | Next.js 14, Tailwind, Framer Motion | User interface, wallet integration, real-time accrual displays. |
| **Command CLI** | `cli/` | JavaScript, Node.js | Scripted deployments, state checks, and administrative operations. |

---

## 🎨 Visual & Design System Discipline

The web application (`apps/web/`) follows a strict, customized visual design system defined in `tailwind.config.ts`. To prevent inconsistent UI formatting, all developers must adhere to the following rules:

*   **Color Palette Enforcement**: Only use the pre-configured color classes. Do not introduce custom hex codes.
    - **Teal Primary**: `#0D9488` (`text-primary`, `bg-primary`, `hover:bg-primary-light`)
    - **Violet Accent**: `#8B5CF6` (`text-accent`, `bg-accent`)
    - **Space Black**: `#090D16` (Main background)
    - **Semantic Alerts**: Emerald (`text-emerald-400`/`bg-emerald-500/10`) for success, Amber (`text-accent-amber`/`bg-amber-500/10`) for warnings, and Rose (`text-accent-rose`/`bg-rose-500/10`) for error states.
*   **Gradient Constraints**: The brand gradient (`from-primary to-accent`) is reserved exclusively for the hero typography fill and the final primary execution button per page (e.g., "Sign & Create"). All intermediate buttons and links must use flat colors.
*   **Unified Border Radii**:
    - **Small**: `rounded-full` or `rounded-md` (badges, tag pills, small indicators).
    - **Medium**: `rounded-xl` (buttons, inputs, dropdown list containers).
    - **Large**: `rounded-2xl` (cards, panels, modal boxes).

For a complete breakdown of rules and active stubs, see the [Project Memory Ledger](./docs/memory.md).

---

## 🚀 Getting Started & Local Environment Setup

### Prerequisites
Ensure your local machine has the following tools installed:
1. **Node.js** (v18.0.0 or higher)
2. **pnpm** (v8.0.0 or higher)
3. **Rust Toolchain** (latest stable release)
4. **WASM Build Target**:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```
5. **Stellar CLI** (for local network interaction and contract testing)

### Installation
Clone the repository and install all monorepo dependencies from the workspace root:
```bash
git clone https://github.com/Ebendttl/payflow-protocol.git
cd payflow-protocol
pnpm install
```

---

## ⚙️ Smart Contract Compiling & Testing

### Compilation
Build optimized WebAssembly (`.wasm`) smart contract targets:
```bash
cargo build --target wasm32-unknown-unknown --release
```
Compiled WASM assets will be placed under the `target/wasm32-unknown-unknown/release/` directory.

### Smart Contract Unit Testing
Run the comprehensive Rust unit test suite:
```bash
cargo test --workspace
```

### TypeScript SDK Unit Testing
Verify the client SDK wrapper operations:
```bash
pnpm --filter @payflow/sdk test
```

---

## 🖥️ Local Indexer & Web Dashboard Orchestration

To run the full stack locally (Web dashboard UI + Event Indexer database):

### 1. Configure Local Environment Variables
Configure your environment keys inside `apps/web/.env.local` and `packages/indexer/.env`. Templates are provided in their respective directories.

### 2. Start the Local Server Processes
Run the Next.js frontend and indexer daemon concurrently from the workspace root:
```bash
# Run Next.js Dev Server (runs on http://localhost:3000)
pnpm --filter payflow-web dev

# Run Indexer & Hono API Server (runs on http://localhost:3001)
pnpm --filter @payflow/indexer dev
```

---

## 🤝 Drips Wave Contribution Guidelines

PayFlow is built for collaborative extension. Each open issue or feature upgrade is tracked as a distinct `TODO(issue)` comment in the codebase using the following format:

```typescript
// TODO(issue): #ISSUE_NUMBER — description
```

### Contribution Checklist
1. **Check for existing TODOs**: Search for the issue identifier in your editor.
2. **Follow Visual Rules**: Ensure any UI additions comply with the [Visual System Guidelines](./docs/memory.md).
3. **Write Tests**: Implement matching unit/integration tests for your changes.
4. **Build Check**: Verify that `pnpm build` completes successfully prior to submitting a PR.

For detailed submission flow guidelines, read the [Contribution Guide](./docs/contributing.md).

---

## 📂 Documentation Directory

Explore the docs folder for more specialized information:
*   [**System Architecture**](./docs/architecture.md): Visual diagrams, sequence flows, and database schemas.
*   [**Memory Ledger**](./docs/memory.md): Design rules, styling tokens, and details on deferred client stubs.
*   [**Mathematical Specification**](./docs/mathematical-specification.md): Formula definitions for time-accrued stream calculations.
*   [**Security Threat Model**](./docs/security-threat-model.md): Smart contract threat vectors and mitigations.
*   [**SDK Reference**](./docs/sdk-reference.md): Detailed API endpoints and integration snippets for developers.
*   [**Soroban Optimization**](./docs/soroban-optimization-guide.md): On-chain optimization techniques for contract execution.
*   [**Grants Guide**](./docs/GRANTS.md): Program details and integration roadmaps.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.