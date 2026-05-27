# 🌊 PayFlow Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar: Soroban](https://img.shields.io/badge/Stellar-Soroban-blue.svg)](https://stellar.org/developers)
[![Built for Drips Wave](https://img.shields.io/badge/Drips%20Wave-Program-tealviolet.svg)](#)

PayFlow Protocol is an open-source, Soroban-native payment streaming, milestone-gated escrow, and disbursement platform built on the Stellar blockchain. Designed as a key primitive for DAO payroll, grant distributions, and contractor milestones, PayFlow allows organizations to distribute capital securely and continuously.

---

## 🏗️ Monorepo Architecture

This repository is structured as a `pnpm` workspace to isolate components and enable independent community contributions:

```
payflow-protocol/
├── contracts/
│   ├── stream-vault/          # Soroban: time-based streaming contract (Rust)
│   ├── milestone-escrow/      # Soroban: milestone-gated escrow contract (Rust)
│   └── stream-factory/        # Soroban: registry & factory for both contract types
├── packages/
│   ├── sdk/                   # @payflow/sdk — TypeScript SDK wrapping Soroban contracts
│   └── indexer/               # Event listener (Horizon) + SQLite/Postgres store + Hono API
├── apps/
│   └── web/                   # Next.js 14 React dApp (App Router + Tailwind + Freighter)
├── cli/                       # Developer CLI (commander + chalk + ora) for managing streams
└── docs/                      # Technical documentation & specification files
```

---

## ⚡ Quick Start

### Prerequisites

To build and run all packages in the workspace, you will need:
- **Node.js** (v18+) & **pnpm** (v8+)
- **Rust** & **Cargo** (Stellar Soroban development)
- **Soroban CLI** (`cargo install --locked soroban-cli`)

### Setup Instructions

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Build the Entire Workspace:**
   ```bash
   pnpm build
   ```

3. **Run Soroban Contract Tests:**
   ```bash
   cd contracts/stream-vault && cargo test
   cd ../milestone-escrow && cargo test
   cd ../stream-factory && cargo test
   ```

4. **Start the Next.js dApp Locally:**
   ```bash
   pnpm --filter payflow-web dev
   ```

5. **Run the Indexer:**
   ```bash
   pnpm --filter @payflow/indexer dev
   ```

---

## 🤝 Contribution Guidelines

This project has been structured for the **Drips Wave** program. Each folder represents self-contained issues. We use comments in the format:
`// TODO(issue): #ISSUE_NUMBER — description` to signal codebase tasks that contributors can pick up.

For a detailed walkthrough, please see [CONTRIBUTING.md](./docs/contributing.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.