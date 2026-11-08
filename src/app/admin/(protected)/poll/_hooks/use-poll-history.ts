'use client'

import { useMemo } from 'react'
import { toast } from 'sonner'
import type { PollSettings } from '@/app/_shared/poll/types/poll-view-model.types'
import type { PollFormValues } from '../_forms/poll.form/poll.schema'
import type { PollState } from './use-poll-state'
import { getNextPollExpiration } from '@/app/_shared/poll/lib/poll-view-model'
import {
  activatePollCommand,
  createPollCommand,
  deletePollCommand,
  listPollsCommand,
  updatePollSettingsCommand,
} from '../_commands/poll-history.commands'

interface UsePollHistoryOptions {
  state: Pick<
    PollState,
    | 'polls'
    | 'pagination'
    | 'selectedPollId'
    | 'replacePage'
    | 'prependPoll'
    | 'activatePoll'
    | 'removePoll'
    | 'selectPoll'
    | 'setError'
    | 'clearError'
  >
  settings: PollSettings
}

export function usePollHistory({ state, settings }: UsePollHistoryOptions) {
  const defaultExpiresAt = useMemo(() => getNextPollExpiration(settings), [settings])

  const run = async <T>(action: Promise<T>) => {
    try {
      const result = await action
      state.clearError()
      return result
    } catch (cause) {
      state.setError(cause instanceof Error ? cause.message : 'Não foi possível concluir a operação')
      throw cause
    }
  }

  const changePage = async (page: number, pageSize = state.pagination.pageSize) => {
    try {
      state.replacePage(await listPollsCommand(page, pageSize))
      state.clearError()
    } catch (cause) {
      state.setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as enquetes')
      throw cause
    }
  }

  const changePageSize = (pageSize: number) => changePage(1, pageSize)

  const create = async (input: PollFormValues) => {
    try {
      const output = await run(createPollCommand({ ...input, expiresAt: input.expiresAt ?? defaultExpiresAt }))
      state.prependPoll(output)
      toast.success('Enquete criada', { description: 'A nova enquete foi adicionada com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível criar a enquete', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  const activate = async (id: string) => {
    const output = await run(activatePollCommand(id))
    state.activatePoll(output)
  }

  const remove = async (id: string) => {
    try {
      await run(deletePollCommand(id))
      const nextSelected = state.polls.find(item => item.id !== id)?.id
      state.removePoll(id)
      if (state.selectedPollId === id && nextSelected) state.selectPoll(nextSelected)
      toast.success('Enquete excluída', { description: 'A enquete foi removida com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível excluir a enquete', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  const updateSettings = async (input: PollSettings) => {
    try {
      await updatePollSettingsCommand(input)
      toast.success('Configuração atualizada', {
        description: 'O padrão de vencimento das novas enquetes foi salvo com sucesso.',
      })
    } catch (cause) {
      toast.error('Não foi possível salvar a configuração', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  return { changePage, changePageSize, create, activate, remove, updateSettings }
}
