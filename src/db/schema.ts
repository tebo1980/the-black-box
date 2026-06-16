import { pgTable, uuid, timestamp, varchar, text, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const vaultTypeEnum = pgEnum('vault_type', ['WORKER', 'GIG_WORKER', 'TENANT', 'HOA', 'AUTO', 'MEDICAL']);
export const statusEnum = pgEnum('status', ['ACTIVE', 'RETALIATION_ALARM', 'RESOLVED']);

// User Account Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// The Unified Flight Ledger
export const incidentLogs = pgTable('incident_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  // Vault Selection Routing Engine
  vaultType: vaultTypeEnum('vault_type').notNull(),

  // Encrypted & Telemetry Data
  geoCoordinates: varchar('geo_coordinates', { length: 100 }),
  deviceTimestamp: timestamp('device_timestamp').notNull(),

  // Raw Data Payloads
  rawTranscript: text('raw_transcript'),
  metadataPayload: jsonb('metadata_payload'), // Stores S3/Vercel Blob Storage URLs, parsed receipts, or document context

  // Dispute Flow Trackers
  status: statusEnum('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Local Statutory Framework Cache
export const legalCache = pgTable('legal_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  jurisdiction: varchar('jurisdiction', { length: 50 }).notNull(), // e.g., 'IN', 'KY', 'FEDERAL'
  statuteCode: varchar('statute_code', { length: 100 }).notNull(), // e.g., 'IN_HB_1435', 'IN_HB_1115'
  statuteTitle: varchar('statute_title', { length: 255 }).notNull(),
  fullText: text('full_text').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
