import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export function registerCreateEscrow(program: Command) {
  program
    .command('create-escrow')
    .description('Initialize a milestone-gated escrow vault')
    .requiredOption('-r, --recipient <address>', 'Stellar address of the recipient')
    .requiredOption('-t, --token <address>', 'Asset token contract ID')
    .requiredOption('-m, --milestones <json>', 'JSON array of milestones [{title, amount}]')
    .requiredOption('-a, --approvers <list>', 'Comma-separated list of approver addresses')
    .requiredOption('-th, --threshold <number>', 'Number of approvals needed to release')
    .action(async (options) => {
      const spinner = ora('Validating params and deploying escrow...').start();
      try {
        const config = loadConfig();
        // TODO(issue): #70 — Parse parameters, call SDK escrow.create, sign with config secret key, and submit.
        await new Promise(resolve => setTimeout(resolve, 1500));
        spinner.succeed(chalk.green(`Escrow created successfully!`));
      } catch (err: any) {
        spinner.fail(chalk.red(`Failed to create escrow: ${err.message}`));
      }
    });
}
