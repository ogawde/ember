'use client'

import { motion } from 'framer-motion'
import { Users, AlertCircle, Network, MessageSquare } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AlertsTable } from '@/components/dashboard/AlertsTable'
import { mockMetrics, mockAlerts } from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="ml-64 pt-24 px-8 pb-12"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <MetricCard
          icon={Users}
          label="Total Employees"
          value={mockMetrics.totalEmployees}
        />
        <MetricCard
          icon={AlertCircle}
          label="Active Alerts"
          value={mockMetrics.activeAlerts}
          highlighted={mockMetrics.activeAlerts > 0}
        />
        <MetricCard
          icon={Network}
          label="High Risk Relationships"
          value={mockMetrics.highRiskRelationships}
        />
        <MetricCard
          icon={MessageSquare}
          label="Messages Analyzed Today"
          value={mockMetrics.messagesAnalyzedToday}
        />
      </div>

      {/* Org Risk Map */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Org Risk Map</h2>
        <div
          id="risk-graph-container"
          className="w-full h-96 border-2 border-dashed border-border rounded-lg bg-muted/30 flex items-center justify-center"
        >
          <p className="text-muted-foreground text-sm">Force graph renders here</p>
        </div>
      </motion.section>

      {/* Recent Alerts */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h2>
        <AlertsTable alerts={mockAlerts} />
      </motion.section>
    </motion.main>
  )
}
