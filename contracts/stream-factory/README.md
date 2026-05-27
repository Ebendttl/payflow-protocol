# Stream Factory Soroban Contract (`stream-factory`)

This contract acts as the primary registry and directory for the PayFlow Protocol. It stores registered contract addresses for both `StreamVault` and `MilestoneEscrow` contracts, and handles delegation queries.

## Features
- Registry for contract addresses
- Admin-only updates of contract addresses
- Queryable sender registries of active stream and escrow contracts via delegation

## API Interface
Refer to `src/lib.rs` for the full trait definition:
- `init(admin, stream_vault_id, milestone_escrow_id)`
- `get_stream_vault()`
- `get_milestone_escrow()`
- `list_all_stream_ids(sender)`
- `update_stream_vault(new_address)`
- `update_milestone_escrow(new_address)`

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
  --wasm target/wasm32-unknown-unknown/release/stream_factory.wasm \
  --source-account my-secret-key \
  --network testnet
```
