'use client'

import { MessageEvent } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const signalLabels: Record<string, string> = {
  sentiment_drift: 'Sentiment Drift',
  after_hours: 'After-Hours',
  channel_exclusion: 'Channel Exclusion',
  response_drop: 'Response Drop',
}

interface MessageEvidenceCardProps {
  message: MessageEvent
}

function getSentimentBorderClass(score: number) {
  if (score > 0.2) return 'border-l-green-500'
  if (score >= -0.2) return 'border-l-amber-500'
  return 'border-l-red-500'
}

export function MessageEvidenceCard({ message }: MessageEvidenceCardProps) {
  const getSentimentColor = (score: number) => {
    if (score < -0.5) return 'bg-accent/20 text-accent border-accent/30'
    if (score < -0.2) return 'bg-yellow-100 text-yellow-900 border-yellow-300'
    if (score < 0.2) return 'bg-gray-100 text-gray-900 border-gray-300'
    return 'bg-green-100 text-green-900 border-green-300'
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isAfterHours = (timestamp: string) => {
    const date = new Date(timestamp)
    const hour = date.getHours()
    return hour < 6 || hour >= 22
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border border-l-4 bg-card p-4',
        getSentimentBorderClass(message.sentimentScore)
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{message.senderName}</span>
            <span className="text-xs text-muted-foreground">{message.channel}</span>
            {isAfterHours(message.timestamp) && (
              <Badge variant="secondary" className="text-xs">
                After-Hours
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</p>
        </div>
        <Badge className={getSentimentColor(message.sentimentScore)}>
          {message.sentimentScore.toFixed(2)}
        </Badge>
      </div>

      <p className="text-sm text-foreground bg-muted/30 rounded p-3 mb-3 leading-relaxed">
        {message.text}
      </p>

      <div className="flex gap-2">
        {message.signals.map((signal) => (
          <Badge key={signal} variant="outline" className="text-xs">
            {signalLabels[signal]}
          </Badge>
        ))}
      </div>
    </div>
  )
}
