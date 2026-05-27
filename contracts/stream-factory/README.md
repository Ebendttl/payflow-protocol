# Stream Factory Soroban Contract (`stream-factory`)

This contract acts as the primary registry and deployer for the PayFlow Protocol. It stores registered WASM hashes for both `StreamVault` and `MilestoneEscrow` contracts, and handles dynamic on-chain deployment.

## Features
- Registry for versioned WASM hashes
- Instantiation of new `StreamVault` contracts
- Instantiation of new `MilestoneEscrow` contracts
- Queryable sender registries of active stream and escrow contracts

## API Interface
Refer to `src/lib.rs` for the full trait definition:
- `initialize(vault_wasm_hash, escrow_wasm_hash)`
- `deploy_stream_vault(sender, recipient, token, total_amount, duration_seconds)`
- `deploy_milestone_escrow(sender, recipient, token, total_amount, milestones_titles, milestones_amounts, approvers, threshold)`
- `list_streams_by_sender(sender)`

## Run Tests
To test the stubbed contract implementation:
```bash
cargo test
```
