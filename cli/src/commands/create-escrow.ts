import { Command } from 'commander';
import ora from 'ora';
import { printError } from '../utils/display.js';

// TODO(issue): #M6 — Implement create-escrow CLI command
export function registerCreateEscrow(program: Command) {
  program
    .command('create-escrow')
    .description('Create a multi-milestone escrow vault on-chain')
    .requiredOption('-r, --recipient <address>', 'Stellar address of the recipient')
    .requiredOption('-t, --token <address>', 'Asset/token contract ID (C-address)')
    .requiredOption('-m, --milestones <json>', 'JSON array of milestone objects: [{title,amount}]')
    .action(async (opts) => {
      const spinner = ora('Building create-escrow transaction…').start();
      try {
        // TODO(issue): #M6 — Parse milestones JSON, load config, call escrow.createEscrow()
        spinner.stop();
        printError('create-escrow not implemented — see issue #M6');
      } catch (err: any) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
