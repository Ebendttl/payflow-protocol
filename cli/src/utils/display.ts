import chalk from 'chalk';

export function displayStreamTable(streams: any[]) {
  // TODO(issue): #66 — Print streams in an ascii table format using chalk highlighting for statuses.
  console.log(chalk.bold.teal("\n=== Active Streams ==="));
  streams.forEach(s => {
    const statusColor = s.status === 'Active' ? chalk.green : chalk.yellow;
    console.log(
      `ID: ${chalk.cyan(s.id)} | Recipient: ${chalk.gray(s.recipient)} | ` +
      `Amount: ${chalk.white(s.amount)} | Status: ${statusColor(s.status)}`
    );
  });
  console.log("");
}

export function displayEscrowTable(escrows: any[]) {
  console.log(chalk.bold.violet("\n=== Active Escrows ==="));
  escrows.forEach(e => {
    console.log(
      `ID: ${chalk.cyan(e.id)} | Recipient: ${chalk.gray(e.recipient)} | ` +
      `Total: ${chalk.white(e.total)} | Milestones: ${chalk.white(e.milestoneCount)}`
    );
  });
  console.log("");
}
