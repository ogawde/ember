'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { EmberIcon } from '@/components/brand/ember-icon'
import { Button } from '@/components/ui/button'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/landing/fade-in'
import { features, problems, signals, stats, steps } from '@/lib/landing/content'
import { cn } from '@/lib/utils'

const primaryButtonClass =
  'group bg-[#E85D24] text-white shadow-lg shadow-[#E85D24]/20 transition-all duration-200 hover:bg-[#d4521f] hover:scale-[1.03] hover:shadow-xl hover:shadow-[#E85D24]/35 active:scale-[0.98] [&_svg]:transition-transform hover:[&_svg]:translate-x-1'

const outlineButtonClass =
  'border-neutral-700 bg-transparent text-white transition-all duration-200 hover:border-[#E85D24]/50 hover:bg-neutral-900/80 hover:text-white hover:shadow-[0_0_28px_rgba(232,93,36,0.14)] active:scale-[0.98]'

const ORG_MAP_NODES = [
  { letter: 'A', left: '88%', top: '50%', colorClass: 'border-slate-500 text-slate-500' },
  { letter: 'N', left: '61.74%', top: '86.14%', colorClass: 'border-amber-600 text-amber-600' },
  { letter: 'S', left: '19.26%', top: '72.34%', colorClass: 'border-orange-600 text-orange-600' },
  { letter: 'R', left: '19.26%', top: '27.66%', colorClass: 'border-slate-500 text-slate-500' },
  { letter: 'C', left: '61.74%', top: '13.86%', colorClass: 'border-amber-600 text-amber-600' },
] as const

