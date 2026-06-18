'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Alert } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

const signalLabels: Record<string, string> = {
  sentiment_drift: 'Sentiment Drift',
  after_hours: 'After-Hours',
  channel_exclusion: 'Channel Exclusion',
  response_drop: 'Response Drop',
}

interface AlertsTableProps {
  alerts: Alert[]
}

export function AlertsTable({ alerts }: AlertsTableProps) {
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
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Employee</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Risk Level</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Signals</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Last Activity</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, idx) => (
            <tr key={alert.id} className="border-b border-border hover:bg-muted/20 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-foreground">{alert.personName}</p>
              </td>
              <td className="px-6 py-4">
                <Badge className={getRiskBadgeStyles(alert.severity)}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 flex-wrap">
                  {alert.signals.slice(0, 2).map((signal) => (
                    <Badge key={signal} variant="secondary" className="text-xs">
                      {signalLabels[signal]}
                    </Badge>
                  ))}
                  {alert.signals.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{alert.signals.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {formatTime(alert.firedAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/people/${alert.personId}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
