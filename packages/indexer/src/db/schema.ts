import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const streams = sqliteTable('streams', {
  id:            text('id').primaryKey(),          // "{contract_address}:{stream_id}"
  sender:        text('sender').notNull(),
  recipient:     text('recipient').notNull(),
  token:         text('token').notNull(),
  totalAmount:   text('total_amount').notNull(),   // stored as string to preserve i128 precision
  claimedAmount: text('claimed_amount').notNull(),
  startTime:     integer('start_time').notNull(),
  endTime:       integer('end_time').notNull(),
  status:        text('status').notNull(),         // 'Active' | 'Paused' | 'Cancelled' | 'Completed'
  lastUpdated:   integer('last_updated').notNull(),
});

export const escrows = sqliteTable('escrows', {
  id:             text('id').primaryKey(),          // "{contract_address}:{escrow_id}"
  sender:         text('sender').notNull(),
  recipient:      text('recipient').notNull(),
  token:          text('token').notNull(),
  totalAmount:    text('total_amount').notNull(),
  milestoneCount: integer('milestone_count').notNull(),
  status:         text('status').notNull(),         // 'Active' | 'Cancelled' | 'Completed'
  lastUpdated:    integer('last_updated').notNull(),
});

// TODO(issue): #H5 — Add milestones table and approval tracking
export const milestones = sqliteTable('milestones', {
  id:            text('id').primaryKey(),   // "{escrow_id}:{milestone_index}"
  escrowId:      text('escrow_id').notNull(),
  index:         integer('index').notNull(),
  title:         text('title').notNull(),
  amount:        text('amount').notNull(),
  approvalCount: integer('approval_count').notNull().default(0),
  status:        text('status').notNull().default('Pending'), // 'Pending' | 'Approved' | 'Released'
});
