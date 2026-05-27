import { Command } from 'commander';
import ora from 'ora';
import { printError } from '../utils/display.js';

// TODO(issue): #M6 — Implement claim CLI command
export function registerClaimStream(program: Command) {
  program
    .command('claim')
    .description('Claim accrued tokens from a stream (recipient only)')
    .requiredOption('-s, --stream-id <id>', 'Numeric ID of the stream to claim from')
    .action(async (opts) => {
      const spinner = ora(`Claiming from stream #${opts.streamId}…`).start();
      try {
        // TODO(issue): #M6 — Call streams.claim({ streamId: BigInt(opts.streamId) })
        spinner.stop();
        printError('claim not implemented — see issue #M6');
      } catch (err: any) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
