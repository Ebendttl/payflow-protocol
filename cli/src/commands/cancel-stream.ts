import { Command } from 'commander';
import ora from 'ora';
import { printError } from '../utils/display.js';

// TODO(issue): #M6 — Implement cancel-stream CLI command
export function registerCancelStream(program: Command) {
  program
    .command('cancel-stream')
    .description('Cancel an active stream and refund unaccrued funds to the sender')
    .requiredOption('-s, --stream-id <id>', 'Numeric ID of the stream to cancel')
    .action(async (opts) => {
      const spinner = ora(`Cancelling stream #${opts.streamId}…`).start();
      try {
        // TODO(issue): #M6 — Call streams.cancelStream({ streamId: BigInt(opts.streamId) })
        spinner.stop();
        printError('cancel-stream not implemented — see issue #M6');
      } catch (err: any) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
