'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import type { Person, Relationship, SignalType } from '@/lib/types'
import { useSidebar } from '@/lib/hooks/use-sidebar'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const RISK_COLORS: Record<string, string> = {
  normal: '#64748B',
  watch: '#D97706',
  warning: '#EA580C',
  critical: '#DC2626',
}

const RISK_FILL: Record<string, string> = {
  normal: '#F1F5F9',
  watch: '#FEF3C7',
  warning: '#FFEDD5',
  critical: '#FEE2E2',
}

const SIGNAL_LABELS: Record<SignalType, string> = {
  sentiment_drift: 'Sentiment Drift',
  after_hours: 'After-Hours',
  channel_exclusion: 'Channel Exclusion',
  response_drop: 'Response Drop',
}

interface GraphNode {
  id: string
  name: string
  firstName: string
  initials: string
  riskScore: number
  riskLevel: string
  signals: SignalType[]
  x: number
  y: number
  fx: number
  fy: number
}

interface GraphLink {
  source: string
  target: string
  strength: number
}

interface HoveredNode {
  name: string
  riskScore: number
  topSignal: string
}

interface ForceGraphRef {
  zoomToFit: (ms?: number, padding?: number) => void
}

const GRAPH_HEIGHT = 440

function isGraphPerson(person: Person) {
  return person.slackUserId !== 'USLACKBOT' && !person.name.startsWith('User ')
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getNodeRadius(riskScore: number) {
  return 16 + Math.min(riskScore * 1.4, 14)
}

function screenFontSize(globalScale: number, px = 12) {
  return Math.max(10, Math.min(14, px / globalScale))
}

function buildFixedLayout(people: Person[]): GraphNode[] {
  const count = people.length
  const radius = Math.max(185, count * 62)

  return people.map((person, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    return {
      id: person.id,
      name: person.name,
      firstName: person.name.split(' ')[0],
      initials: getInitials(person.name),
      riskScore: person.riskScore,
      riskLevel: person.riskLevel,
      signals: person.signals,
      x,
      y,
      fx: x,
      fy: y,
    }
  })
}

export function RiskGraph() {
  const router = useRouter()
  const { sidebarWidth } = useSidebar()
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<ForceGraphRef | null>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const [width, setWidth] = useState(800)
  const [hovered, setHovered] = useState<HoveredNode | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const { data: people = [] } = useSWR<Person[]>('/api/dashboard/people', fetcher, {
    refreshInterval: 30000,
  })
  const { data: relationships = [] } = useSWR<Relationship[]>(
    '/api/dashboard/relationships',
    fetcher,
    { refreshInterval: 30000 }
  )

  const graphPeople = useMemo(
    () =>
      people
        .filter(isGraphPerson)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [people]
  )

  const graphData = useMemo(() => {
    const nodeIds = new Set(graphPeople.map((person) => person.id))
    const nodes = buildFixedLayout(graphPeople)
    const links = relationships
      .filter((rel) => nodeIds.has(rel.actorId) && nodeIds.has(rel.targetId))
      .map((rel) => ({
        source: rel.actorId,
        target: rel.targetId,
        strength: rel.interactionCount,
      }))

    return { nodes, links }
  }, [graphPeople, relationships])

  const maxLinkStrength = useMemo(
    () => Math.max(...graphData.links.map((link) => link.strength), 1),
    [graphData.links]
  )

  const fitGraphToView = useCallback((duration = 300) => {
    graphRef.current?.zoomToFit(duration, 80)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measureWidth = () => {
      const nextWidth = Math.max(320, Math.round(el.getBoundingClientRect().width))
      setWidth(nextWidth)
    }

    const ro = new ResizeObserver(([entry]) => {
      const nextWidth = Math.max(320, Math.round(entry.contentRect.width))
      setWidth(nextWidth)
    })

    ro.observe(el)
    measureWidth()
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Sidebar width animates over 300ms; remeasure at start + end.
    const measure = () => {
      setWidth(Math.max(320, Math.round(el.getBoundingClientRect().width)))
    }

    measure()
    const rafId = requestAnimationFrame(measure)
    const timer = window.setTimeout(measure, 360)

    return () => {
      cancelAnimationFrame(rafId)
      window.clearTimeout(timer)
    }
  }, [sidebarWidth])

  useEffect(() => {
    if (graphData.nodes.length === 0) return

    let cancelled = false
    const runFit = () => {
      if (!cancelled) fitGraphToView()
    }

    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(runFit)
      })
    }, 120)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [width, graphData.nodes.length, fitGraphToView])

  const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const radius = getNodeRadius(node.riskScore)
    const color = RISK_COLORS[node.riskLevel] ?? RISK_COLORS.normal
    const fill = RISK_FILL[node.riskLevel] ?? RISK_FILL.normal

    if (node.riskLevel === 'critical') {
      const phase = (performance.now() / 1000) * 8
      for (let i = 3; i >= 1; i--) {
        const pulse = 1 + 0.1 * Math.sin(phase + i * 0.6)
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * (1 + i * 0.45) * pulse, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(220, 38, 38, ${0.18 / i})`
        ctx.fill()
      }
    }

    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5 / globalScale
    ctx.stroke()

    const initialsSize = screenFontSize(globalScale, 13)
    ctx.font = `700 ${initialsSize}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.initials, node.x, node.y)

    const label = node.firstName
    const labelSize = screenFontSize(globalScale, 12)
    const padX = 6 / globalScale
    const padY = 3 / globalScale
    ctx.font = `600 ${labelSize}px system-ui, -apple-system, sans-serif`
    const textW = ctx.measureText(label).width
    const pillW = textW + padX * 2
    const pillH = labelSize + padY * 2
    const pillX = node.x - pillW / 2
    const pillY = node.y + radius + 8 / globalScale

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 1 / globalScale
    ctx.beginPath()
    ctx.roundRect(pillX, pillY, pillW, pillH, 4 / globalScale)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#1E293B'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, node.x, pillY + pillH / 2)
  }, [])

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.id) router.push(`/people/${node.id}`)
    },
    [router]
  )

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if (!node) {
      setHovered(null)
      return
    }

    const topSignal = node.signals[0]
    setHovered({
      name: node.name,
      riskScore: node.riskScore,
      topSignal: topSignal ? SIGNAL_LABELS[topSignal] : 'No active signals',
    })
    setTooltipPos({ x: mousePosRef.current.x + 12, y: mousePosRef.current.y + 12 })
  }, [])

  const handleContainerMouseMove = useCallback(
    (event: React.MouseEvent) => {
      mousePosRef.current = { x: event.clientX, y: event.clientY }
      if (hovered) {
        setTooltipPos({ x: event.clientX + 12, y: event.clientY + 12 })
      }
    },
    [hovered]
  )

  if (graphPeople.length === 0) {
    return (
      <div
        id="risk-graph-container"
        className="w-full h-[440px] border-2 border-dashed border-border rounded-lg bg-slate-50 flex items-center justify-center"
      >
        <p className="text-muted-foreground text-sm">
          No people data yet. Run seed or sync Slack users
        </p>
      </div>
    )
  }

  return (
    <div
      id="risk-graph-container"
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className="relative w-full h-[440px] border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
    >
      <div className="absolute top-3 right-3 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Risk level
        </p>
        <div className="flex flex-col gap-2 text-xs text-slate-700">
          {(
            [
              ['normal', 'Normal'],
              ['watch', 'Watch'],
              ['warning', 'Warning'],
              ['critical', 'Critical'],
            ] as const
          ).map(([level, label]) => (
            <div key={level} className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                style={{ backgroundColor: RISK_COLORS[level] }}
              />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="absolute bottom-3 left-3 z-10 text-[11px] text-slate-500 bg-white/90 px-2 py-1 rounded border border-slate-200">
        Click a node to view profile · click background to reset view
      </p>

      {hovered && (
        <div
          className="fixed z-50 pointer-events-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-lg text-sm"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <p className="font-semibold text-slate-900">{hovered.name}</p>
          <p className="text-slate-600">
            Risk:{' '}
            <span className="font-semibold text-slate-900">{hovered.riskScore.toFixed(1)}</span>/10
          </p>
          <p className="text-slate-600">
            Top signal: <span className="font-medium text-slate-900">{hovered.topSignal}</span>
          </p>
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={width}
        height={GRAPH_HEIGHT}
        backgroundColor="#F8FAFC"
        nodeRelSize={1}
        nodeVal={1}
        linkWidth={(link) => {
          const strength = (link as GraphLink).strength ?? 1
          return Math.max(1.5, Math.min(3.5, 1.5 + strength / 15))
        }}
        linkColor={(link) => {
          const strength = (link as GraphLink).strength ?? 1
          const opacity = 0.35 + (strength / maxLinkStrength) * 0.45
          return `rgba(100, 116, 139, ${opacity})`
        }}
        linkDirectionalParticles={0}
        enableNodeDrag={false}
        enablePanInteraction={false}
        enableZoomInteraction
        minZoom={0.35}
        maxZoom={3}
        warmupTicks={0}
        cooldownTicks={0}
        d3AlphaMin={0}
        d3AlphaDecay={1}
        onBackgroundClick={() => fitGraphToView()}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          drawNode(node as GraphNode, ctx, globalScale)
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          const n = node as GraphNode
          const radius = getNodeRadius(n.riskScore)
          ctx.beginPath()
          ctx.arc(n.x, n.y, radius + 14, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
        }}
      />
    </div>
  )
}
