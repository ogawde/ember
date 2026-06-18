export type RiskLevel = 'critical' | 'warning' | 'watch' | 'normal'

export type SignalType = 'sentiment_drift' | 'after_hours' | 'channel_exclusion' | 'response_drop'

export interface Person {
  id: string
  name: string
  department: string
  managerId: string | null
  slackUserId: string
  riskScore: number
  riskLevel: RiskLevel
  signals: SignalType[]
  lastActivity: string
}

export interface Alert {
  id: string
  personId: string
  personName: string
  severity: RiskLevel
  signals: SignalType[]
  firedAt: string
  status: 'open' | 'acknowledged' | 'dismissed'
  evidenceCount: number
}

export interface Relationship {
  actorId: string
  targetId: string
  interactionCount: number
  avgSentiment: number
  sentimentTrend: 'rising' | 'falling' | 'stable'
  riskLevel: RiskLevel
  powerDelta: number
}

export interface MessageEvent {
  eventId: string
  orgId: string
  senderId: string
  senderName: string
  recipientIds: string[]
  channel: string
  channelType: 'public' | 'private' | 'dm' | 'group_dm'
  text: string
  sentimentScore: number
  signals: SignalType[]
  timestamp: string
}

export interface RiskScoreBreakdown {
  sentimentDrift: number
  afterHours: number
  channelExclusion: number
  responseDrop: number
  composite: number
}
