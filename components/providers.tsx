'use client'

import { Suspense } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { DemoTrigger } from '@/components/dev/DemoTrigger'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
      <Suspense fallback={null}>
        <DemoTrigger />
      </Suspense>
    </>
  )
}
