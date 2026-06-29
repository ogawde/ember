'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { SidebarProvider, useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'

function AppShellFrame({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar()

  return (
    <>
      <Sidebar />
      <div
        className="min-h-screen transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <Header />
        {children}
      </div>
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </SidebarProvider>
  )
}

export function MainContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className={cn('pt-24 px-8 pb-12', className)}>{children}</main>
  )
}
