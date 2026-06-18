'use client'

import { use, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { RiskScoreRing } from '@/components/people/RiskScoreRing'
import { SignalBreakdown } from '@/components/people/SignalBreakdown'
import { RelationshipCard } from '@/components/people/RelationshipCard'
import { MessageEvidenceCard } from '@/components/people/MessageEvidenceCard'
import { mockPeople, mockRiskScoreBreakdown, mockRelationships, mockMessages } from '@/lib/mock-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ personId: string }>
}

export default function PeopleProfilePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState('signals')

  const person = mockPeople.find((p) => p.id === resolvedParams.personId)
  if (!person) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="ml-64 pt-24 px-8 pb-12"
      >
        <Link href="/dashboard">
          <div className="flex items-center gap-2 text-accent hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </div>
        </Link>
        <p className="text-foreground">Person not found</p>
      </motion.main>
    )
  }

  const personRelationships = mockRelationships.filter((r) => r.actorId === person.id)
  const personMessages = mockMessages.filter((m) => m.senderId === person.id)

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

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="ml-64 pt-24 px-8 pb-12"
    >
      {/* Back Button */}
      <Link href="/dashboard">
        <div className="flex items-center gap-2 text-accent hover:underline mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </div>
      </Link>

      {/* Main Layout - Two Columns */}
      <div className="grid grid-cols-5 gap-8">
        {/* Left Column - 40% */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="col-span-2 space-y-6"
        >
          {/* Person Header */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-foreground`}>
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

            {/* Risk Score Ring */}
            <div className="flex justify-center mb-4">
              <RiskScoreRing score={person.riskScore} />
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p>Composite Risk Score</p>
            </div>
          </div>

          {/* Signal Breakdown */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Risk Score Breakdown</h3>
            <SignalBreakdown breakdown={mockRiskScoreBreakdown} />
          </div>

          {/* Signal Timeline */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Signal Timeline</h3>
            <div className="space-y-3">
              {person.signals.length > 0 ? (
                person.signals.map((signal, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {signal === 'sentiment_drift' && 'Sentiment Drift Detected'}
                        {signal === 'after_hours' && 'After-Hours Activity'}
                        {signal === 'channel_exclusion' && 'Channel Exclusion Pattern'}
                        {signal === 'response_drop' && 'Response Rate Drop'}
                      </p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No signals triggered</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - 60% */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="col-span-3"
        >
          {/* Tabs */}
          <Tabs defaultValue="signals" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="signals" className="flex-1">
                Risk Signals
              </TabsTrigger>
              <TabsTrigger value="evidence" className="flex-1">
                Message Evidence
              </TabsTrigger>
            </TabsList>

            {/* Risk Signals Tab */}
            <TabsContent value="signals" className="space-y-4">
              {personRelationships.length > 0 ? (
                personRelationships.map((relationship) => {
                  const partner = mockPeople.find((p) => p.id === relationship.targetId)
                  return (
                    <motion.div
                      key={relationship.targetId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RelationshipCard
                        relationship={relationship}
                        partnerName={partner?.name || 'Unknown'}
                      />
                    </motion.div>
                  )
                })
              ) : (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">No relationships with risk signals</p>
                </div>
              )}
            </TabsContent>

            {/* Message Evidence Tab */}
            <TabsContent value="evidence" className="space-y-4">
              {/* Restricted Access Banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Restricted View:</span> This view is restricted to HR and
                  Legal roles. Message content is only accessible in this evidence view.
                </p>
              </motion.div>

              {/* Messages */}
              {personMessages.length > 0 ? (
                personMessages.map((message, idx) => (
                  <motion.div
                    key={message.eventId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    <MessageEvidenceCard message={message} />
                  </motion.div>
                ))
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
