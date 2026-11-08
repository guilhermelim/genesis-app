import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import PollPageClient from './poll-page.client'
import { usePollState } from './_hooks/use-poll-state'
import { usePollHistory } from './_hooks/use-poll-history'
import { usePollEditing } from './_hooks/use-poll-editing'
import { usePollVoting } from './_hooks/use-poll-voting'
import { isPollAvailable } from '@/app/_shared/poll/lib/poll-availability'

jest.mock('./_hooks/use-poll-state', () => ({ usePollState: jest.fn() }))
jest.mock('./_hooks/use-poll-history', () => ({ usePollHistory: jest.fn() }))
jest.mock('./_hooks/use-poll-editing', () => ({ usePollEditing: jest.fn() }))
jest.mock('./_hooks/use-poll-voting', () => ({ usePollVoting: jest.fn() }))
jest.mock('@/app/_shared/poll/lib/poll-availability', () => ({ isPollAvailable: jest.fn() }))
jest.mock('../_components/admin-page-card', () => ({
  __esModule: true,
  default: ({ error, children }: { error?: React.ReactNode; children: React.ReactNode }) => (
    <main>
      {error}
      {children}
    </main>
  ),
}))
jest.mock('./_components/poll-history.component', () => ({
  __esModule: true,
  default: ({
    onPageChange,
    onPageSizeChange,
    onSelect,
    onCreate,
    onActivate,
    onDelete,
    onUpdateSettings,
  }: Record<string, (value?: unknown) => void>) => (
    <div data-testid="poll-history">
      <button onClick={() => onPageChange(2)}>page</button>
      <button onClick={() => onPageSizeChange(20)}>size</button>
      <button onClick={() => onSelect('poll-2')}>select</button>
      <button onClick={() => onCreate({})}>create</button>
      <button onClick={() => onActivate('poll-1')}>activate</button>
      <button onClick={() => onDelete('poll-1')}>delete</button>
      <button onClick={() => onUpdateSettings({})}>settings</button>
    </div>
  ),
}))
jest.mock('./_sections/poll-management.section', () => ({
  __esModule: true,
  default: ({ onVote, onRefresh, mode }: { onVote: () => void; onRefresh: () => void; mode: string }) => (
    <div data-testid="poll-management">
      <span>{mode}</span>
      <button onClick={onVote}>section vote</button>
      <button onClick={onRefresh}>section refresh</button>
    </div>
  ),
}))
jest.mock('./_components/poll-management.component', () => ({
  __esModule: true,
  default: ({
    onClose,
    onUpdate,
    onClearVotes,
  }: {
    onClose: () => void
    onUpdate: () => void
    onClearVotes: () => void
  }) => (
    <div data-testid="poll-editor">
      <button onClick={onClose}>close editor</button>
      <button onClick={onUpdate}>update editor</button>
      <button onClick={onClearVotes}>clear editor</button>
    </div>
  ),
}))

const poll = {
  id: 'poll-1',
  name: 'Enquete',
  title: 'Qual atividade?',
  description: 'Descrição',
  photos: [],
  votes: [],
  active: true,
  expiresAt: new Date('2099-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

let panel: 'vote' | 'results' | 'edit' = 'results'
const state = {
  poll,
  polls: [poll],
  pagination: { items: [poll], page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
  selectedPollId: poll.id,
  get panel() {
    return panel
  },
  setPanel: jest.fn(),
  selectPoll: jest.fn(),
  replacePoll: jest.fn(),
  setError: jest.fn(),
  clearError: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  panel = 'results'
  jest.mocked(usePollState).mockReturnValue(state as never)
  jest.mocked(usePollHistory).mockReturnValue({
    changePage: jest.fn(),
    changePageSize: jest.fn(),
    create: jest.fn(),
    activate: jest.fn(),
    remove: jest.fn(),
    updateSettings: jest.fn(),
  })
  jest.mocked(usePollEditing).mockReturnValue({ update: jest.fn(), clear: jest.fn() })
  jest.mocked(usePollVoting).mockReturnValue({ vote: jest.fn() })
  jest.mocked(isPollAvailable).mockReturnValue(true)
})

describe('PollPageClient', () => {
  it('renders selected poll actions and delegates every interaction', async () => {
    const user = userEvent.setup()
    render(
      <PollPageClient
        initialPage={state.pagination}
        settings={{ weekday: 1, hour: 8, minute: 0 }}
        members={[]}
        activities={[]}
      />,
    )

    for (const name of [
      'page',
      'size',
      'select',
      'create',
      'activate',
      'delete',
      'settings',
      'section vote',
      'section refresh',
      'close editor',
      'update editor',
      'clear editor',
    ]) {
      await user.click(screen.getByRole('button', { name }))
    }

    await user.click(screen.getByRole('button', { name: 'Visualizar' }))
    await user.click(screen.getByRole('button', { name: 'Inscrever-se' }))
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByText('Qual atividade?')).toBeInTheDocument()
  })

  it('hides voting and renders errors when the poll is unavailable', () => {
    jest.mocked(isPollAvailable).mockReturnValue(false)
    panel = 'vote'
    render(
      <PollPageClient
        initialPage={state.pagination}
        settings={{ weekday: 1, hour: 8, minute: 0 }}
        members={[]}
        activities={[]}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Inscrever-se' })).not.toBeInTheDocument()
  })

  it('renders the history without selected-poll content', () => {
    jest.mocked(usePollState).mockReturnValue({ ...state, poll: undefined } as never)
    render(
      <PollPageClient
        initialPage={state.pagination}
        settings={{ weekday: 1, hour: 8, minute: 0 }}
        members={[]}
        activities={[]}
      />,
    )

    expect(screen.getByTestId('poll-history')).toBeInTheDocument()
    expect(screen.queryByTestId('poll-management')).not.toBeInTheDocument()
  })

  it('renders the results mode while editing', () => {
    panel = 'edit'
    render(
      <PollPageClient
        initialPage={state.pagination}
        settings={{ weekday: 1, hour: 8, minute: 0 }}
        members={[]}
        activities={[]}
      />,
    )

    expect(screen.getByTestId('poll-management')).toHaveTextContent('results')
  })
})
