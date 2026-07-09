# Milestone Escrow Soroban Contract (`milestone-escrow`)

This contract implements the milestone-based escrow mechanism. Funds are held in escrow and released incrementally to the recipient upon receiving enough approvals from a multi-sig quorum of designated accounts.

## Features

- Multi-milestone support
- Multi-sig approver quorum
- Individual milestone releases
- Contract cancellation with refunding of unreleased milestone amounts to the sender

## API Interface

Refer to `src/lib.rs` for the full trait definition:

- `create_escrow(sender, recipient, token, total_amount, milestones, approvers, threshold)`
- `approve_milestone(escrow_id, milestone_index, approver)`
- `release_milestone(escrow_id, milestone_index)`
- `cancel_escrow(escrow_id)`
- `get_escrow(escrow_id)`
- `get_milestone(escrow_id, index)`

## Local Development & Testing

### Prerequisite

Make sure you have Rust and the Soroban target installed:

```bash
rustup target add wasm32-unknown-unknown
```

### Build Contract

Compile the smart contract into optimized WASM bytecodes:

```bash
cargo build --target wasm32-unknown-unknown --release
```

### Run Tests

To test the contract implementation:

```bash
cargo test
```

### Deploy to Stellar Testnet

Deploy your optimized contract binary to the Stellar testnet:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/milestone_escrow.wasm \
  --source-account my-secret-key \
  --network testnet
```
