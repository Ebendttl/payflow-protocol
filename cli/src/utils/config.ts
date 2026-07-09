import fs from 'fs';
import path from 'path';
import os from 'os';

export interface CLIConfig {
  network: 'testnet' | 'mainnet';
  /** WARNING: never log or print this value */
  secretKey: string;
  contractIds: {
    streamVault: string;
    milestoneEscrow: string;
    streamFactory: string;
  };
}

const CONFIG_DIR = path.join(os.homedir(), '.payflow');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const DEFAULTS: CLIConfig = {
  network: 'testnet',
  secretKey: '',
  contractIds: {
    streamVault: '',
    milestoneEscrow: '',
    streamFactory: '',
  },
};

/** Loads ~/.payflow/config.json, falling back to empty defaults. */
export function loadConfig(): CLIConfig {
  if (!fs.existsSync(CONFIG_PATH)) return { ...DEFAULTS };
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as CLIConfig;
  } catch {
    return { ...DEFAULTS };
  }
}

/** Persists config to ~/.payflow/config.json, creating the dir if necessary. */
export function saveConfig(config: CLIConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

/** Convenience helper that returns only the contractIds section. */
export function getContractIds(): CLIConfig['contractIds'] {
  return loadConfig().contractIds;
}
