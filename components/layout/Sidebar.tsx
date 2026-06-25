'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, BarChart3, AlertCircle, Settings } from 'lucide-react'
import { useWorkspace } from '@/lib/hooks/use-workspace'

export function Sidebar() {
  const pathname = usePathname()
  const { workspaceName } = useWorkspace()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/alerts', label: 'Alerts', icon: AlertCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0">
      <div className="px-6 py-8 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold text-sidebar-foreground">ember</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
        <p className="mb-2 font-semibold">Workspace</p>
        <p className="text-sidebar-foreground/80">{workspaceName}</p>
      </div>
    </aside>
  )
}
