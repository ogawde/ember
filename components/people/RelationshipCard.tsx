'use client'

import { Relationship } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'

interface RelationshipCardProps {
  relationship: Relationship
  partnerName: string
  partnerId: string
}

export function RelationshipCard({ relationship, partnerName, partnerId }: RelationshipCardProps) {
  const getRiskBadgeStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'warning':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300'
      case 'watch':
        return 'bg-blue-100 text-blue-900 border-blue-300'
      default:
        return 'bg-green-100 text-green-900 border-green-300'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-accent" />
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-accent" />
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const sentimentColor = relationship.avgSentiment < -0.3 ? 'text-accent' : 'text-muted-foreground'

  return (
    <Link
      href={`/people/${partnerId}`}
      className="block rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/30 hover:border-[#E85D24]/70 hover:shadow-[0_8px_24px_rgba(232,93,36,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D24]/40"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-foreground">{partnerName}</p>
          <p className="text-xs text-muted-foreground">{relationship.interactionCount} interactions</p>
        </div>
        <Badge className={getRiskBadgeStyles(relationship.riskLevel)}>
          {relationship.riskLevel.charAt(0).toUpperCase() + relationship.riskLevel.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${sentimentColor}`}>
            {relationship.avgSentiment.toFixed(2)}
          </span>
          {getTrendIcon(relationship.sentimentTrend)}
        </div>
        <div className="text-xs text-muted-foreground">
          Power Delta: {relationship.powerDelta > 0 ? '+' : ''}{relationship.powerDelta}
        </div>
      </div>
    </Link>
  )
}