function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-black">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <motion.div
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#E85D24]/20 blur-[120px]"
      />
    </div>
  )
}

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-xs text-neutral-500">ember · Titan Technologies</span>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {[
            { label: 'Active Alerts', value: '3', accent: true },
            { label: 'People Monitored', value: '6', accent: false },
            { label: 'High Risk Links', value: '2', accent: false },
          ].map((metric) => (
            <div
              key={metric.label}
              className={cn(
                'rounded-xl border p-4',
                metric.accent
                  ? 'border-[#E85D24]/40 bg-[#E85D24]/10'
                  : 'border-neutral-800 bg-neutral-900/60'
              )}
            >
              <p className="text-xs text-neutral-500">{metric.label}</p>
              <p
                className={cn(
                  'mt-1 text-2xl font-bold tabular-nums',
                  metric.accent ? 'text-[#E85D24]' : 'text-white'
                )}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mx-4 mb-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Org Risk Map
          </p>
          <div className="relative mx-auto h-40 w-40">
            {ORG_MAP_NODES.map((node, i) => (
              <div
                key={node.letter}
                className={cn(
                  'absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-neutral-800 text-[10px] font-bold opacity-0 shadow-sm',
                  node.colorClass
                )}
                style={{
                  left: node.left,
                  top: node.top,
                  animation: `org-node-in 0.4s ease forwards`,
                  animationDelay: `${0.6 + i * 0.1}s`,
                }}
              >
                {node.letter}
              </div>
            ))}
            <svg className="absolute inset-0 h-full w-full opacity-40">
              <line x1="50%" y1="50%" x2="88%" y2="50%" stroke="#525252" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="27%" y2="12%" stroke="#525252" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="12%" y2="73%" stroke="#525252" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 transition-all duration-300 hover:border-[#E85D24]/40',
        className
      )}
    >
      {children}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <PageBackground />

      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-neutral-800/80 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-1 rounded-[11px] bg-[#E85D24]/0 blur-md transition-all duration-300 group-hover:bg-[#E85D24]/30"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[10px] border-2 border-[#E85D24]/60 transition-all duration-300 group-hover:border-[#E85D24] group-hover:shadow-[0_0_20px_rgba(232,93,36,0.35)]">
                <EmberIcon className="h-9 w-9" />
              </div>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">ember</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
            <a href="#problem" className="transition-colors hover:text-white">
              Problem
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-white">
              How it works
            </a>
          </nav>

          <Button
            nativeButton={false}
            render={<Link href="/dashboard" />}
            className={cn('h-9 px-4', primaryButtonClass)}
          >
            Try Demo
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl md:leading-[1.1]"
          >
            Protect your culture with{' '}
            <span className="text-[#E85D24]">signals, not surveys</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400 md:text-xl"
          >
            Ember monitors Slack communication patterns (sentiment drift, after-hours activity,
            exclusion, and response drops) and turns them into early-warning risk scores for HR
            and People Ops.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              nativeButton={false}
              render={<Link href="/dashboard" />}
              size="lg"
              className={cn('h-11 px-8 text-base', primaryButtonClass)}
            >
              Try Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              nativeButton={false}
              render={<a href="#features" />}
              variant="outline"
              size="lg"
              className={cn('h-11 px-8 text-base', outlineButtonClass)}
            >
              See features
            </Button>
          </motion.div>

          <DashboardPreview />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-800 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08}>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#E85D24] md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#E85D24]">
              The problem
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Workplace conflict doesn&apos;t start with a formal complaint
            </h2>
            <p className="mt-4 text-neutral-400">
              It starts with subtle shifts in how people communicate. Ember catches those shifts
              while there&apos;s still time to act.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-3">
            {problems.map((problem) => (
              <StaggerItem key={problem.title}>
                <SectionCard className="h-full hover:shadow-lg hover:shadow-[#E85D24]/5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E85D24]/15">
                    <Shield className="h-5 w-5 text-[#E85D24]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {problem.description}
                  </p>
                </SectionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-neutral-800 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#E85D24]">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Everything HR needs in one risk command center
            </h2>
          </FadeIn>

          <StaggerContainer className="mt-16 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <StaggerItem key={feature.title} className={feature.className}>
                  <SectionCard className="group h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E85D24]/10">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E85D24]/15 transition-colors group-hover:bg-[#E85D24]/25">
                      <Icon className="h-5 w-5 text-[#E85D24]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                      {feature.description}
                    </p>
                  </SectionCard>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Signals */}
      <section className="border-t border-neutral-800 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn direction="right">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#E85D24]">
                Risk signals
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Four signals. One composite score.
              </h2>
              <p className="mt-4 text-neutral-400">
                Each person gets a weighted risk score from 0–10, built from detectable communication
                patterns, not gut feel.
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/dashboard" />}
                className={cn('mt-8', primaryButtonClass)}
              >
                Explore live demo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </FadeIn>

            <StaggerContainer className="grid gap-3 sm:grid-cols-2">
              {signals.map((signal) => {
                const Icon = signal.icon
                return (
                  <StaggerItem key={signal.label}>
                    <SectionCard>
                      <Icon className="mb-2 h-5 w-5 text-[#E85D24]" />
                      <p className="font-medium text-white">{signal.label}</p>
                      <p className="mt-1 text-xs text-neutral-500">{signal.detail}</p>
                    </SectionCard>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-neutral-800 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#E85D24]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              From Slack message to HR action in three steps
            </h2>
          </FadeIn>

          <div className="relative mt-16">
            <div className="absolute top-12 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-[#E85D24]/30 to-transparent md:block" />
            <StaggerContainer className="grid gap-8 md:grid-cols-3">
              {steps.map((item) => (
                <StaggerItem key={item.step}>
                  <div className="relative text-center md:text-left">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E85D24]/50 bg-[#E85D24]/10 text-sm font-bold text-[#E85D24]">
                      {item.step}
                    </span>
                    <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-800 py-24 md:py-32">
        <FadeIn>
          <div className="mx-auto max-w-4xl px-6 text-center">
            <EmberIcon className="mx-auto mb-6 h-16 w-16" />
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              See Ember on Titan Technologies
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-neutral-400">
              Jump into the live demo workspace with real Slack data, risk scores, and alerts. No
              setup required.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard" />}
              size="lg"
              className={cn('mt-8 h-12 px-10 text-base shadow-[#E85D24]/25', primaryButtonClass)}
            >
              Try Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <EmberIcon className="h-8 w-8" />
            <span className="font-medium text-white">ember</span>
            <span className="text-neutral-500">· workplace risk monitor</span>
          </div>
          <p className="text-sm text-neutral-500">
            Built for HR teams who want early warning, not late surprises.
          </p>
        </div>
      </footer>
    </div>
  )
}
