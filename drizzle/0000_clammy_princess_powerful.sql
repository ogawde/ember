CREATE TYPE "public"."alert_status" AS ENUM('open', 'acknowledged', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."channel_type" AS ENUM('public', 'private', 'dm', 'group_dm');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('normal', 'watch', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."signal_type" AS ENUM('sentiment_drift', 'after_hours', 'channel_exclusion', 'response_drop');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"severity" "risk_level" NOT NULL,
	"signals" text[] NOT NULL,
	"status" "alert_status" DEFAULT 'open',
	"evidence_count" integer DEFAULT 0,
	"fired_at" timestamp DEFAULT now(),
	"acknowledged_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_workspace_id" text NOT NULL,
	"workspace_name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "orgs_slack_workspace_id_unique" UNIQUE("slack_workspace_id")
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"slack_user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"department" text,
	"manager_id" uuid,
	"risk_score" numeric(4, 2) DEFAULT '0',
	"risk_level" "risk_level" DEFAULT 'normal',
	"last_scored_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"interaction_count" integer DEFAULT 0,
	"avg_sentiment" numeric(4, 3) DEFAULT '0',
	"sentiment_trend" text DEFAULT 'stable',
	"risk_score" numeric(4, 2) DEFAULT '0',
	"risk_level" "risk_level" DEFAULT 'normal',
	"power_delta" integer DEFAULT 0,
	"after_hours_count" integer DEFAULT 0,
	"response_rate" numeric(4, 3) DEFAULT '1',
	"last_interaction_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_actor_id_persons_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_target_id_persons_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;