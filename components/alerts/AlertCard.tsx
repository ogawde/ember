'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Alert } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const signalLabels: Record<string, string> = {
  sentiment_drift: 'Sentiment Drift',
  after_hours: 'After-Hours',
  channel_exclusion: 'Channel Exclusion',
  response_drop: 'Response Drop',
}

interface AlertCardProps {
  alert: Alert
}

export function AlertCard({ alert }: AlertCardProps) {
  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-accent'
      case 'warning':
        return 'text-yellow-600'
      case 'watch':
        return 'text-blue-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getRiskBadgeStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'warning':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300'
      case 'watch':
        return 'bg-blue-100 text-blue-900 border-blue-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold ${getRiskColor(alert.severity)}`}>
              {alert.personName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{alert.personName}</h3>
              <p className="text-xs text-muted-foreground">{formatTime(alert.firedAt)}</p>
            </div>
          </div>
        </div>
        <Badge className={getRiskBadgeStyles(alert.severity)}>
          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
        </Badge>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Signals Detected</p>
        <div className="flex gap-2 flex-wrap">
          {alert.signals.map((signal) => (
            <Badge key={signal} variant="secondary" className="text-xs">
              {signalLabels[signal]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" disabled>
          Dismiss
        </Button>
        <Link href={`/people/${alert.personId}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </div>
    </motion.div>
  )
}
