import { streams, escrows, milestones } from './schema.js';

export interface DBClient {
  select: any;
  insert: any;
  update: any;
}

export async function upsertStream(db: any, stream: typeof streams.$inferInsert) {
  // TODO(issue): #35 — Implement SQLite upsert logic for streams table using Drizzle ORM.
  throw new Error("not implemented");
}

export async function getStreamById(db: any, id: string) {
  // TODO(issue): #36 — Retrieve a single stream by primary key id.
  throw new Error("not implemented");
}

export async function getStreamsBySender(db: any, sender: string) {
  // TODO(issue): #37 — Query all streams where sender matches, ordered by last_updated descending.
  throw new Error("not implemented");
}

export async function upsertEscrow(db: any, escrow: typeof escrows.$inferInsert) {
  // TODO(issue): #38 — Implement SQLite upsert logic for escrows.
  throw new Error("not implemented");
}

export async function getEscrowById(db: any, id: string) {
  // TODO(issue): #39 — Query single escrow by id.
  throw new Error("not implemented");
}

export async function getEscrowsBySender(db: any, sender: string) {
  // TODO(issue): #40 — Query all escrows where sender matches.
  throw new Error("not implemented");
}

export async function upsertMilestone(db: any, milestone: typeof milestones.$inferInsert) {
  // TODO(issue): #41 — Implement SQLite upsert logic for milestones.
  throw new Error("not implemented");
}

export async function getMilestonesForEscrow(db: any, escrowId: string) {
  // TODO(issue): #42 — Query all milestones associated with an escrowId, ordered by milestone index.
  throw new Error("not implemented");
}
