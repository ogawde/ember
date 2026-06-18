'use client'

import { RiskScoreBreakdown } from '@/lib/types'
import { Progress } from '@/components/ui/progress'

interface SignalBreakdownProps {
  breakdown: RiskScoreBreakdown
}

export function SignalBreakdown({ breakdown }: SignalBreakdownProps) {
  const signals = [
    { label: 'Sentiment Drift', value: breakdown.sentimentDrift },
    { label: 'After-Hours Contact', value: breakdown.afterHours },
    { label: 'Channel Exclusion', value: breakdown.channelExclusion },
    { label: 'Response Rate Drop', value: breakdown.responseDrop },
  ]

  const getProgressColor = (value: number) => {
    if (value >= 7.5) return 'bg-accent'
    if (value >= 5) return 'bg-yellow-500'
    if (value >= 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <div key={signal.label}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">{signal.label}</p>
            <span className="text-sm font-semibold text-muted-foreground">{signal.value.toFixed(1)}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getProgressColor(signal.value)} transition-all`}
              style={{ width: `${(signal.value / 10) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
