const DEFAULT_MAX_IMAGE_DIMENSION = 1920
const DEFAULT_JPEG_QUALITY = 0.9

export interface ImageOptimizationOptions {
  maxDimension?: number
  quality?: number
}

export function dataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(blob)
  })
}

async function optimizeSource(
  source: ImageBitmap | HTMLImageElement,
  originalSize: number,
  options: ImageOptimizationOptions = {},
): Promise<string> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_IMAGE_DIMENSION
  const quality = options.quality ?? DEFAULT_JPEG_QUALITY
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível preparar a imagem.')
  context.drawImage(source, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('Não foi possível otimizar a imagem.')
  const optimized = await readBlobAsDataUrl(blob)
  return dataUrlSize(optimized) < originalSize ? optimized : ''
}

export async function optimizeImageFile(file: File, options?: ImageOptimizationOptions): Promise<string> {
  const source = await createImageBitmap(file)
  try {
    const optimized = await optimizeSource(source, file.size, options)
    return optimized || readBlobAsDataUrl(file)
  } finally {
    source.close()
  }
}

export async function optimizeImageDataUrl(dataUrl: string, options?: ImageOptimizationOptions): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    element.src = dataUrl
  })
  const optimized = await optimizeSource(image, dataUrlSize(dataUrl), options)
  return optimized || dataUrl
}
