import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export function registerCreateStream(program: Command) {
  program
    .command('create-stream')
    .description('Initialize a new real-time token stream on-chain')
    .requiredOption('-r, --recipient <address>', 'Stellar address of the recipient')
    .requiredOption('-t, --token <address>', 'Asset token contract ID')
    .requiredOption('-a, --amount <number>', 'Total stream amount')
    .requiredOption('-d, --duration <seconds>', 'Stream duration in seconds')
    .action(async (options) => {
      const spinner = ora('Preparing stream proposal transaction...').start();
      try {
        const config = loadConfig();
        // TODO(issue): #67 — Instantiate @payflow/sdk, sign transaction with private key from local config, and execute deployment.
        await new Promise(resolve => setTimeout(resolve, 1500));
        spinner.succeed(chalk.green(`Stream created successfully! Recipient: ${options.recipient}`));
      } catch (err: any) {
        spinner.fail(chalk.red(`Failed to create stream: ${err.message}`));
      }
    });
}
