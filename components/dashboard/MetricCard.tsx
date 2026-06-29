'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: 'up' | 'down'
  highlighted?: boolean
  href?: string
  onClick?: () => void
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  highlighted = false,
  href,
  onClick,
}: MetricCardProps) {
  const router = useRouter()
  const isClickable = Boolean(href || onClick)

  const handleClick = () => {
    if (href) {
      router.push(href)
      return
    }
    onClick?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isClickable) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        isClickable
          ? {
              y: -4,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={isClickable ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative rounded-lg border p-6',
        highlighted
          ? 'bg-accent/10 border-accent text-accent'
          : 'bg-card border-border text-foreground',
        isClickable &&
          'cursor-pointer transition-all duration-300 hover:border-[#E85D24]/80 hover:shadow-[0_8px_30px_rgba(232,93,36,0.22),0_0_0_1px_rgba(232,93,36,0.12)] focus-visible:outline-none focus-visible:border-[#E85D24]/80 focus-visible:shadow-[0_8px_30px_rgba(232,93,36,0.22),0_0_0_1px_rgba(232,93,36,0.12)]'
      )}
    >
      {isClickable && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(232, 93, 36, 0.15)',
          }}
        />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <p
            className={cn(
              'text-sm font-medium transition-colors duration-300',
              highlighted ? 'text-accent' : 'text-muted-foreground',
              isClickable && 'group-hover:text-[#E85D24]/90'
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'text-3xl font-bold mt-2 transition-colors duration-300',
              highlighted ? 'text-accent' : 'text-foreground'
            )}
          >
            {value}
          </p>
        </div>
        <Icon
          className={cn(
            'w-8 h-8 transition-all duration-300',
            highlighted ? 'text-accent' : 'text-muted-foreground',
            isClickable && 'group-hover:text-[#E85D24] group-hover:drop-shadow-[0_0_8px_rgba(232,93,36,0.45)]'
          )}
        />
      </div>
    </motion.div>
  )
}
