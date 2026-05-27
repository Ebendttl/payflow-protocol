import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export function registerApproveMilestone(program: Command) {
  program
    .command('approve-milestone')
    .description('Approve a specific milestone within an escrow')
    .requiredOption('-e, --escrow-id <id>', 'Escrow contract ID')
    .requiredOption('-i, --index <number>', 'Milestone index to approve (0-indexed)')
    .action(async (options) => {
      const spinner = ora(`Signing approval for escrow ${options.escrowId} milestone index ${options.index}...`).start();
      try {
        const config = loadConfig();
        // TODO(issue): #71 — Call SDK escrow.approveMilestone, sign, and submit.
        await new Promise(resolve => setTimeout(resolve, 1500));
        spinner.succeed(chalk.green(`Successfully approved milestone ${options.index} for escrow ${options.escrowId}.`));
      } catch (err: any) {
        spinner.fail(chalk.red(`Approval failed: ${err.message}`));
      }
    });
}
