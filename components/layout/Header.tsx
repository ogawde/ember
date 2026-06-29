'use client'

import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useWorkspace } from '@/lib/hooks/use-workspace'

export function Header() {
  const pathname = usePathname()
  const { workspaceName } = useWorkspace()

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard'
    if (pathname === '/people') return 'People'
    if (pathname.startsWith('/people/')) return 'Risk Profile'
    if (pathname.startsWith('/alerts')) return 'Alerts'
    if (pathname.startsWith('/settings')) return 'Settings'
    return 'Ember'
  }

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{getPageTitle()}</h1>
        <div className="ml-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
          <span>Workspace: {workspaceName}</span>
        </div>
      </div>

      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-foreground" />
      </button>
    </header>
  )
}
