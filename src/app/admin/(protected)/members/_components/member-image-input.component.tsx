'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import Cropper, { Area } from 'react-easy-crop'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from 'cn'
import { ImagePlus, Trash2 } from 'lucide-react'
import { optimizeImageDataUrl } from '@/lib/image-optimization'

function cropImage(source: string, area: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Não foi possível preparar a imagem'))
        return
      }
      context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, 400, 400)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    image.onerror = () => reject(new Error('Não foi possível ler a imagem'))
    image.src = source
  })
}

export default function MemberImageInput({ value, onChange }: { value?: string; onChange: (value?: string) => void }) {
  const [source, setSource] = useState<string>()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area>()
  const [error, setError] = useState<string>()
  const openFile = useCallback((file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5 MB.')
      return
    }
    setError(undefined)
    const reader = new FileReader()
    reader.onload = () => setSource(String(reader.result))
    reader.readAsDataURL(file)
  }, [])
  const finish = async () => {
    try {
      if (source && area) {
        const cropped = await cropImage(source, area)
        onChange(await optimizeImageDataUrl(cropped, { maxDimension: 400, quality: 0.9 }))
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível preparar a imagem')
    }
    setSource(undefined)
    setZoom(1)
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="grid size-20 place-items-center overflow-hidden rounded-full border border-dashed bg-muted">
          {value ? (
            <Image
              src={value}
              alt="Pré-visualização"
              width={80}
              height={80}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            'Foto'
          )}
        </div>
        <div>
          <label className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer')}>
            <ImagePlus className="size-4" /> {value ? 'Alterar foto' : 'Adicionar foto'}
            <input hidden type="file" accept="image/*" onChange={e => openFile(e.target.files?.[0])} />
          </label>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Remover foto"
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                setError(undefined)
                onChange(undefined)
              }}
            >
              <Trash2 className="size-3.5 text-destructive" /> Remover
            </Button>
          )}
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WEBP até 5 MB</p>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <Dialog open={Boolean(source)} onOpenChange={open => !open && setSource(undefined)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escolha a área da foto</DialogTitle>
            <DialogDescription>Ajuste o enquadramento para criar um avatar quadrado.</DialogDescription>
          </DialogHeader>
          <div className="relative h-72 overflow-hidden rounded-lg bg-zinc-900">
            <Cropper
              image={source ?? ''}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          </div>
          <Input
            className="mt-3"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSource(undefined)}>
              Cancelar
            </Button>
            <Button type="button" onClick={finish}>
              Usar foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
