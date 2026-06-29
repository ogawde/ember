'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  AlertCircle,
  Settings,
  Users,
  PanelLeftClose,
} from 'lucide-react'
import { EmberIcon } from '@/components/brand/ember-icon'
import { useWorkspace } from '@/lib/hooks/use-workspace'
import { useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'

function SidebarTooltip({
  label,
  show,
}: {
  label: string
  show: boolean
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-[100] pointer-events-none"
        >
          <div className="rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-lg whitespace-nowrap border border-border">
            {label}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { workspaceName } = useWorkspace()
  const { collapsed, expand, collapse, sidebarWidth } = useSidebar()
  const [edgeHover, setEdgeHover] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/people', label: 'People', icon: Users },
    { href: '/alerts', label: 'Alerts', icon: AlertCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const handleNavClick = () => {
    if (collapsed) expand()
  }

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 z-50"
    >
      <div
        className={cn(
          'border-b border-sidebar-border shrink-0',
          collapsed ? 'px-3 py-6' : 'px-4 py-6'
        )}
      >
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2')}>
          <Link
            href="/dashboard"
            onClick={handleNavClick}
            className={cn('group flex items-center min-w-0', collapsed ? '' : 'flex-1 gap-3')}
          >
            <div className="relative shrink-0">
              <div
                className="pointer-events-none absolute -inset-1 rounded-[11px] bg-[#E85D24]/0 blur-md transition-all duration-300 group-hover:bg-[#E85D24]/35"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-[10px] border-2 border-[#E85D24]/60 transition-all duration-300 group-hover:border-[#E85D24] group-hover:shadow-[0_0_20px_rgba(232,93,36,0.45)]">
                <EmberIcon className="h-10 w-10" />
              </div>
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col min-w-0 overflow-hidden"
                >
                  <span className="text-xl font-medium tracking-tight text-sidebar-foreground leading-none whitespace-nowrap">
                    ember
                  </span>
                  <span className="text-[11px] text-sidebar-foreground/60 mt-1 whitespace-nowrap">
                    workplace risk monitor
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {!collapsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              type="button"
              onClick={collapse}
              aria-label="Collapse sidebar"
              className="shrink-0 p-2 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      <nav className={cn('flex-1 py-6 space-y-2 overflow-visible', collapsed ? 'px-2' : 'px-4')}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ||
            (item.href === '/people' && pathname.startsWith('/people/'))

          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => setHoveredNav(item.href)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Link
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center rounded-md transition-colors',
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              {collapsed && (
                <SidebarTooltip label={item.label} show={hoveredNav === item.href} />
              )}
            </div>
          )
        })}
      </nav>

      <div className={cn('border-t border-sidebar-border shrink-0', collapsed ? 'p-3' : 'p-6')}>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-sidebar-foreground/60 overflow-hidden"
            >
              <p className="mb-2 font-semibold">Workspace</p>
              <p className="text-sidebar-foreground/80 truncate">{workspaceName}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!collapsed && (
        <div
          className="absolute right-0 top-0 h-full w-3 z-20"
          onMouseEnter={() => setEdgeHover(true)}
          onMouseLeave={() => setEdgeHover(false)}
        >
          <AnimatePresence>
            {edgeHover && (
              <motion.button
                type="button"
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.15 }}
                onClick={collapse}
                aria-label="Collapse sidebar"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-md border border-sidebar-border bg-card p-2 text-sidebar-foreground/70 shadow-md hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.aside>
  )
}
