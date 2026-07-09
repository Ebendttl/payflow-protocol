# PayFlow Protocol: Open-Source Contribution Guide

Welcome! This repository is designed to be highly modular, developer-friendly, and optimized for community contributions—particularly under the **Drips Wave** program.

---

## 🛠️ The Issue Mapping Workflow

To keep the codebase clean and accessible for first-time open-source contributors, every open issue is mapped directly to a distinct `TODO` comment in the codebase. The format is strictly:

```typescript
// TODO(issue): #ISSUE_NUMBER — description
```

### How to contribute in 3 simple steps:

1. **Search**: Search the workspace for `TODO(issue): #<your-assigned-issue-number>`.
2. **Implement**: Implement the requested logic, keeping all other codebase elements intact.
3. **Verify**: Run the local test runner (`cargo test` or `pnpm test`) to ensure your implementation compiles and passes all test specifications.

---

## 📦 Workspace Structure

The monorepo workspace is split logically into five distinct packages:

```
├── contracts/               # Soroban Smart Contracts
│   ├── stream-vault/        # Real-time streaming payment settlement engine
│   ├── milestone-escrow/    # Multi-sig milestoneLocked-token vault
│   └── stream-factory/      # Ecosystem directory and address registry
├── packages/
│   ├── sdk/                 # TypeScript client library wrapping contract interactions
│   └── indexer/             # Event-driven polling service, Drizzle ORM schema, and Hono REST API
├── apps/
│   └── web/                 # Next.js 14 Web Application containing cards, stores, and wizard forms
├── cli/                     # Node.js command-line interface for developer interaction
└── docs/                    # Architectural documents and contract specs
```

---

## 🚀 Setting Up the Development Workspace

### Prerequisites

Ensure you have the following installed locally:

- Node.js (v18+) & `pnpm` (v8+)
- Rust (1.75+) and the wasm32 target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- Soroban CLI (recommended for contract deployment)

### 1. Install Workspace Dependencies

From the root of the monorepo, run:

```bash
pnpm install
```

### 2. Compile Soroban Contracts

Compile all smart contracts in the workspace:

```bash
cargo build --target wasm32-unknown-unknown --release
```

### 3. Run the Monorepo Test Suites

Run the entire monorepo test suite (Rust and TypeScript):

```bash
# Run Rust smart contract unit tests
cargo test --workspace

# Run TypeScript SDK and Indexer unit tests
pnpm test
```

---

## 📜 Pull Request Guidelines

- **Keep PRs focused**: Solve only one issue per pull request.
- **Maintain Diffs**: Ensure your code changes do not alter unrelated lines or delete necessary architectural scaffolding.
- **Reference Issues**: Include the mapped issue number in your pull request description (e.g., `closes #M1`).

Thank you for helping us build the future of real-time decentralized payment systems on Stellar!
