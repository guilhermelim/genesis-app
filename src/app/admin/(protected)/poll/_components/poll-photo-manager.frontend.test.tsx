import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import PollPhotoManager, { optimizePollPhotoFiles, type PollPhotoInput } from './poll-photo-manager.component'

jest.mock('@dnd-kit/core', () => {
  return {
    closestCenter: jest.fn(),
    DndContext: ({
      children,
      onDragStart,
      onDragCancel,
      onDragEnd,
    }: {
      children: React.ReactNode
      onDragStart: (event: { active: { id: string } }) => void
      onDragCancel: () => void
      onDragEnd: (event: { active: { id: string }; over: { id: string } | null }) => void
    }) =>
      React.createElement(
        'div',
        null,
        children,
        React.createElement('button', { onClick: () => onDragStart({ active: { id: 'photo-1' } }) }, 'drag start'),
        React.createElement('button', { onClick: onDragCancel }, 'drag cancel'),
        React.createElement(
          'button',
          { onClick: () => onDragEnd({ active: { id: 'photo-1' }, over: { id: 'photo-2' } }) },
          'drag reorder',
        ),
        React.createElement(
          'button',
          { onClick: () => onDragEnd({ active: { id: 'photo-1' }, over: { id: 'photo-1' } }) },
          'drag same',
        ),
        React.createElement(
          'button',
          { onClick: () => onDragEnd({ active: { id: 'unknown' }, over: { id: 'photo-2' } }) },
          'drag invalid',
        ),
        React.createElement(
          'button',
          { onClick: () => onDragEnd({ active: { id: 'photo-1' }, over: null }) },
          'drag none',
        ),
      ),
    DragOverlay: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    KeyboardSensor: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(sensor => sensor),
    useSensors: jest.fn((...sensors) => sensors),
  }
})

jest.mock('@dnd-kit/sortable', () => ({
  arrayMove: (items: PollPhotoInput[], from: number, to: number) => {
    const result = [...items]
    result.splice(to, 0, ...result.splice(from, 1))
    return result
  },
  rectSortingStrategy: {},
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  sortableKeyboardCoordinates: jest.fn(),
  useSortable: ({ id }: { id: string }) => ({
    attributes: { 'data-sortable-id': id },
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: id === 'photo-2',
  }),
}))

jest.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: jest.fn(() => undefined) } } }))

jest.mock('@/lib/image-optimization', () => ({
  dataUrlSize: jest.fn(() => 1024),
  formatBytes: jest.fn(() => '1 KB'),
  optimizeImageFile: jest.fn(async () => 'data:image/jpeg;base64,optimized'),
}))

const photos: PollPhotoInput[] = [
  { id: 'photo-1', dataUrl: 'data:image/jpeg;base64,one', isPrimary: true },
  { id: 'photo-2', dataUrl: 'data:image/jpeg;base64,two', isPrimary: false },
]

describe('PollPhotoManager', () => {
  it('optimizes selected files', async () => {
    const randomUUID = jest.spyOn(crypto, 'randomUUID').mockReturnValueOnce('generated-id')
    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' })

    await expect(optimizePollPhotoFiles([file])).resolves.toEqual([
      { id: 'generated-id', dataUrl: 'data:image/jpeg;base64,optimized', isPrimary: false },
    ])

    randomUUID.mockRestore()
  })

  it('shows the empty state and allows selecting files', async () => {
    const user = userEvent.setup()
    const onFilesSelected = jest.fn()

    render(<PollPhotoManager photos={[]} onChange={jest.fn()} onFilesSelected={onFilesSelected} />)

    expect(screen.getByText('Nenhuma foto adicionada.')).toBeInTheDocument()

    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText('Adicionar fotos'), file)

    expect(onFilesSelected).toHaveBeenCalledWith(expect.anything())
  })

  it('renders photos with a draggable cursor and removes a photo', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<PollPhotoManager photos={photos} onChange={onChange} onFilesSelected={jest.fn()} />)

    expect(screen.getByAltText('Foto 1')).toBeInTheDocument()
    expect(screen.getByAltText('Foto 2')).toBeInTheDocument()
    expect(screen.getByText('Principal')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Remover foto' })).toHaveLength(2)

    await user.click(screen.getAllByRole('button', { name: 'Remover foto' })[1])

    expect(onChange).toHaveBeenCalledWith([{ ...photos[0], isPrimary: true }])
  })

  it('shows validation errors and the total optimized size', () => {
    render(
      <PollPhotoManager
        photos={photos}
        onChange={jest.fn()}
        onFilesSelected={jest.fn()}
        error="Não foi possível processar as fotos."
      />,
    )

    expect(screen.getByText('Não foi possível processar as fotos.')).toBeInTheDocument()
    expect(screen.getByText(/armazenamento estimado:/)).toHaveTextContent('armazenamento estimado: 1 KB')
  })

  it('handles drag cancellation, no-op, invalid and reordered drags', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<PollPhotoManager photos={photos} onChange={onChange} onFilesSelected={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'drag start' }))
    expect(document.querySelector('.rotate-2')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Remover foto' }).at(-1)!)
    await user.click(screen.getByRole('button', { name: 'drag cancel' }))
    await user.click(screen.getByRole('button', { name: 'drag none' }))
    await user.click(screen.getByRole('button', { name: 'drag same' }))
    await user.click(screen.getByRole('button', { name: 'drag invalid' }))
    expect(onChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'drag reorder' }))
    expect(onChange).toHaveBeenCalledWith([
      { ...photos[1], isPrimary: true },
      { ...photos[0], isPrimary: false },
    ])
  })
})
