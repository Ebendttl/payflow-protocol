// TODO(issue): #H5 — Implement upsertStream, upsertEscrow, getStreamsBySender,
// getEscrowsBySender, getStreamById, getEscrowById using Drizzle ORM query builder

import { eq } from 'drizzle-orm';
import { streams, escrows, milestones } from './schema.js';

type AnyDB = {
  select: () => any;
  insert: (table: any) => any;
  update: (table: any) => any;
};

// ─── Streams ────────────────────────────────────────────────────────────────

export async function upsertStream(db: AnyDB, stream: typeof streams.$inferInsert) {
  // TODO(issue): #H5 — Use Drizzle .insert().onConflictDoUpdate() to upsert stream record
  throw new Error('not implemented — see issue #H5');
}

export async function getStreamById(db: AnyDB, id: string) {
  // TODO(issue): #H5 — Return db.select().from(streams).where(eq(streams.id, id))
  throw new Error('not implemented — see issue #H5');
}

export async function getStreamsBySender(db: AnyDB, sender: string) {
  // TODO(issue): #H5 — Return db.select().from(streams).where(eq(streams.sender, sender))
  throw new Error('not implemented — see issue #H5');
}

// ─── Escrows ────────────────────────────────────────────────────────────────

export async function upsertEscrow(db: AnyDB, escrow: typeof escrows.$inferInsert) {
  // TODO(issue): #H5 — Use Drizzle .insert().onConflictDoUpdate() for escrow record
  throw new Error('not implemented — see issue #H5');
}

export async function getEscrowById(db: AnyDB, id: string) {
  // TODO(issue): #H5 — Return db.select().from(escrows).where(eq(escrows.id, id))
  throw new Error('not implemented — see issue #H5');
}

export async function getEscrowsBySender(db: AnyDB, sender: string) {
  // TODO(issue): #H5 — Return db.select().from(escrows).where(eq(escrows.sender, sender))
  throw new Error('not implemented — see issue #H5');
}

// ─── Milestones ─────────────────────────────────────────────────────────────

export async function upsertMilestone(db: AnyDB, milestone: typeof milestones.$inferInsert) {
  // TODO(issue): #H5 — Upsert milestone row; increment approval_count on conflict
  throw new Error('not implemented — see issue #H5');
}

export async function getMilestonesForEscrow(db: AnyDB, escrowId: string) {
  // TODO(issue): #H5 — Return all milestones for a given escrowId ordered by index ASC
  throw new Error('not implemented — see issue #H5');
}
