import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PollClient from './poll-client'
import { addVote } from '@/infrastructure/poll/poll.actions'
import { unwrapActionResult } from '@/infrastructure/action-result'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('@/infrastructure/poll/poll.actions', () => ({
  addVote: jest.fn(),
}))
jest.mock('@/infrastructure/action-result', () => ({ unwrapActionResult: jest.fn() }))
jest.mock('@/app/home/_sections/poll/poll.section', () => ({
  __esModule: true,
  default: ({
    onVote,
    onRefresh,
  }: {
    onVote: (memberId: string, activityId: string) => Promise<void>
    onRefresh: () => void
  }) => (
    <>
      <button type="button" onClick={() => onVote('member-1', 'activity-1').catch(() => undefined)}>
        vote
      </button>
      <button type="button" onClick={onRefresh}>
        refresh
      </button>
    </>
  ),
}))

describe('PollClient', () => {
  it('explains when no poll is available and still shows activities', () => {
    render(
      <PollClient
        poll={null}
        members={[]}
        activities={[
          {
            id: 'activity-1',
            name: 'Ação social',
            label: '09:00h',
            description: 'Servir ao próximo',
          },
        ]}
      />,
    )

    expect(screen.getByText('Nenhum voluntariado está disponível para inscrição.')).toBeInTheDocument()
    expect(screen.getByText('Ação social')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Voluntariado e atividades' })).toBeInTheDocument()
  })

  it('updates the poll after a successful vote', async () => {
    const poll = {
      id: 'poll-1',
      name: 'Enquete',
      title: 'Título',
      description: 'Descrição',
      votes: [],
      photos: [],
      active: true,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    }
    jest.mocked(addVote).mockResolvedValue({ success: true, data: poll })
    jest
      .mocked(unwrapActionResult)
      .mockResolvedValue({ ...poll, votes: [{ memberId: 'member-1', activityId: 'activity-1' }] })
    render(<PollClient poll={poll} members={[]} activities={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'refresh' }))
    fireEvent.click(screen.getByRole('button', { name: 'vote' }))
    await waitFor(() =>
      expect(addVote).toHaveBeenCalledWith({ id: 'poll-1', memberId: 'member-1', activityId: 'activity-1' }),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows and rethrows vote errors', async () => {
    const poll = {
      id: 'poll-1',
      name: 'Enquete',
      title: 'Título',
      description: 'Descrição',
      votes: [],
      photos: [],
      active: true,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    }
    jest.mocked(addVote).mockResolvedValue({ success: true, data: poll })
    jest.mocked(unwrapActionResult).mockRejectedValue(new Error('Falha no voto'))
    render(<PollClient poll={poll} members={[]} activities={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'vote' }))
    await waitFor(() => expect(addVote).toHaveBeenCalled())
    expect(await screen.findByText('Falha no voto')).toBeInTheDocument()
  })

  it('uses a fallback message for non-Error vote failures', async () => {
    const poll = {
      id: 'poll-1',
      name: 'Enquete',
      title: 'Título',
      description: 'Descrição',
      votes: [],
      photos: [],
      active: true,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    }
    jest.mocked(addVote).mockResolvedValue({ success: true, data: poll })
    jest.mocked(unwrapActionResult).mockRejectedValue('falha')
    render(<PollClient poll={poll} members={[]} activities={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'vote' }))
    expect(await screen.findByText('Erro ao registrar inscrição')).toBeInTheDocument()
  })
})
