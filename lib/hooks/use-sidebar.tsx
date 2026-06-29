'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'ember-sidebar-expanded'

interface SidebarContextValue {
  collapsed: boolean
  expand: () => void
  collapse: () => void
  sidebarWidth: number
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export const SIDEBAR_WIDTH_EXPANDED = 256
export const SIDEBAR_WIDTH_COLLAPSED = 72

function readCollapsedState(): boolean {
  if (typeof window === 'undefined') return true
  return sessionStorage.getItem(STORAGE_KEY) !== 'true'
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(readCollapsedState)

  const expand = useCallback(() => {
    setCollapsed(false)
    sessionStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const collapse = useCallback(() => {
    setCollapsed(true)
    sessionStorage.setItem(STORAGE_KEY, 'false')
  }, [])

  const value = useMemo(
    () => ({
      collapsed,
      expand,
      collapse,
      sidebarWidth: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    }),
    [collapsed, expand, collapse]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
