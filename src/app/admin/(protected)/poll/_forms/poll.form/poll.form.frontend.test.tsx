import { fireEvent, render, screen } from '@testing-library/react'
import PollForm from './poll.form'
import { usePollForm } from './poll.hook'

jest.mock('react-hook-form', () => ({
  Controller: ({ render: renderField }: { render: (props: unknown) => React.ReactNode }) =>
    renderField({ field: { value: '', onChange: jest.fn() } }),
}))
jest.mock('./poll.hook', () => ({ usePollForm: jest.fn() }))
jest.mock('../../_components/poll-photo-manager.component', () => ({
  __esModule: true,
  default: ({ error, onFilesSelected }: { error?: string; onFilesSelected?: (files: File[]) => void }) => (
    <div data-testid="photo-manager">
      {error}
      <button type="button" onClick={() => onFilesSelected?.([])}>
        select photos
      </button>
    </div>
  ),
}))
jest.mock('../../_components/poll-date-time-picker.component', () => ({
  __esModule: true,
  default: () => <div data-testid="date-picker" />,
}))

const handleSubmit = jest.fn()
const handleFilesSelected = jest.fn()
const setPhotos = jest.fn()

function setupHook(overrides: Record<string, unknown> = {}) {
  jest.mocked(usePollForm).mockReturnValue({
    form: { control: {} },
    handleSubmit,
    photos: [],
    setPhotos,
    handleFilesSelected,
    photoError: undefined,
    errors: {},
    isSubmitting: false,
    ...overrides,
  } as never)
}

describe('PollForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupHook()
  })

  it('renders the standalone create form and handles file drops', () => {
    setupHook({ errors: { photos: { message: 'Fotos obrigatórias' } } })
    render(<PollForm submitLabel="Criar enquete" onSubmit={jest.fn()} />)

    expect(screen.getByText('Novo voluntariado')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome interno')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    expect(screen.getByTestId('photo-manager')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Criar enquete/ })).toBeInTheDocument()

    const form = screen.getByRole('button', { name: /Criar enquete/ }).closest('form')!
    fireEvent.dragOver(form, { dataTransfer: { types: ['Files'] } })
    fireEvent.drop(form, { dataTransfer: { types: ['Files'], files: [] } })
    expect(handleFilesSelected).not.toHaveBeenCalled()
    fireEvent.drop(form, { dataTransfer: { types: ['Files'], files: [new File(['x'], 'x.jpg')] } })
    expect(handleFilesSelected).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'select photos' }))
    expect(handleFilesSelected).toHaveBeenCalledTimes(2)
  })

  it('renders edit mode, validation errors, photo errors, and submitting state', () => {
    setupHook({
      errors: {
        name: { message: 'Nome obrigatório' },
        title: { message: 'Título obrigatório' },
        description: { message: 'Descrição obrigatória' },
        photos: { message: 'Fotos obrigatórias' },
      },
      photoError: 'Falha ao processar',
      isSubmitting: true,
    })
    render(
      <PollForm
        poll={{
          id: 'poll-1',
          name: 'Atual',
          title: 'Título',
          description: 'Descrição',
          photos: [],
          votes: [],
          active: false,
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        submitLabel="Salvar"
        embedded
        onSubmit={jest.fn()}
      />,
    )

    expect(screen.queryByText('Editar voluntariado')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Salvando/ })).not.toBeInTheDocument()
    expect(screen.getAllByText('Nome obrigatório')).toHaveLength(1)
    expect(screen.getByTestId('photo-manager')).toHaveTextContent('Falha ao processar')
  })

  it('shows the submitting label in standalone mode', () => {
    setupHook({ isSubmitting: true })
    render(
      <PollForm
        poll={{
          id: 'poll-1',
          name: 'Atual',
          title: 'Título',
          description: 'Descrição',
          photos: [],
          votes: [],
          active: false,
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        submitLabel="Salvar"
        onSubmit={jest.fn()}
      />,
    )

    expect(screen.getByText('Editar voluntariado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
  })
})
