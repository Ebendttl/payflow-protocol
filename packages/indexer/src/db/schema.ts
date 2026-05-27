import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const streams = sqliteTable('streams', {
  id: text('id').primaryKey(), // "{contract_address}:{stream_id}"
  sender: text('sender').notNull(),
  recipient: text('recipient').notNull(),
  token: text('token').notNull(),
  totalAmount: text('total_amount').notNull(),
  claimedAmount: text('claimed_amount').notNull(),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  status: text('status').notNull(), // "Active" | "Paused" | "Cancelled"
  lastUpdated: integer('last_updated').notNull(),
});

export const escrows = sqliteTable('escrows', {
  id: text('id').primaryKey(), // "{contract_address}:{escrow_id}"
  sender: text('sender').notNull(),
  recipient: text('recipient').notNull(),
  token: text('token').notNull(),
  totalAmount: text('total_amount').notNull(),
  threshold: integer('threshold').notNull(),
  approvers: text('approvers').notNull(), // JSON array of addresses
  cancelled: integer('cancelled', { mode: 'boolean' }).notNull().default(false),
});

export const milestones = sqliteTable('milestones', {
  id: text('id').primaryKey(), // "{escrow_id}:{milestone_index}"
  escrowId: text('escrow_id').notNull(),
  index: integer('index').notNull(),
  title: text('title').notNull(),
  amount: text('amount').notNull(),
  approvals: text('approvals').notNull(), // JSON array of approver addresses
  released: integer('released', { mode: 'boolean' }).notNull().default(false),
});
