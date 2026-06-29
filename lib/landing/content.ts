import {
  AlertTriangle,
  Clock,
  Eye,
  Hash,
  MessageSquareWarning,
  Network,
  Shield,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const problems = [
  {
    title: 'Issues surface too late',
    description:
      'By the time HR hears about a conflict, sentiment has already fractured and teams have picked sides.',
  },
  {
    title: 'Signals are scattered',
    description:
      'Slack holds the truth: tone shifts, after-hours pings, exclusion patterns. But nobody connects the dots.',
  },
  {
    title: 'No early warning system',
    description:
      'Managers react to escalations instead of spotting drift weeks earlier when intervention still works.',
  },
]

export const features: {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}[] = [
  {
    icon: Hash,
    title: 'Slack-native ingestion',
    description:
      'Ember listens to workspace channels where your team already works. No new tools for employees to adopt.',
    className: 'md:col-span-2',
  },
  {
    icon: Zap,
    title: 'Composite risk scoring',
    description:
      'Weighted signals roll up into a 0–10 score per person, updated as new messages are processed.',
  },
  {
    icon: Network,
    title: 'Org risk map',
    description:
      'Visualize relationships and tension across your team. Click any node to drill into a profile.',
    className: 'md:col-span-2',
  },
  {
    icon: MessageSquareWarning,
    title: 'Message evidence',
    description:
      'HR and Legal get a restricted evidence view with flagged messages for context without guesswork.',
  },
  {
    icon: AlertTriangle,
    title: 'Actionable alerts',
    description:
      'Severity-ranked alerts fire when scores cross thresholds so you can act before things boil over.',
  },
  {
    icon: Users,
    title: 'People intelligence',
    description:
      'Per-person breakdowns: sentiment drift, response drops, channel exclusion, and after-hours activity.',
    className: 'md:col-span-2',
  },
]

export const signals = [
  { icon: TrendingDown, label: 'Sentiment drift', detail: 'Tone turns negative over time' },
  { icon: Clock, label: 'After-hours activity', detail: 'Unusual late-night messaging' },
  { icon: Eye, label: 'Channel exclusion', detail: 'Someone stops appearing in key channels' },
  { icon: MessageSquareWarning, label: 'Response drop', detail: 'Engagement falls off a cliff' },
]

export const steps = [
  {
    step: '01',
    title: 'Connect Slack',
    description: 'Ember ingests messages from channels your bot is invited to. Same workspace, zero friction.',
  },
  {
    step: '02',
    title: 'Score behavior',
    description:
      'Our engine analyzes sentiment, timing, and interaction patterns to build per-person risk profiles.',
  },
  {
    step: '03',
    title: 'Act early',
    description:
      'Dashboards, alerts, and evidence views give HR the context to intervene before escalation.',
  },
]

export const stats = [
  { value: '4', label: 'Risk signal types' },
  { value: '24/7', label: 'Continuous monitoring' },
  { value: '<5 min', label: 'Score refresh cycle' },
  { value: '1', label: 'Unified risk view' },
]
