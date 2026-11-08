import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import PollOverview from './poll-overview.component'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'> & { fill?: boolean; sizes?: string }) => {
    const { fill, sizes, ...imageProps } = props
    void fill
    void sizes
    return createElement('img', { ...imageProps, alt: imageProps.alt ?? '' })
  },
}))

jest.mock('@/components/poll-expiration-badge', () => ({
  __esModule: true,
  default: () => <span>expiration</span>,
}))

const basePoll = {
  id: 'poll-1',
  name: 'Enquete semanal',
  title: 'Qual atividade?',
  description: 'Escolha uma opção',
  active: true,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  updatedAt: new Date(),
  votes: [],
}

describe('PollOverview', () => {
  it('shows active metadata and primary photos', () => {
    render(
      <PollOverview
        poll={{
          ...basePoll,
          photos: [
            { id: 'photo-1', dataUrl: 'data:image/png;base64,abc', isPrimary: true },
            { id: 'photo-2', dataUrl: 'data:image/png;base64,def', isPrimary: false },
          ],
        }}
      />,
    )

    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText('expiration')).toBeInTheDocument()
    expect(screen.getByAltText('Qual atividade? - foto 1')).toBeInTheDocument()
    expect(screen.getByAltText('Qual atividade? - foto 2')).toBeInTheDocument()
  })

  it('explains when no photos exist', () => {
    render(<PollOverview poll={{ ...basePoll, active: false, photos: [] }} />)
    expect(screen.getByText('Encerrada')).toBeInTheDocument()
    expect(screen.getByText('Este voluntariado não possui fotos.')).toBeInTheDocument()
  })
})
