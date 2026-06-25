import { pgTable, uuid, text, numeric, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const riskLevelEnum = pgEnum('risk_level', ['normal', 'watch', 'warning', 'critical'])
export const channelTypeEnum = pgEnum('channel_type', ['public', 'private', 'dm', 'group_dm'])
export const signalTypeEnum = pgEnum('signal_type', [
  'sentiment_drift',
  'after_hours',
  'channel_exclusion',
  'response_drop',
])
export const alertStatusEnum = pgEnum('alert_status', ['open', 'acknowledged', 'dismissed'])

export const orgs = pgTable('orgs', {
  id: uuid('id').primaryKey().defaultRandom(),
  slackWorkspaceId: text('slack_workspace_id').notNull().unique(),
  workspaceName: text('workspace_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const persons = pgTable('persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => orgs.id)
    .notNull(),
  slackUserId: text('slack_user_id').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  department: text('department'),
  managerId: uuid('manager_id'),
  riskScore: numeric('risk_score', { precision: 4, scale: 2 }).default('0'),
  riskLevel: riskLevelEnum('risk_level').default('normal'),
  lastScoredAt: timestamp('last_scored_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const relationships = pgTable('relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => orgs.id)
    .notNull(),
  actorId: uuid('actor_id')
    .references(() => persons.id)
    .notNull(),
  targetId: uuid('target_id')
    .references(() => persons.id)
    .notNull(),
  interactionCount: integer('interaction_count').default(0),
  avgSentiment: numeric('avg_sentiment', { precision: 4, scale: 3 }).default('0'),
  sentimentTrend: text('sentiment_trend').default('stable'),
  riskScore: numeric('risk_score', { precision: 4, scale: 2 }).default('0'),
  riskLevel: riskLevelEnum('risk_level').default('normal'),
  powerDelta: integer('power_delta').default(0),
  afterHoursCount: integer('after_hours_count').default(0),
  responseRate: numeric('response_rate', { precision: 4, scale: 3 }).default('1'),
  lastInteractionAt: timestamp('last_interaction_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => orgs.id)
    .notNull(),
  personId: uuid('person_id')
    .references(() => persons.id)
    .notNull(),
  severity: riskLevelEnum('severity').notNull(),
  signals: text('signals').array().notNull(),
  status: alertStatusEnum('status').default('open'),
  evidenceCount: integer('evidence_count').default(0),
  firedAt: timestamp('fired_at').defaultNow(),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedAt: timestamp('resolved_at'),
})
