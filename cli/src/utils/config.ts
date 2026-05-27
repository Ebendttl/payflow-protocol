import fs from 'fs';
import path from 'path';
import os from 'os';

export interface CLIConfig {
  network: 'testnet' | 'mainnet';
  secretKey: string;
  contractIds: {
    streamVault: string;
    milestoneEscrow: string;
    streamFactory: string;
  };
}

const CONFIG_PATH = path.join(os.homedir(), '.payflow', 'config.json');

export function loadConfig(): CLIConfig {
  // TODO(issue): #65 — Read configuration from CONFIG_PATH file, parsing the JSON. Return default or error if not found.
  if (!fs.existsSync(CONFIG_PATH)) {
    // Return mock configuration for setup purposes
    return {
      network: 'testnet',
      secretKey: 'SDA...',
      contractIds: {
        streamVault: 'CDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        milestoneEscrow: 'CBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        streamFactory: 'CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      }
    };
  }
  const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

export function saveConfig(config: CLIConfig): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
