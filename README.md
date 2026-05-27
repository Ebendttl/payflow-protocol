# 🌊 PayFlow Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar: Soroban](https://img.shields.io/badge/Stellar-Soroban-blue.svg)](https://stellar.org/developers)
[![Built for Drips Wave](https://img.shields.io/badge/Drips%20Wave-Program-teal.svg)](#)
[![TypeScript: v5](https://img.shields.io/badge/TypeScript-v5-purple.svg)](https://www.typescriptlang.org/)

**PayFlow Protocol** is a production-ready, Soroban-native real-time payment streaming and multi-sig milestone-gated escrow primitive built on the Stellar blockchain. Designed as a foundational payment primitive, it enables DAO payroll, automated grant distributions, and trustless contractor payments with high speed, predictable fees, and absolute transparency.

---

## 🏗️ Technical Architecture & Monorepo Layout

PayFlow is structured as a unified monorepo using a `pnpm` workspace to manage isolated modules, maintaining separation of concerns while facilitating community-led development:

```
payflow-protocol/
├── contracts/                  # Soroban Rust Smart Contracts
│   ├── stream-vault/           # Time-accrued, pause/resume payment streaming engine
│   ├── milestone-escrow/       # Multi-sig, threshold milestone locked-token vault
│   └── stream-factory/         # Unified directory registry & address factory
├── packages/
│   ├── sdk/                    # TypeScript Client Library wrapping contract invocations & Freighter
│   └── indexer/                # Horizon event polling daemon, Drizzle ORM SQLite database, & Hono REST API
├── apps/
│   └── web/                    # Next.js 14 Web Application featuring real-time cards, forms, & stores
├── cli/                        # Node.js Command-Line Interface for automated contract interaction
└── docs/                       # Architectural diagrams, specifications, and onboarding guidelines
```

For a comprehensive deep dive into data flow and contract state layouts, read our [System Architecture Guide](./docs/architecture.md).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed locally:
- **Node.js** (v18+) & **pnpm** (v8+)
- **Rust** & **Cargo** (for Soroban development)
- **Soroban target**:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

### 1. Installation
Install all package dependencies from the root directory:
```bash
pnpm install
```

### 2. Compile Soroban Contracts
Compile optimized WASM binaries for the smart contracts:
```bash
cargo build --target wasm32-unknown-unknown --release
```

### 3. Run the Unit Test Suites
We maintain strict test boundaries across all layers:
```bash
# Run Rust Soroban contract tests
cargo test --workspace

# Run TypeScript SDK and Indexer tests
pnpm test
```

### 4. Local Development Servers
Launch both the Next.js frontend and the indexer API locally in parallel:
```bash
# Run Next.js 14 App (accessible at http://localhost:3000)
pnpm --filter payflow-web dev

# Run Indexer Hono REST API (accessible at http://localhost:3001)
pnpm --filter @payflow/indexer dev
```

---

## 🤝 Drips Wave Open-Source Contributions

PayFlow is custom-engineered for community contribution! Every open task is mapped to a distinct `TODO` comment across our monorepo files, specifying:

```typescript
// TODO(issue): #ISSUE_NUMBER — description
```

To contribute, check out our [Contribution Guidelines](./docs/contributing.md) for the issue-to-code mapping workflow, setup guides, and pull request procedures.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.