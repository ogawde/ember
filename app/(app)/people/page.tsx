'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { ChevronRight } from 'lucide-react'
import { MainContent } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/badge'
import type { Person, RiskLevel } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils/time'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const riskBadgeClass: Record<RiskLevel, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-orange-100 text-orange-800 border-orange-200',
  watch: 'bg-amber-100 text-amber-800 border-amber-200',
  normal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const riskScoreClass: Record<RiskLevel, string> = {
  critical: 'text-red-600',
  warning: 'text-orange-600',
  watch: 'text-amber-600',
  normal: 'text-emerald-600',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function PeoplePage() {
  const { data: people = [], isLoading } = useSWR<Person[]>('/api/dashboard/people', fetcher, {
    refreshInterval: 30000,
  })

  const visiblePeople = people.filter(
    (person) => person.slackUserId !== 'USLACKBOT' && !person.name.startsWith('User ')
  )

  return (
    <MainContent>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground">Team members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {visiblePeople.length} people monitored in your workspace
          </p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading people...</p>
        ) : visiblePeople.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground text-sm">No people synced yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px_100px_minmax(0,1fr)_40px] gap-4 px-6 py-3 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Person</span>
              <span>Department</span>
              <span>Score</span>
              <span>Level</span>
              <span>Last activity</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {visiblePeople.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <Link
                    href={`/people/${person.id}`}
                    className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px_100px_minmax(0,1fr)_40px] gap-3 md:gap-4 items-center px-6 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground shrink-0">
                        {getInitials(person.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{person.name}</p>
                        {person.signals.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {person.signals.length} active signal
                            {person.signals.length === 1 ? '' : 's'}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground md:block">{person.department}</p>

                    <p
                      className={cn(
                        'text-lg font-semibold tabular-nums',
                        riskScoreClass[person.riskLevel]
                      )}
                    >
                      {person.riskScore.toFixed(2)}
                    </p>

                    <Badge
                      variant="outline"
                      className={cn('capitalize w-fit', riskBadgeClass[person.riskLevel])}
                    >
                      {person.riskLevel}
                    </Badge>

                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(person.lastActivity)}
                    </p>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors justify-self-end hidden md:block" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </MainContent>
  )
}
