'use client'

interface RiskScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

export function RiskScoreRing({ score, size = 180, strokeWidth = 8 }: RiskScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 10) * circumference

  const getColor = (score: number) => {
    if (score >= 7.5) return '#E85D24'
    if (score >= 5) return '#F59E0B'
    if (score >= 3) return '#3B82F6'
    return '#10B981'
  }

  const getForeground = (score: number) => {
    if (score >= 7.5) return '#E85D24'
    if (score >= 5) return '#D97706'
    if (score >= 3) return '#2563EB'
    return '#059669'
  }

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'all 0.6s ease',
            }}
          />
        </svg>
        {/* Center text */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 48, fontWeight: 'bold', color: getForeground(score) }}>
            {score.toFixed(1)}
          </span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>/10</span>
        </div>
      </div>
    </div>
  )
}
