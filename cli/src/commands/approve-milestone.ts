import { Command } from 'commander';
import ora from 'ora';
import { printError } from '../utils/display.js';

// TODO(issue): #M6 — Implement approve-milestone CLI command
export function registerApproveMilestone(program: Command) {
  program
    .command('approve-milestone')
    .description('Approve a specific milestone inside an escrow (approver only)')
    .requiredOption('-e, --escrow-id <id>', 'Numeric ID of the escrow')
    .requiredOption('-i, --milestone-index <index>', 'Zero-based index of the milestone to approve')
    .action(async (opts) => {
      const spinner = ora(
        `Approving milestone #${opts.milestoneIndex} in escrow #${opts.escrowId}…`
      ).start();
      try {
        // TODO(issue): #M6 — Call escrow.approveMilestone({ escrowId, milestoneIndex, approver })
        spinner.stop();
        printError('approve-milestone not implemented — see issue #M6');
      } catch (err: any) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
