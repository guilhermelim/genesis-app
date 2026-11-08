'use client'

import { useState } from 'react'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'

export interface PollPageData {
  items: PollViewModel[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PollPanel = 'vote' | 'results' | 'edit'

export function usePollState({ initialPage }: { initialPage: PollPageData }) {
  const [polls, setPolls] = useState(initialPage.items)
  const [pagination, setPagination] = useState(initialPage)
  const [selectedPollId, setSelectedPollId] = useState(
    initialPage.items.find(item => item.active)?.id ?? initialPage.items[0]?.id,
  )
  const [panel, setPanel] = useState<PollPanel>('results')
  const [error, setError] = useState<string>()
  const poll = polls.find(item => item.id === selectedPollId)

  const selectPoll = (id: string) => {
    setSelectedPollId(id)
    setPanel('results')
  }

  const replacePage = (page: PollPageData) => {
    setPolls(page.items)
    setPagination(page)
  }

  const prependPoll = (poll: PollViewModel) => {
    setPolls(current => [poll, ...current.map(item => ({ ...item, active: false }))])
    setPagination(current => ({ ...current, totalItems: current.totalItems + 1 }))
    setSelectedPollId(poll.id)
    setPanel('results')
  }

  const activatePoll = (poll: PollViewModel) => {
    setPolls(current => current.map(item => (item.id === poll.id ? poll : { ...item, active: false })))
    setSelectedPollId(poll.id)
    setPanel('results')
  }

  const removePoll = (id: string) => {
    setPolls(current => current.filter(item => item.id !== id))
    setPagination(current => ({
      ...current,
      totalItems: Math.max(0, current.totalItems - 1),
      totalPages: Math.max(1, Math.ceil(Math.max(0, current.totalItems - 1) / current.pageSize)),
    }))
    setSelectedPollId(current => (current === id ? '' : current))
  }

  const replacePoll = (poll: PollViewModel) => {
    setPolls(current => current.map(item => (item.id === poll.id ? poll : item)))
  }

  const clearError = () => setError(undefined)

  return {
    polls,
    pagination,
    poll,
    selectedPollId,
    panel,
    error,
    setPanel,
    setError,
    clearError,
    selectPoll,
    replacePage,
    prependPoll,
    activatePoll,
    removePoll,
    replacePoll,
  }
}

export type PollState = ReturnType<typeof usePollState>
