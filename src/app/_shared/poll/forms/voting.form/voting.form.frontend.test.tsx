import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import VotingForm from './voting.form'

const submit = jest.fn()
const refresh = jest.fn()
const useVotingForm = jest.fn()

jest.mock('react-hook-form', () => ({
  Controller: function Controller({
    render,
  }: {
    render: (props: { field: { value: string; onChange: jest.Mock } }) => React.ReactNode
  }) {
    return render({ field: { value: '', onChange: jest.fn() } })
  },
}))
jest.mock('./voting.hook', () => ({ useVotingForm: (...args: unknown[]) => useVotingForm(...args) }))
jest.mock('sonner', () => ({ toast: { success: jest.fn() } }))
jest.mock('../../components/member-combobox', () => ({
  __esModule: true,
  default: ({
    onValueChange,
    onSelected,
  }: {
    onValueChange: (value: string) => void
    onSelected: (member: unknown) => void
  }) => (
    <button
      type="button"
      data-testid="member-combobox"
      onClick={() => {
        onValueChange('m1')
        onSelected({ id: 'm1', name: 'Ana', active: true })
      }}
    >
      member
    </button>
  ),
}))
jest.mock('../../components/activity-combobox', () => ({
  __esModule: true,
  default: ({ onValueChange }: { onValueChange: (value: string) => void }) => (
    <button type="button" data-testid="activity-combobox" onClick={() => onValueChange('a1')}>
      activity
    </button>
  ),
}))
jest.mock(
  '@/components/poll-expiration-badge',
  () =>
    function PollExpirationBadge() {
      return <div data-testid="expiration-badge" />
    },
)

const poll = {
  name: 'Enquete',
  title: 'Escolha',
  description: 'Descricao',
  votes: [{ memberId: 'm1', activityId: 'a1' }],
  active: true,
}

function configure(overrides: Record<string, unknown> = {}) {
  useVotingForm.mockImplementation((options: { onSubmit: (data: unknown) => Promise<void> }) => ({
    ...defaultHook(),
    handleSubmit: (event: React.FormEvent) => {
      event.preventDefault()
      void options.onSubmit({ memberId: 'm1', activityId: 'a1' })
    },
    ...overrides,
  }))
}

function defaultHook() {
  return {
    form: { control: {} },
    handleSubmit: (callback: (data: unknown) => void) => (event: React.FormEvent) => {
      event.preventDefault()
      callback({ memberId: 'm1', activityId: 'a1' })
    },
    errors: {},
    isSubmitting: false,
    loading: false,
    selectedMember: undefined,
    sortedMembers: [],
    availableActivities: [],
    canVote: true,
  }
}

describe('VotingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    configure()
  })

  it('renders the closed state without voting controls', () => {
    configure({ canVote: false })
    render(
      <VotingForm
        poll={{ ...poll, active: false }}
        members={[]}
        activities={[]}
        onSubmit={submit}
        onRefresh={refresh}
      />,
    )

    expect(screen.getByText('Este voluntariado já foi finalizado e não aceita novas inscrições.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Inscrever-se' })).not.toBeInTheDocument()
  })

  it('renders selected member, validation errors and submits successfully', async () => {
    configure({
      selectedMember: { id: 'm1', name: 'Ana', active: true },
      sortedMembers: [{ id: 'm1', name: 'Ana', active: true }],
      availableActivities: [{ id: 'a1', name: 'Corrida', label: '08:00' }],
      errors: { memberId: { message: 'Selecione um membro' }, activityId: { message: 'Selecione uma atividade' } },
    })
    render(<VotingForm poll={poll} members={[]} activities={[]} onSubmit={submit} onRefresh={refresh} />)

    expect(screen.getByText('Ana!')).toBeInTheDocument()
    expect(screen.getByText('Selecione um membro')).toBeInTheDocument()
    expect(screen.getByText('Selecione uma atividade')).toBeInTheDocument()
    expect(screen.getByText('membros disponíveis').parentElement).toHaveTextContent('1')
    fireEvent.click(screen.getByTestId('member-combobox'))
    fireEvent.click(screen.getByTestId('activity-combobox'))
    fireEvent.submit(screen.getByRole('button', { name: 'Inscrever-se' }).closest('form')!)
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ memberId: 'm1', activityId: 'a1' }))
  })

  it('shows loading text and disables the submit button', () => {
    configure({ loading: true, isSubmitting: true })
    render(<VotingForm poll={poll} members={[]} activities={[]} onSubmit={submit} onRefresh={refresh} />)
    expect(screen.getByRole('button', { name: 'Inscrevendo...' })).toBeDisabled()
  })
})
