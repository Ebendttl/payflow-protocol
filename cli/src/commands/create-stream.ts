import { Command } from 'commander';
import ora from 'ora';
import { printError, printSuccess } from '../utils/display.js';

// TODO(issue): #M6 — Implement create-stream CLI command
export function registerCreateStream(program: Command) {
  program
    .command('create-stream')
    .description('Create a new real-time token payment stream on-chain')
    .requiredOption('-r, --recipient <address>', 'Stellar address of the stream recipient')
    .requiredOption('-t, --token <address>',     'Asset/token contract ID (C-address)')
    .requiredOption('-a, --amount <number>',     'Total stream amount in base units')
    .requiredOption('-d, --duration-days <days>','Stream duration in days')
    .action(async (opts) => {
      const spinner = ora('Building create-stream transaction…').start();
      try {
        // TODO(issue): #M6 — Load config, instantiate PayFlowClient with secret key,
        // call streams.createStream(), sign and submit to network.
        spinner.stop();
        printError('create-stream not implemented — see issue #M6');
      } catch (err: any) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
