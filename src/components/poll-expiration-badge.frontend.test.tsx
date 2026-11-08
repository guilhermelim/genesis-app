import { render, screen } from '@testing-library/react'
import PollExpirationBadge from './poll-expiration-badge'

describe('PollExpirationBadge', () => {
  it('shows the fallback when no expiration is defined', () => {
    render(<PollExpirationBadge />)

    expect(screen.getByText('Vencimento não definido')).toBeInTheDocument()
  })

  it('shows an active poll expiration', () => {
    render(<PollExpirationBadge active expiresAt={new Date(Date.now() + 60_000)} />)

    expect(screen.getByText(/Em andamento até/)).toBeInTheDocument()
  })

  it('shows an expired poll', () => {
    render(<PollExpirationBadge active expiresAt={new Date(Date.now() - 60_000)} />)

    expect(screen.getByText(/Finalizada em/)).toBeInTheDocument()
  })

  it('shows an inactive future expiration', () => {
    render(<PollExpirationBadge expiresAt={new Date(Date.now() + 60_000)} />)

    expect(screen.getByText(/Vencimento em/)).toBeInTheDocument()
  })
})
