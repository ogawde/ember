'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCard } from '@/components/alerts/AlertCard'
import { mockAlerts } from '@/lib/mock-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AlertsPage() {
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterSignal, setFilterSignal] = useState('all')

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false
    if (filterSignal !== 'all' && !alert.signals.includes(filterSignal as any)) return false
    return true
  })

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="ml-64 pt-24 px-8 pb-12"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold text-foreground">Active Alerts</h1>
          <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold">
            {filteredAlerts.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="watch">Watch</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSignal} onValueChange={setFilterSignal}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Signals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Signals</SelectItem>
              <SelectItem value="sentiment_drift">Sentiment Drift</SelectItem>
              <SelectItem value="after_hours">After-Hours</SelectItem>
              <SelectItem value="channel_exclusion">Channel Exclusion</SelectItem>
              <SelectItem value="response_drop">Response Drop</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.map((alert, idx) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <AlertCard alert={alert} />
          </motion.div>
        ))}
      </div>
    </motion.main>
  )
}
