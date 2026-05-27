#!/usr/bin/env node

import { Command } from 'commander';
import { registerCreateStream } from './commands/create-stream.js';
import { registerCancelStream } from './commands/cancel-stream.js';
import { registerClaimStream } from './commands/claim.js';
import { registerCreateEscrow } from './commands/create-escrow.js';
import { registerApproveMilestone } from './commands/approve-milestone.js';

const program = new Command();

program
  .name('payflow')
  .description('PayFlow Protocol developer command line interface')
  .version('1.0.0');

// Register commands
registerCreateStream(program);
registerCancelStream(program);
registerClaimStream(program);
registerCreateEscrow(program);
registerApproveMilestone(program);

program.parse(process.argv);
