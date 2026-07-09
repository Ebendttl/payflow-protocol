# Soroban Smart Contract Specifications

This document outlines the detailed interfaces, structs, and events for the Soroban smart contracts.

## 1. StreamVault Contract

### Data Structs

```rust
#[contracttype]
pub enum StreamStatus {
    Active,
    Paused,
    Cancelled,
}

#[contracttype]
pub struct Stream {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub claimed_amount: i128,
    pub status: StreamStatus,
    pub pause_start_time: u64, // 0 if not paused
}
```

### Events

- `StreamCreated(stream_id, sender, recipient, amount)`
- `Claimed(stream_id, recipient, amount)`
- `Cancelled(stream_id, refunded_amount)`
- `Paused(stream_id)`
- `Resumed(stream_id)`

---

## 2. MilestoneEscrow Contract

### Data Structs

```rust
#[contracttype]
pub struct Milestone {
    pub title: String,
    pub amount: i128,
    pub approvals: Vec<Address>,
    pub released: bool,
}

#[contracttype]
pub struct Escrow {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub threshold: u32,
    pub approvers: Vec<Address>,
    pub milestones: Vec<Milestone>,
    pub cancelled: bool,
}
```

### Events

- `EscrowCreated(escrow_id, sender, recipient, amount)`
- `MilestoneApproved(escrow_id, milestone_index, approver)`
- `MilestoneReleased(escrow_id, milestone_index, amount)`
- `EscrowCancelled(escrow_id, refunded_amount)`
