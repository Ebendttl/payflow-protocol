import chalk from 'chalk';
import type { Stream, Escrow } from '@payflow/sdk';

// ─── Generic helpers ──────────────────────────────────────────────────────────

export function printSuccess(msg: string): void {
  console.log(chalk.green('✔ ') + chalk.white(msg));
}

export function printError(msg: string): void {
  console.error(chalk.red('✖ ') + chalk.white(msg));
}

export function printTable(headers: string[], rows: string[][]): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length))
  );
  const divider = widths.map((w) => '─'.repeat(w + 2)).join('┼');
  const fmt = (cells: string[], bold = false) =>
    cells.map((c, i) => {
      const cell = c.padEnd(widths[i]);
      return bold ? chalk.cyan.bold(` ${cell} `) : chalk.white(` ${cell} `);
    }).join(chalk.dim('│'));

  console.log(chalk.dim('┌' + divider + '┐'));
  console.log(chalk.dim('│') + fmt(headers, true) + chalk.dim('│'));
  console.log(chalk.dim('├' + divider + '┤'));
  rows.forEach((r) => console.log(chalk.dim('│') + fmt(r) + chalk.dim('│')));
  console.log(chalk.dim('└' + divider + '┘'));
}

// ─── Domain printers ──────────────────────────────────────────────────────────

export function printStream(stream: Stream): void {
  console.log('');
  console.log(chalk.cyan.bold('Stream') + chalk.dim(` #${stream.id}`));
  console.log(chalk.dim('  Sender    : ') + chalk.white(stream.sender));
  console.log(chalk.dim('  Recipient : ') + chalk.white(stream.recipient));
  console.log(chalk.dim('  Token     : ') + chalk.yellow(stream.token));
  console.log(chalk.dim('  Amount    : ') + chalk.white(`${Number(stream.totalAmount) / 1e7} (total)`));
  console.log(chalk.dim('  Claimed   : ') + chalk.white(`${Number(stream.claimedAmount) / 1e7}`));

  const statusColor =
    stream.status === 'Active'    ? chalk.green  :
    stream.status === 'Paused'    ? chalk.yellow :
    stream.status === 'Completed' ? chalk.blue   : chalk.red;

  console.log(chalk.dim('  Status    : ') + statusColor(stream.status));
  console.log('');
}

export function printEscrow(escrow: Escrow): void {
  console.log('');
  console.log(chalk.magenta.bold('Escrow') + chalk.dim(` #${escrow.id}`));
  console.log(chalk.dim('  Sender     : ') + chalk.white(escrow.sender));
  console.log(chalk.dim('  Recipient  : ') + chalk.white(escrow.recipient));
  console.log(chalk.dim('  Total      : ') + chalk.white(`${Number(escrow.totalAmount) / 1e7}`));
  console.log(chalk.dim('  Milestones : ') + chalk.white(escrow.milestones.length));
  console.log(chalk.dim('  Threshold  : ') + chalk.white(`${escrow.threshold} of ${escrow.approvers.length} approvers`));

  const statusColor =
    escrow.status === 'Active'    ? chalk.green :
    escrow.status === 'Completed' ? chalk.blue  : chalk.red;

  console.log(chalk.dim('  Status     : ') + statusColor(escrow.status));

  escrow.milestones.forEach((m, i) => {
    const mColor = m.status === 'Released' ? chalk.green : m.status === 'Approved' ? chalk.yellow : chalk.dim;
    console.log(`    ${chalk.dim(`[${i + 1}]`)} ${chalk.white(m.title)} — ${mColor(m.status)}`);
  });
  console.log('');
}
