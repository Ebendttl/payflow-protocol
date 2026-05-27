# Contribution Guidelines

Welcome to the PayFlow Protocol codebase! This project is designed to be highly modular and friendly to open-source contributions, particularly under the **Drips Wave** program.

---

## 🛠️ Issue Mapping Workflow

Every issue is mapped directly to a `TODO` comment in the codebase. The format is:

```typescript
// TODO(issue): #ISSUE_NUMBER — description
```

For example, if you are assigned issue `#12` to implement the `claim` function in `StreamVault`, you will search for:
```rust
// TODO(issue): #12 — implement the claim function in StreamVault
```
And replace it with your implementation.

---

## 📦 Workspace Organization

1. **Contracts (`/contracts`)**:
   - `stream-vault`: Real-time streaming contract.
   - `milestone-escrow`: Multi-milestone escrow contract.
   - `stream-factory`: Deploys and registers vaults and escrows.
2. **SDK (`/packages/sdk`)**:
   - Wraps contract invocations, builds Stellar transactions, supports Freighter wallet.
3. **Indexer (`/packages/indexer`)**:
   - Polls Stellar Horizon, parses transaction events, stores states, exposes REST endpoints.
4. **App (`/apps/web`)**:
   - React components, Next.js page views, state orchestration via Zustand.
5. **CLI (`/cli`)**:
   - Dev CLI to interact directly with deployed contracts.

---

## 🚀 Submission Process

1. **Fork & Branch:** Clone and create a feature branch (`git checkout -b feature/issue-12`).
2. **Verify Tests:** Ensure all tests pass locally:
   - For Rust contracts: `cargo test`
   - For packages/apps: `pnpm test`
3. **Open PR:** Target the `main` branch. Include the issue number in the PR title (e.g., `feat: resolve #12 - StreamVault claim`).

Thank you for contributing to PayFlow!
