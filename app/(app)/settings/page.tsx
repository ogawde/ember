'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useWorkspace } from '@/lib/hooks/use-workspace'

export default function SettingsPage() {
  const { workspaceName, slackConnected } = useWorkspace()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [slackAlerts, setSlackAlerts] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)
  const [warningThreshold, setWarningThreshold] = useState([5.0])
  const [criticalThreshold, setCriticalThreshold] = useState([7.5])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-24 px-8 pb-12 max-w-3xl"
    >
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage workspace configuration and preferences</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Slack Integration
            </CardTitle>
            <CardDescription>Connected workspace and bot configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${slackConnected ? 'bg-green-600' : 'bg-amber-500'}`}
                  />
                  <p className="text-sm font-medium text-foreground">
                    {slackConnected ? 'Connected' : 'Not configured'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Workspace</p>
                <p className="text-sm font-medium text-foreground">{workspaceName}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Bot Token</p>
              <p className="text-sm font-mono text-foreground">xoxb-••••••••••••••••</p>
            </div>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" disabled>
                Reconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Configure how and when you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Alerts</p>
                <p className="text-xs text-muted-foreground">Receive email notifications for new alerts</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Slack DM Alerts</p>
                  <p className="text-xs text-muted-foreground">Send alert notifications via Slack DM</p>
                </div>
                <Switch checked={slackAlerts} onCheckedChange={setSlackAlerts} />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly Report</p>
                  <p className="text-xs text-muted-foreground">Receive a weekly summary of organizational risks</p>
                </div>
                <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Risk Thresholds
            </CardTitle>
            <CardDescription>Adjust the scores that trigger different alert levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Warning Threshold</p>
                  <p className="text-xs text-muted-foreground">Scores above this trigger a Warning alert</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-yellow-900">{warningThreshold[0].toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <Slider
                value={warningThreshold}
                onValueChange={setWarningThreshold}
                min={1}
                max={10}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">Default: 5.0</p>
            </div>

            <div className="border-t border-border pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Critical Threshold</p>
                  <p className="text-xs text-muted-foreground">Scores above this trigger a Critical alert</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-accent">{criticalThreshold[0].toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <Slider
                value={criticalThreshold}
                onValueChange={setCriticalThreshold}
                min={1}
                max={10}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">Default: 7.5</p>
            </div>

            {warningThreshold[0] >= criticalThreshold[0] && (
              <div className="mt-6 p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Warning threshold should be lower than Critical threshold
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.main>
  )
}
