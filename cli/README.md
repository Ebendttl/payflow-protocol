# PayFlow developer CLI (`payflow`)

The developer CLI tool for managing PayFlow payment streams, escrows, and milestone releases directly from the terminal.

## Installation

```bash
pnpm install
pnpm --filter payflow-cli build
pnpm link --global
```

## Configuration

The CLI reads wallet and contract info from `~/.payflow/config.json`. If this file doesn't exist, it will use a mock testing configuration pointing to Testnet.

To configure your secret key:
Create a file at `~/.payflow/config.json`:
```json
{
  "network": "testnet",
  "secretKey": "SDA...",
  "contractIds": {
    "streamVault": "CD...",
    "milestoneEscrow": "CB...",
    "streamFactory": "CC..."
  }
}
```

## Available Commands

- `payflow create-stream --recipient <address> --token <address> --amount <amount> --duration <seconds>`
- `payflow cancel-stream --stream-id <id>`
- `payflow claim-stream --stream-id <id>`
- `payflow create-escrow --recipient <address> --token <address> --milestones <json> --approvers <list> --threshold <number>`
- `payflow approve-milestone --escrow-id <id> --index <number>`
