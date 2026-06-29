'use client'

import { use, useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { RiskScoreRing } from '@/components/people/RiskScoreRing'
import { SignalBreakdown } from '@/components/people/SignalBreakdown'
import { RelationshipCard } from '@/components/people/RelationshipCard'
import { MessageEvidenceCard } from '@/components/people/MessageEvidenceCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Person, Relationship, MessageEvent, RiskScoreBreakdown } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils/time'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const timelineVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const timelineItemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

interface PersonDetailResponse {
  person: Person
  breakdown: RiskScoreBreakdown
  relationships: (Relationship & { partnerName: string })[]
  messages: MessageEvent[]
}

interface PageProps {
  params: Promise<{ personId: string }>
}

export default function PeopleProfilePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState('signals')
  const [visibleEvidenceCount, setVisibleEvidenceCount] = useState(10)

  const { data, isLoading, error } = useSWR<PersonDetailResponse>(
    `/api/dashboard/people/${resolvedParams.personId}`,
    fetcher
  )

  const sortedMessages = useMemo(() => {
    if (!data?.messages) return []
    return [...data.messages].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [data?.messages])

  const visibleMessages = useMemo(
    () => sortedMessages.slice(0, visibleEvidenceCount),
    [sortedMessages, visibleEvidenceCount]
  )

  useEffect(() => {
    setVisibleEvidenceCount(10)
  }, [resolvedParams.personId, sortedMessages.length])

  if (isLoading) {
    return (
      <main className="pt-24 px-8 pb-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </main>
    )
  }

  if (error || !data?.person) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 px-8 pb-12"
      >
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Not found</span>
        </nav>
        <p className="text-foreground">Person not found</p>
      </motion.main>
    )
  }

  const { person, breakdown, relationships } = data

  const getRiskLevelColor = (level: string) => {
    switch (level) {
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

  const signalLabel = (signal: string) => {
    switch (signal) {
      case 'sentiment_drift':
        return 'Sentiment Drift Detected'
      case 'after_hours':
        return 'After-Hours Activity'
      case 'channel_exclusion':
        return 'Channel Exclusion Pattern'
      case 'response_drop':
        return 'Response Rate Drop'
      default:
        return signal
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-24 px-8 pb-12"
    >
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/people" className="hover:text-accent transition-colors font-medium">
          People
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-foreground font-medium">{person.name}</span>
      </nav>

      <div className="grid grid-cols-5 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="col-span-2 space-y-6"
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-foreground">
                {person.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{person.name}</h1>
                <p className="text-sm text-muted-foreground mb-2">{person.department}</p>
                <Badge className={getRiskLevelColor(person.riskLevel)}>
                  {person.riskLevel.charAt(0).toUpperCase() + person.riskLevel.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <RiskScoreRing score={person.riskScore} />
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p>Composite Risk Score</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Risk Score Breakdown</h3>
            <SignalBreakdown breakdown={breakdown} />
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Signal Timeline</h3>
            {person.signals.length > 0 ? (
              <motion.div
                className="space-y-3"
                variants={timelineVariants}
                initial="hidden"
                animate="show"
              >
                {person.signals.map((signal) => (
                  <motion.div
                    key={signal}
                    variants={timelineItemVariants}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{signalLabel(signal)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(person.lastActivity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground">No signals triggered</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="col-span-3"
        >
          <Tabs defaultValue="signals" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="signals" className="flex-1">
                Risk Signals
              </TabsTrigger>
              <TabsTrigger value="evidence" className="flex-1">
                Message Evidence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signals" className="space-y-4">
              {relationships.length > 0 ? (
                relationships.map((relationship) => (
                  <motion.div
                    key={relationship.targetId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RelationshipCard
                      relationship={relationship}
                      partnerName={relationship.partnerName}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">No relationships with risk signals</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-700 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Restricted View:</span> This view is restricted to HR
                  and Legal roles. Message content is only accessible in this evidence view.
                </p>
              </motion.div>

              {sortedMessages.length > 0 ? (
                <>
                  {visibleMessages.map((message, idx) => (
                  <motion.div
                    key={message.eventId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    <MessageEvidenceCard message={message} />
                  </motion.div>
                  ))}
                  {visibleEvidenceCount < sortedMessages.length && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setVisibleEvidenceCount((current) =>
                            Math.min(current + 10, sortedMessages.length)
                          )
                        }
                      >
                        View more
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">No flagged messages</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.main>
  )
}
