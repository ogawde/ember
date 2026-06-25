'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface WorkspaceInfo {
  workspaceName: string
  slackConnected: boolean
}

export function useWorkspace() {
  const { data, isLoading } = useSWR<WorkspaceInfo>('/api/dashboard/org', fetcher, {
    revalidateOnFocus: true,
  })

  return {
    workspaceName: data?.workspaceName ?? 'Loading...',
    slackConnected: data?.slackConnected ?? false,
    isLoading,
  }
}
