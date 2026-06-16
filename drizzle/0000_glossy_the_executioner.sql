CREATE TYPE "public"."status" AS ENUM('ACTIVE', 'RETALIATION_ALARM', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."vault_type" AS ENUM('WORKER', 'GIG_WORKER', 'TENANT', 'HOA', 'AUTO', 'MEDICAL');--> statement-breakpoint
CREATE TABLE "incident_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vault_type" "vault_type" NOT NULL,
	"geo_coordinates" varchar(100),
	"device_timestamp" timestamp NOT NULL,
	"raw_transcript" text,
	"metadata_payload" jsonb,
	"status" "status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction" varchar(50) NOT NULL,
	"statute_code" varchar(100) NOT NULL,
	"statute_title" varchar(255) NOT NULL,
	"full_text" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "incident_logs" ADD CONSTRAINT "incident_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;