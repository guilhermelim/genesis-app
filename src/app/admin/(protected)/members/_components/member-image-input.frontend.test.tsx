import userEvent from '@testing-library/user-event'
import { act, fireEvent, render, screen } from '@testing-library/react'
import MemberImageInput from './member-image-input.component'
import { optimizeImageDataUrl } from '@/lib/image-optimization'

jest.mock('@/components/ui/dialog', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  return {
    Dialog: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode
      open: boolean
      onOpenChange: (open: boolean) => void
    }) =>
      open ? (
        <div>
          {children}
          <button type="button" onClick={() => onOpenChange(false)}>
            close-dialog
          </button>
        </div>
      ) : null,
    DialogContent: Wrapper,
    DialogDescription: Wrapper,
    DialogFooter: Wrapper,
    DialogHeader: Wrapper,
    DialogTitle: Wrapper,
  }
})

jest.mock('react-easy-crop', () => ({
  __esModule: true,
  default: ({ onCropComplete }: { onCropComplete: (area: unknown, pixels: unknown) => void }) => (
    <button
      type="button"
      data-testid="cropper"
      onClick={() => onCropComplete({}, { x: 0, y: 0, width: 10, height: 10 })}
    >
      crop
    </button>
  ),
}))
jest.mock('@/lib/image-optimization', () => ({ optimizeImageDataUrl: jest.fn().mockResolvedValue('optimized-image') }))

describe('MemberImageInput', () => {
  it('rejects non-image files and files over the size limit', async () => {
    const { rerender } = render(<MemberImageInput onChange={jest.fn()} />)
    const input = screen.getByLabelText('Adicionar foto')

    fireEvent.change(input, { target: { files: [] } })
    fireEvent.change(input, { target: { files: [new File(['text'], 'notes.txt', { type: 'text/plain' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione uma imagem.')

    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [oversized] } })
    expect(screen.getByRole('alert')).toHaveTextContent('A imagem deve ter no máximo 5 MB.')

    rerender(<MemberImageInput value="data:image/jpeg;base64,test" onChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Remover foto' })).toBeInTheDocument()
  })

  it('removes an existing image', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<MemberImageInput value="data:image/jpeg;base64,test" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Remover foto' }))

    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('reads, crops and optimizes a valid image', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const reader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/jpeg;base64,source',
      onload: null as null | (() => void),
    }
    jest.spyOn(global, 'FileReader').mockImplementation(() => reader as unknown as FileReader)
    const image = {
      set src(value: string) {
        this.onload?.()
      },
      onload: null as null | (() => void),
      onerror: null as null | (() => void),
    }
    jest.spyOn(window, 'Image').mockImplementation(() => image as unknown as HTMLImageElement)
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ({ drawImage: jest.fn() })),
      toDataURL: jest.fn(() => 'cropped'),
    }
    const createElement = document.createElement.bind(document)
    jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string) =>
        tag === 'canvas' ? (canvas as unknown as HTMLCanvasElement) : createElement(tag),
      )

    render(<MemberImageInput onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Adicionar foto'), {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    act(() => reader.onload?.())
    await user.click(await screen.findByRole('button', { name: 'close-dialog' }))
    await user.keyboard('{Escape}')
    fireEvent.change(screen.getByLabelText('Adicionar foto'), {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    act(() => reader.onload?.())
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    fireEvent.change(screen.getByLabelText('Adicionar foto'), {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    act(() => reader.onload?.())
    fireEvent.change(await screen.findByRole('slider'), { target: { value: '2' } })
    await user.click(await screen.findByTestId('cropper'))
    await user.click(screen.getByRole('button', { name: 'Usar foto' }))

    expect(onChange).toHaveBeenCalledWith('optimized-image')
    ;(canvas.getContext as jest.Mock).mockReturnValueOnce(null)
    fireEvent.change(screen.getByLabelText('Adicionar foto'), {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    act(() => reader.onload?.())
    await user.click(await screen.findByTestId('cropper'))
    await user.click(screen.getByRole('button', { name: 'Usar foto' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível preparar a imagem')
    Object.defineProperty(image, 'src', {
      configurable: true,
      set() {
        this.onerror?.()
      },
    })
    fireEvent.change(screen.getByLabelText('Adicionar foto'), {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    act(() => reader.onload?.())
    await user.click(await screen.findByTestId('cropper'))
    await user.click(screen.getByRole('button', { name: 'Usar foto' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível ler a imagem')
    Object.defineProperty(image, 'src', {
      configurable: true,
      set() {
        this.onload?.()
      },
    })
    jest.mocked(optimizeImageDataUrl).mockRejectedValueOnce('invalid')
    fireEvent.change(screen.getByLabelText('Adicionar foto'), {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    act(() => reader.onload?.())
    await user.click(await screen.findByTestId('cropper'))
    await user.click(screen.getByRole('button', { name: 'Usar foto' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível preparar a imagem')
    jest.restoreAllMocks()
  })
})
