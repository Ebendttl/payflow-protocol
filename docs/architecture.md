# PayFlow Protocol: System Architecture & Data Flow

This document provides a deep architectural breakdown of the PayFlow Protocol—a decentralized payment streaming and milestone-gated disbursement platform native to Stellar's Soroban smart contract ecosystem.

---

## 1. System Topology Overview

PayFlow utilizes a hybrid decentralized topology, combining the robust settlement guarantees of on-chain Soroban contracts with a high-performance event-driven indexer to power a responsive Next.js frontend and a developer CLI.

```mermaid
graph TD
    %% Users and Interfaces
    Client([User Interface / CLI]) -->|Freighter / Secret Key| WebApp[Next.js App / SDK]
    
    %% On-Chain Layer
    WebApp -->|XDR Transaction Envelopes| Soroban[Soroban Engine / Horizon]
    Soroban -->|Ledger State Updates| StellarLedger[(Stellar Blockchain)]
    
    %% Indexing Layer
    Indexer[Event Indexer Engine] -->|Continuous Polling| Soroban
    Indexer -->|Write Synced State| LocalDB[(SQLite / Postgres DB)]
    
    %% API Feedback
    LocalDB -->|Data Reads| REST_API[Indexer REST API]
    REST_API -->|Read-Only Queries| WebApp
```

---

## 2. On-Chain Contracts (`/contracts`)

The protocol core logic is implemented across three discrete, modular smart contracts:

```mermaid
classDiagram
    class StreamFactory {
        +deploy_stream_vault(sender, recipient, token, amount, duration) Address
        +deploy_milestone_escrow(sender, recipient, token, threshold, approvers, milestones) Address
    }
    class StreamVault {
        +claim(stream_id) i128
        +pause(stream_id) void
        +resume(stream_id) void
        +cancel(stream_id) i128
    }
    class MilestoneEscrow {
        +approve_milestone(escrow_id, index) void
        +cancel_escrow(escrow_id) i128
    }
    StreamFactory ..> StreamVault : deploys
    StreamFactory ..> MilestoneEscrow : deploys
```

### StreamVault
Manages the lifecycle of continuous token payment flows. Senders lock the total balance up front, which the recipient can claim continuously down to the second. Supports pause, resume, and cancellation events.

### MilestoneEscrow
A multi-milestone locked token vault. Disbursing funds requires a multi-sig quorum approval from a list of authorized addresses. Senders can reclaim unreleased funds if the escrow is cancelled before completion.

### StreamFactory
A lightweight registry/factory contract used to deploy and register verified instances of `StreamVault` and `MilestoneEscrow` dynamically, reducing gas deployment costs for users.

---

## 3. Off-Chain Indexing & Database Sync (`/packages/indexer`)

To provide instant load times and filterable historical charts, the indexer polls the Stellar Horizon API for events emitted by verified PayFlow contract IDs:

```mermaid
sequenceDiagram
    participant Ledger as Stellar Ledger
    participant Indexer as Event Indexer
    participant DB as Drizzle SQLite/PG
    
    loop Every 5 seconds
        Indexer->>Ledger: Poll transaction events (filtered by contract ID)
        Ledger-->>Indexer: Return array of emitted events
    end
    
    alt Event: StreamCreated
        Indexer->>DB: Insert new stream record (status: Active)
    else Event: Claimed
        Indexer->>DB: Increment claimed_amount & update last_updated
    else Event: Paused / Resumed
        Indexer->>DB: Toggle stream state & shift duration calculations
    end
```

### Relational Database Schema (`src/db/schema.ts`)
1. **streams**: Stores `id`, `sender`, `recipient`, `token`, `total_amount`, `claimed_amount`, `start_time`, `end_time`, `status`, and `last_updated_timestamp`.
2. **escrows**: Stores `id`, `sender`, `recipient`, `token`, `total_amount`, `threshold`, `approvers` (as serialized array), and `cancelled` boolean status.
3. **milestones**: Linked to `escrows` via 1-to-many relationship, tracking `title`, `amount`, `released` status, and `approvals` array.

---

## 4. Front-End State Management (`/apps/web`)

The Next.js 14 frontend uses Zustand to store global wallet address state and integrates requestAnimationFrame for real-time progress calculations:

```mermaid
graph LR
    Sub[Freighter API Subscription] -->|Address Changes| Store[Zustand WalletStore]
    Store -->|Hydrate UI| ConnectBtn[WalletButton]
    Store -->|Authorize Transactions| TxBuilder[SDK / Freighter Transactor]
```

### High-Frequency Progress Loops
To achieve buttery-smooth streaming progress displays without overloading React's render cycles, `StreamCard` utilizes an off-screen ticker powered by `requestAnimationFrame`. The component reads the static stream start/end times and updates the DOM progress bar and counter directly at 60 FPS.

