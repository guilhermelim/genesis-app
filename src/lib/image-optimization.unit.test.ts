import { dataUrlSize, formatBytes, optimizeImageDataUrl, optimizeImageFile } from './image-optimization'

function installCanvas(
  blob: Blob | null,
  context: CanvasRenderingContext2D | null = { drawImage: jest.fn() } as never,
) {
  const toBlob = jest.fn((callback: BlobCallback) => callback(blob))
  jest.spyOn(global.document, 'createElement').mockReturnValue({
    width: 0,
    height: 0,
    getContext: jest.fn(() => context),
    toBlob,
  } as never)
  return { toBlob, context }
}

class MockFileReader {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  readAsDataURL(blob: Blob) {
    if (blob.size === 0) {
      this.onerror?.()
      return
    }

    const encoded = 'A'.repeat(Math.max(4, Math.ceil((blob.size * 4) / 3)))
    Object.defineProperty(this, 'result', {
      configurable: true,
      value: `data:image/jpeg;base64,${encoded}`,
    })
    this.onload?.call(null)
  }
}

describe('image optimization', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(global, 'document', {
      configurable: true,
      value: { createElement: jest.fn() },
    })
    Object.defineProperty(global, 'createImageBitmap', {
      configurable: true,
      value: jest.fn(),
    })
    Object.defineProperty(global, 'FileReader', { configurable: true, value: MockFileReader })
  })

  it('calculates Data URL sizes with padding', () => {
    expect(dataUrlSize('data:image/jpeg;base64,AAAA')).toBe(3)
    expect(dataUrlSize('data:image/jpeg;base64,AA==')).toBe(1)
    expect(dataUrlSize('data:image/jpeg;base64,AAA=')).toBe(2)
    expect(dataUrlSize('invalid')).toBe(0)
  })

  it('formats bytes in bytes, kilobytes, and megabytes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.00 MB')
  })

  it('optimizes an image file and releases the bitmap', async () => {
    const source = { width: 4000, height: 2000, close: jest.fn() }
    const bitmap = jest.mocked(global.createImageBitmap).mockResolvedValue(source as never)
    const { toBlob } = installCanvas(new Blob([new Uint8Array(1)], { type: 'image/jpeg' }))
    const output = await optimizeImageFile(new File([new Uint8Array(100)], 'photo.png'))

    expect(output).toContain('data:image/jpeg;base64')
    expect(bitmap).toHaveBeenCalled()
    expect(source.close).toHaveBeenCalled()
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.9)
  })

  it('uses the original file when optimization is not smaller', async () => {
    const source = { width: 100, height: 100, close: jest.fn() }
    jest.mocked(global.createImageBitmap).mockResolvedValue(source as never)
    installCanvas(new Blob([new Uint8Array(100)], { type: 'image/jpeg' }))
    const file = new File([new Uint8Array(1)], 'photo.png')

    await expect(optimizeImageFile(file)).resolves.toContain('data:image/jpeg;base64')
    expect(source.close).toHaveBeenCalled()
  })

  it('applies custom dimensions and quality', async () => {
    const source = { width: 2000, height: 1000, close: jest.fn() }
    jest.mocked(global.createImageBitmap).mockResolvedValue(source as never)
    const { toBlob } = installCanvas(new Blob([new Uint8Array(1)], { type: 'image/jpeg' }))

    await optimizeImageFile(new File([new Uint8Array(100)], 'photo.png'), {
      maxDimension: 1000,
      quality: 0.7,
    })

    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.7)
  })

  it('rejects when the canvas context is unavailable', async () => {
    const source = { width: 100, height: 100, close: jest.fn() }
    jest.mocked(global.createImageBitmap).mockResolvedValue(source as never)
    installCanvas(new Blob([new Uint8Array(1)]), null)

    await expect(optimizeImageFile(new File([new Uint8Array(10)], 'photo.png'))).rejects.toThrow(
      'Não foi possível preparar a imagem.',
    )
    expect(source.close).toHaveBeenCalled()
  })

  it('rejects when the canvas cannot create a blob', async () => {
    const source = { width: 100, height: 100, close: jest.fn() }
    jest.mocked(global.createImageBitmap).mockResolvedValue(source as never)
    installCanvas(null)

    await expect(optimizeImageFile(new File([new Uint8Array(10)], 'photo.png'))).rejects.toThrow(
      'Não foi possível otimizar a imagem.',
    )
  })

  it('optimizes a Data URL and preserves it when it cannot be reduced', async () => {
    const image = jest.fn().mockImplementation(() => ({
      onload: null,
      onerror: null,
      set src(value: string) {
        this.onload?.()
      },
    }))
    Object.defineProperty(global, 'Image', { configurable: true, value: image })
    installCanvas(new Blob([new Uint8Array(1)], { type: 'image/jpeg' }))
    const input = `data:image/jpeg;base64,${'A'.repeat(100)}`

    await expect(optimizeImageDataUrl(input)).resolves.toContain('data:image/jpeg;base64')
    expect(image).toHaveBeenCalled()
  })

  it('preserves the original Data URL when optimization is larger', async () => {
    Object.defineProperty(global, 'Image', {
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        set src(_: string) {
          this.onload?.()
        },
      })),
    })
    installCanvas(new Blob([new Uint8Array(100)], { type: 'image/jpeg' }))
    const input = 'data:image/jpeg;base64,AAA'

    await expect(optimizeImageDataUrl(input)).resolves.toBe(input)
  })

  it('rejects when a Data URL cannot be loaded', async () => {
    Object.defineProperty(global, 'Image', {
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        set src(_: string) {
          this.onerror?.()
        },
      })),
    })

    await expect(optimizeImageDataUrl('data:image/jpeg;base64,AAAA')).rejects.toThrow('Não foi possível ler a imagem.')
  })

  it('rejects when an optimized image cannot be read', async () => {
    Object.defineProperty(global, 'Image', {
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        set src(_: string) {
          this.onload?.()
        },
      })),
    })
    installCanvas(new Blob([], { type: 'image/jpeg' }))

    await expect(optimizeImageDataUrl('data:image/jpeg;base64,AAAA')).rejects.toThrow('Não foi possível ler a imagem.')
  })
})
