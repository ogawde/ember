'use client'

import { motion } from 'framer-motion'

interface RiskScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

export function RiskScoreRing({ score, size = 180, strokeWidth = 8 }: RiskScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (score / 10) * circumference

  const getColor = (value: number) => {
    if (value >= 7.5) return '#E85D24'
    if (value >= 5) return '#F59E0B'
    if (value >= 3) return '#3B82F6'
    return '#10B981'
  }

  const getForeground = (value: number) => {
    if (value >= 7.5) return '#E85D24'
    if (value >= 5) return '#D97706'
    if (value >= 3) return '#2563EB'
    return '#059669'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold" style={{ color: getForeground(score) }}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">/10</span>
        </div>
      </div>
    </div>
  )
}
