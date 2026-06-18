'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: 'up' | 'down'
  highlighted?: boolean
}

export function MetricCard({ icon: Icon, label, value, highlighted = false }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`rounded-lg border p-6 ${
        highlighted
          ? 'bg-accent/10 border-accent text-accent'
          : 'bg-card border-border text-foreground'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${highlighted ? 'text-accent' : 'text-muted-foreground'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold mt-2 ${highlighted ? 'text-accent' : 'text-foreground'}`}>
            {value}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${highlighted ? 'text-accent' : 'text-muted-foreground'}`} />
      </div>
    </motion.div>
  )
}
