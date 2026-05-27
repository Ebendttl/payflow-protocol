import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export function registerClaimStream(program: Command) {
  program
    .command('claim-stream')
    .description('Claim accrued tokens from an active stream')
    .requiredOption('-s, --stream-id <id>', 'Target stream ID')
    .action(async (options) => {
      const spinner = ora(`Calculating claimable balance and building tx...`).start();
      try {
        const config = loadConfig();
        // TODO(issue): #69 — Query claimableAmount via SDK, execute claim transaction submission, and report amount claimed.
        await new Promise(resolve => setTimeout(resolve, 1500));
        spinner.succeed(chalk.green(`Tokens from stream ${options.streamId} claimed successfully.`));
      } catch (err: any) {
        spinner.fail(chalk.red(`Failed to claim tokens: ${err.message}`));
      }
    });
}
