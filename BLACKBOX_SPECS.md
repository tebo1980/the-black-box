# SYSTEM SPECIFICATION: THE BLACK BOX PLATFORM (MVP)

## 1. Core Architecture Blueprint
The Black Box is a highly secure, serverless personal flight recorder application. It allows users to log immutable, timestamped event telemetry, audio transcripts, and documents to protect against corporate, employment, landlord, and institutional exploitation.

### Core Stack Requirements:
- **Backend/Database:** Vercel Neon (Serverless Postgres).
- **Database Modeling & Migrations:** Drizzle ORM (TypeScript) leveraging `@neondatabase/serverless`.
- **Hosting & API Routing:** Vercel (Next.js Serverless Route Endpoints).
- **Core AI Intelligence:** Gemini 2.5 Flash-Lite (low-cost background logging/transcribing) and Gemini 3.1 Pro (complex legal reasoning & report generation utilizing Context Caching).

---

## 2. Multi-Vault Database Schema (Drizzle ORM via Neon Postgres)
All incident types funnel into a single-engine database table but are segregated logically by the `vault_type` parameter.

```typescript
import { pgTable, uuid, timestamp, varchar, text, jsonb } from 'drizzle-orm/pg-core';

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
  vaultType: varchar('vault_type', { length: 50 }).notNull(), // 'WORKER', 'GIG_WORKER', 'TENANT', 'HOA', 'AUTO', 'MEDICAL'
  
  // Encrypted & Telemetry Data
  geoCoordinates: varchar('geo_coordinates', { length: 100 }),
  deviceTimestamp: timestamp('device_timestamp').notNull(),
  
  // Raw Data Payloads
  rawTranscript: text('raw_transcript'),
  metadataPayload: jsonb('metadata_payload'), // Stores S3/Vercel Blob Storage URLs, parsed receipts, or document context
  
  // Dispute Flow Trackers
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(), // 'ACTIVE', 'RETALIATION_ALARM', 'RESOLVED'
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
```

3. The 6 Vertical Protective Shields (Rules Engine)
🏢 A. Tenant Shield
Target Law: Indiana HB 1435 (Effective July 1, 2026). Landlords must address essential system failures (HVAC, plumbing, electrical) within 24 hours of written notice and complete repairs within 72 hours. Failure triggers rights to execute legal court escrow under IC § 32-31-8-5.5. Kentucky KRS § 383.625 allows a 14-day statutory fix clock under URLTA.

Engine Logic: Identify reported_at timestamp. Track a live countdown clock against the state jurisdiction. Re-opening a ticket within 14 days automatically escalates status to RETALIATION_ALARM for "Willful Failure to Maintain Habitability."

🏡 B. HOA Shield
Target Law: Indiana HB 1115 / HB 1152 (Effective July 1, 2026). HOA boards must issue a specific, board-approved schedule of fines and give 4 days of written notice before meetings.

Engine Logic: Processes uploaded violation notices. Parses metadata-locked photos taken by the user of surrounding homes to compile a "Selective Enforcement Comparative Ledger" to neutralize arbitrary neighborhood association fines in small claims.

💼 C. Worker Shield (W2)
Target Law: FLSA, OSHA, and National Labor Relations Act (NLRA) frameworks regarding protected concerted activities.

Engine Logic: Combats "At-Will" employment retaliation by documenting a continuous "Comparative Performance Ledger." Tracks performance baselines so if an employer attempts a retaliatory firing shortly after a safety/wage complaint under a false pretext (e.g., "was 5 minutes late"), the system proves selective enforcement.

🚗 D. Gig Worker Shield
Target Law: Independent contractor platform agreements and regional delivery protections.

Engine Logic: Tracks continuous background GPS telemetry overlays, fare screenshots, and gig acceptance cards. Automatically generates an immutable delivery packet to counter algorithmic deactivations caused by fraudulent "order not received" customer reports.

🚘 E. Auto Shield
Target Law: Magnuson-Moss Warranty Act and federal "As-Is" consumer disclosures.

Engine Logic: Matches verbal salesperson promises (extracted via mobile audio logs) against scanned "As-Is" window stickers. Flags discrepancies immediately to warn user: "Verbal assertions are overridden by written As-Is clauses. Demand stipulations be written on the official Due Bill."

🏥 F. Medical Shield
Target Law: No Surprises Act and regional itemized hospital transparency acts.

Engine Logic: Ingests photos of itemized hospital statements, extracts CPT codes, parses hidden upcharges or double-billing cycles, and auto-compares them against localized Medicare/Medicaid baseline rates to generate debt dispute notifications.