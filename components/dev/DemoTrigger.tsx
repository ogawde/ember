'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function DemoTrigger() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const isDemoMode =
    process.env.NODE_ENV !== 'production' || searchParams.get('demo') === 'true'

  if (!isDemoMode) return null

  async function handleTrigger() {
    const secret = process.env.NEXT_PUBLIC_CRON_SECRET
    if (!secret) {
      toast.error('Add NEXT_PUBLIC_CRON_SECRET to .env.local (same value as CRON_SECRET)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/worker/trigger', {
        headers: { Authorization: `Bearer ${secret}` },
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }

      toast.success(`Scoring complete — ${data.processed ?? 0} events processed`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scoring failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleTrigger}
        disabled={loading}
        className="shadow-lg gap-2 bg-[#E85D24] hover:bg-[#d4521f] text-white"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>⚡</span>}
        ⚡ Trigger Scoring
      </Button>
    </div>
  )
}
