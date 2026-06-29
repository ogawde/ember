'use client'

import { motion } from 'framer-motion'
import { Users, AlertCircle, Network } from 'lucide-react'
import useSWR from 'swr'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AlertsTable } from '@/components/dashboard/AlertsTable'
import { RiskGraph } from '@/components/dashboard/RiskGraph'
import type { Alert } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Metrics {
  totalEmployees: number
  activeAlerts: number
  highRiskRelationships: number
  messagesAnalyzedToday: number
}

export function DashboardContent() {
  const { data: metrics } = useSWR<Metrics>('/api/dashboard/metrics', fetcher, {
    refreshInterval: 30000,
  })
  const { data: alerts = [] } = useSWR<Alert[]>('/api/dashboard/alerts?status=open', fetcher, {
    refreshInterval: 30000,
  })

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-24 px-8 pb-12"
    >
      <div className="grid grid-cols-3 gap-6 mb-12">
        <MetricCard
          icon={Users}
          label="Total Employees"
          value={metrics?.totalEmployees ?? 0}
          href="/people"
        />
        <MetricCard
          icon={AlertCircle}
          label="Active Alerts"
          value={metrics?.activeAlerts ?? 0}
          href="/alerts"
        />
        <MetricCard
          icon={Network}
          label="High Risk Relationships"
          value={metrics?.highRiskRelationships ?? 0}
          onClick={() => {
            document.getElementById('risk-graph-container')?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }}
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Org Risk Map</h2>
        <RiskGraph />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h2>
        <AlertsTable alerts={alerts.slice(0, 10)} />
      </motion.section>
    </motion.main>
  )
}
