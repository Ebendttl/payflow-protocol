# Contributing to PayFlow Protocol

Thank you for your interest in contributing to PayFlow Protocol! This project is structured for the **Drips Wave** open-source program. Every module is self-contained so you can contribute without needing to understand the entire codebase.

---

## 🗺️ How to Find Your Task

All contributor tasks are embedded directly in the code as TODO comments in this exact format:

```
// TODO(issue): #ISSUE_NUMBER — description of what to implement
```

**Example:**

```typescript
async claim(params: { streamId: bigint; autoSubmit?: boolean }): Promise<string> {
  // TODO(issue): #20 — Build, sign, and optionally submit claim transaction.
  return Promise.reject("not implemented");
}
```

Each `#ISSUE_NUMBER` corresponds to a GitHub Issue in this repository. Pick an unassigned issue, read the TODO in the source file, and implement it.

---

## 📂 Module Boundaries

Each directory below maps to **one or two GitHub Issues**. Contributors work within a single directory and do not need to touch other modules.

| Directory                            | Description                            | Issue Range |
| ------------------------------------ | -------------------------------------- | ----------- |
| `contracts/stream-vault/`            | Soroban StreamVault implementation     | #1–#7       |
| `contracts/milestone-escrow/`        | Soroban MilestoneEscrow implementation | #8–#13      |
| `contracts/stream-factory/`          | Soroban StreamFactory implementation   | #14–#17     |
| `packages/sdk/src/stream.ts`         | SDK StreamClient methods               | #18–#24     |
| `packages/sdk/src/escrow.ts`         | SDK EscrowClient methods               | #25–#30     |
| `packages/sdk/src/factory.ts`        | SDK FactoryClient methods              | #31–#34     |
| `packages/indexer/src/db/queries.ts` | Drizzle ORM queries                    | #35–#42     |
| `packages/indexer/src/listener.ts`   | Stellar Horizon polling                | #43–#44     |
| `packages/indexer/src/processor.ts`  | Event processing & DB writes           | #45–#49     |
| `packages/indexer/src/index.ts`      | Hono REST API endpoints                | #50–#53     |
| `apps/web/lib/hooks/`                | React data hooks                       | #54–#55     |
| `apps/web/components/`               | React component wiring                 | #56–#64     |
| `cli/src/commands/`                  | CLI command implementations            | #65–#71     |

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** v18+ and **pnpm** v8+
- **Rust** stable + `wasm32-unknown-unknown` target
- **Soroban CLI**: `cargo install --locked soroban-cli`
- **Freighter wallet** extension (for frontend testing)

### Install

```bash
git clone https://github.com/Ebendttl/payflow-protocol
cd payflow-protocol
pnpm install
```

### Running Tests

**Rust contracts (from any contract directory):**

```bash
cd contracts/stream-vault && cargo test
cd contracts/milestone-escrow && cargo test
cd contracts/stream-factory && cargo test
```

**Or from root (all contracts at once):**

```bash
cargo test --workspace
```

**TypeScript packages:**

```bash
pnpm test
# or for a specific package:
pnpm --filter @payflow/sdk test
pnpm --filter @payflow/indexer test
```

**Web app (dev server):**

```bash
pnpm --filter payflow-web dev
```

---

## 📋 PR Checklist

Before submitting your pull request:

- [ ] Your implementation replaces the `unimplemented!()` / `Promise.reject("not implemented")` stub
- [ ] All tests pass (`cargo test` / `pnpm test`)
- [ ] The TODO comment for your issue is removed from the file
- [ ] Your PR title references the issue: `feat: resolve #12 — StreamVault get_stream`
- [ ] You have not introduced new dependencies without discussion

---

## 🎯 Acceptance Criteria

Each Drips Wave issue specifies its own acceptance criteria in the issue description. In general, "done" means:

1. The stub is replaced with a working implementation
2. Existing tests pass, and new tests cover the implementation
3. Events are emitted (for contract functions) or data is persisted (for indexer functions)
4. The TypeScript types remain accurate — no `any` escapes

---

## 💬 Community

- Open a **Draft PR** early to signal you're working on an issue
- Ask questions in GitHub Discussions
- Tag `@Ebendttl` for architectural questions

Thank you for building with us! 🌊
