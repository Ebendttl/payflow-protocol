# PayFlow Protocol: Soroban Resource Optimization Guide

This document outlines the professional-grade techniques, compiler settings, and architectural designs implemented within the PayFlow smart contracts to minimize execution costs (CPU/RAM), reduce WASM footprint, and optimize ledger storage fees.

---

## 1. Footprint & Storage Architecture Optimization

In Soroban, storage fees are charged based on the ledger footprint (keys read and written). We optimize footprint sizes through the following strategies:

### Struct Packing

Instead of storing redundant fields, we pack state attributes to minimize the serialized size in storage. For example:

- Timestamps are stored as `u64` (seconds elapsed) rather than higher-precision `u128` integers.
- Unnecessary string metadata is omitted from the contract storage; instead, metadata is emitted during creation events to be indexed off-chain by the event listener.

### Decoupled Data Mapping

Rather than maintaining a massive dynamic list of streams inside a single contract storage key (which would lead to quadratic reading costs as the user base grows), every stream is assigned a unique key:

```rust
// Storage Key Layout
#[contracttype]
pub enum DataKey {
    Stream(u64), // Individual stream key
    Counter,     // Monotonically increasing ID counter
}
```

This ensures that the cost of reading or updating a stream remains **O(1)**, completely independent of the total active users.

---

## 2. WASM Binary Optimization (Size Reduction)

Smart contract deployment cost on Stellar scales linearly with the size of the compiled `.wasm` file. We implement a strict binary optimization pipeline to keep contract size under 50KB:

### Optimization Compiler Flags

All production builds employ optimal `Cargo.toml` profiles:

```toml
[profile.release]
opt-level = "z"            # Optimize strictly for size
lto = true                 # Enable Link Time Optimization
codegen-units = 1          # Reduce parallel generator units to maximize optimization
panic = "abort"            # Disable stack unwinding panics to strip trace symbols
strip = true               # Strip debug symbols and name sections
```

### Avoiding Heavy Macro Dependencies

We avoid importing heavy third-party parsing libraries inside the smart contracts. Standard serialization and formatting operations are delegated to off-chain indexer processors and the TypeScript SDK.

---

## 3. TTL (Time-to-Live) & Rent Reclamation

All persistent ledger entries on Stellar must pay rent to stay active. To prevent stream states from being archived or causing excessive storage fees:

- **Automatic TTL Extension**: Whenever a participant interacts with a stream (via `claim()`, `pause()`, etc.), the contract automatically extends the TTL of that persistent key using:
  ```rust
  env.storage().persistent().extend_ttl(&key, MIN_THRESHOLD, LIFETIME_EXTENSION);
  ```
- **Storage Deletion**: Once a stream is cancelled or fully claimed, the contract deletes the storage key (`env.storage().persistent().remove(&key)`), immediately freeing up ledger space and reclaiming the storage rent reserve for the sender.

---

## 4. CPU & Memory Resource Limits

Soroban transactions have strict CPU instruction and RAM limits. Our algorithms are designed for deterministic execution times:

1. **Accrual Calculations**: The math for calculating real-time accrued tokens uses a direct linear formula (O(1) CPU complexity) rather than loops or iterative steps.
2. **Quorum Verification**: When verifying multi-sig approvals for milestones, we use simple linear searches on pre-sorted vectors of size `<= 10` to avoid gas-heavy lookup loops.
