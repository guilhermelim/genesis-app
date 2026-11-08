import { act, renderHook } from '@testing-library/react'
import { optimizePollPhotoFiles } from '../../_components/poll-photo-manager.component'
import { usePollForm } from './poll.hook'

jest.mock('../../_components/poll-photo-manager.component', () => ({ optimizePollPhotoFiles: jest.fn() }))

const photo = { id: 'photo-1', dataUrl: 'data:image/jpeg;base64,one', isPrimary: false }

describe('usePollForm', () => {
  it('initializes values and marks the first optimized photo as primary', async () => {
    jest.mocked(optimizePollPhotoFiles).mockResolvedValue([photo])
    const onSubmit = jest.fn()
    const { result } = renderHook(() => usePollForm({ defaultExpiresAt: new Date('2026-01-01'), onSubmit }))

    expect(result.current.photos).toEqual([])
    act(() => result.current.setPhotos([photo]))
    expect(result.current.photos).toEqual([photo])

    await act(async () => result.current.handleFilesSelected([new File(['x'], 'photo.jpg', { type: 'image/jpeg' })]))
    expect(result.current.photos).toEqual([
      { ...photo, isPrimary: true },
      { ...photo, isPrimary: false },
    ])
    expect(result.current.photoError).toBeUndefined()
  })

  it('initializes with photos from an existing poll', () => {
    const { result } = renderHook(() =>
      usePollForm({
        poll: {
          id: 'poll-1',
          name: 'Enquete',
          title: 'Título',
          description: 'Descrição',
          photos: [photo],
          votes: [],
          active: false,
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        onSubmit: jest.fn(),
      }),
    )

    expect(result.current.photos).toEqual([photo])
  })

  it('reports Error and unknown failures from photo processing', async () => {
    const { result } = renderHook(() => usePollForm({ onSubmit: jest.fn() }))
    jest.mocked(optimizePollPhotoFiles).mockRejectedValueOnce(new Error('Imagem inválida'))

    await act(async () => result.current.handleFilesSelected([]))
    expect(result.current.photoError).toBe('Imagem inválida')

    jest.mocked(optimizePollPhotoFiles).mockRejectedValueOnce('failure')
    await act(async () => result.current.handleFilesSelected([]))
    expect(result.current.photoError).toBe('Não foi possível processar as fotos.')
  })

  it('submits valid form values through react-hook-form', async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => usePollForm({ onSubmit }))

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as never)
    })

    expect(onSubmit).not.toHaveBeenCalled()
    await act(async () => {
      result.current.form.setValue('name', 'Enquete')
      result.current.form.setValue('title', 'Título')
      result.current.form.setValue('description', 'Descrição')
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as never)
    })
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Enquete', title: 'Título', description: 'Descrição' }),
      expect.anything(),
    )
  })
})
