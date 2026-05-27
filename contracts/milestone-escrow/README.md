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

## Run Tests
To test the stubbed contract implementation:
```bash
cargo test
```
