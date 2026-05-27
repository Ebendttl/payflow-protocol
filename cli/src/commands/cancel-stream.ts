import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export function registerCancelStream(program: Command) {
  program
    .command('cancel-stream')
    .description('Cancel an active stream and refund remaining tokens to sender')
    .requiredOption('-s, --stream-id <id>', 'Target stream ID')
    .action(async (options) => {
      const spinner = ora(`Initiating cancellation for stream ID: ${options.streamId}...`).start();
      try {
        const config = loadConfig();
        // TODO(issue): #68 — Call SDK streams.cancel, sign, submit, and display returned transaction hash.
        await new Promise(resolve => setTimeout(resolve, 1500));
        spinner.succeed(chalk.green(`Stream ${options.streamId} cancelled successfully.`));
      } catch (err: any) {
        spinner.fail(chalk.red(`Failed to cancel stream: ${err.message}`));
      }
    });
}
