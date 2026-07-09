# PayFlow Protocol: Threat Model & Security Design

This document details the security architecture, threat model, and defense-in-depth mitigations integrated into the PayFlow Protocol's Soroban smart contracts.

---

## 1. Vulnerability Analysis & Mitigation Matrix

| Attack Vector                                   | Threat Level | Description                                                                                              | PayFlow Protocol Mitigation                                                                                                                                                                                 |
| ----------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unauthorized Action / Authentication Bypass** | 🔴 CRITICAL  | Attackers calling `cancel()`, `pause()`, `resume()`, or `approve_milestone()` on behalf of others.       | Strict usage of Soroban's native auth framework (`auth.require_auth()`) mapping to explicit roles.                                                                                                          |
| **Arithmetic Overflows & Underflows**           | 🔴 CRITICAL  | Manipulation of large token amounts to trigger integer wraps, leading to unauthorized withdrawals.       | All token balances, accrued calculations, and payouts utilize Rust's checked arithmetic (`checked_add`, `checked_sub`, `checked_mul`) on native `i128` types.                                               |
| **Reentrancy Attacks**                          | 🟡 MEDIUM    | Exploiting external token contract calls to recursively re-enter the contract and drain funds.           | 1. Strict **Checks-Effects-Interactions** pattern.<br>2. Verification of asset transfer calls.<br>3. Soroban's single-threaded, host-controlled environment prevents traditional Ethereum-style reentrancy. |
| **Storage Fee Starvation & State Bloat**        | 🟡 MEDIUM    | Artificially filling contract storage with millions of empty streams/escrows to exhaust ledger capacity. | 1. Users must pay their own rent deposit fees through Stellar network native gas/rent fees.<br>2. Strategic use of **Instance Storage** vs **Temporary Storage** for stream lifetimes.                      |
| **Front-Running / Transaction Reordering**      | 🟢 LOW       | Front-running escrow approvals or stream cancellations to block withdrawals.                             | Use of absolute sequence blocks/timestamps and declarative status validations (`StreamStatus::Active` guards).                                                                                              |

---

## 2. Deep Dive: Access Control & Authentication Safeguards

### Native Soroban Auth Integration

Every critical state-changing method in the PayFlow smart contracts enforces native signature verification. The caller's cryptographic identity is validated directly using the Soroban Host Environment, preventing signature forgery or relay attacks:

```rust
// StreamVault: Cancel Guard
pub fn cancel(env: Env, stream_id: u64) {
    let mut stream = get_stream_state(&env, stream_id);

    // Enforce that only the sender who locked the funds can cancel the stream
    stream.sender.require_auth();

    assert!(matches!(stream.status, StreamStatus::Active | StreamStatus::Paused), "Stream not cancellable");
    ...
}
```

### Escrow Approver Quorum Guards

Milestone escrow releases are governed by a multi-sig quorum. The contract ensures that:

1. Approvers are declared upon deployment and immutable.
2. Duplicate approval signatures from the same address for a single milestone are rejected.
3. Funds are only transferred once the threshold count is met.

```rust
// MilestoneEscrow: Milestone Approval Guard
pub fn approve_milestone(env: Env, escrow_id: u64, milestone_idx: u32, approver: Address) {
    let mut escrow = get_escrow_state(&env, escrow_id);

    // 1. Verify the calling entity matches the declared approver signature
    approver.require_auth();

    // 2. Assert the approver is in the whitelist
    assert!(escrow.approvers.contains(&approver), "Not an authorized approver");

    // 3. Prevent duplicate approvals
    let mut milestone = escrow.milestones.get(milestone_idx).unwrap();
    assert!(!milestone.approvals.contains(&approver), "Already approved by this address");

    milestone.approvals.push_back(approver);
    ...
}
```

---

## 3. Mathematical & Rounding Precision Checks

Token distribution calculations use `i128` fixed-point representations. To prevent tiny rounding residuals from aggregating and locking up funds:

- Divison operations are placed at the absolute end of mathematical flows to minimize truncation error.
- When streams are cancelled, the exact claimable amount is sent to the recipient, and the remainder is refunded to the sender using precise timestamp differences.

---

## 4. Soroban Storage Rent & Lifecycle Mitigation

Soroban introduced state archival to keep ledger sizes predictable. Contracts must manage **Persistent**, **Instance**, and **Temporary** storage keys to prevent active data from becoming archived (and requiring costly restore operations):

1. **Instance Storage**: Stores contract configuration, including token contract IDs and administrative keys.
2. **Persistent Storage**: Stores stream and escrow state. Since streams and escrows have defined end dates, they can be deleted once completed, returning storage fees and preventing ledger bloat.
3. **Storage Extension**: Successful calls to `claim()`, `pause()`, and `approve_milestone()` automatically call `env.storage().persistent().extend_ttl()` to keep data alive for active streams.
