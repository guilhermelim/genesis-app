'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, ImagePlus, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { dataUrlSize, formatBytes, optimizeImageFile } from '@/lib/image-optimization'

export type PollPhotoInput = { id: string; dataUrl: string; isPrimary: boolean }

export async function optimizePollPhotoFiles(files: FileList | File[]): Promise<PollPhotoInput[]> {
  return Promise.all(
    Array.from(files).map(async file => ({
      id: crypto.randomUUID(),
      dataUrl: await optimizeImageFile(file),
      isPrimary: false,
    })),
  )
}

function PhotoCard({
  photo,
  index,
  onRemove,
  isOverlay = false,
  setNodeRef,
  attributes,
  listeners,
  style,
}: {
  photo: PollPhotoInput
  index: number
  onRemove: () => void
  isOverlay?: boolean
  setNodeRef?: (element: HTMLElement | null) => void
  attributes?: React.HTMLAttributes<HTMLElement>
  listeners?: React.HTMLAttributes<HTMLElement>
  style?: React.CSSProperties
}) {
  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        'min-w-0 cursor-grab select-none transition-shadow duration-200 active:cursor-grabbing',
        isOverlay ? 'rotate-2 scale-[1.03] shadow-2xl ring-2 ring-primary/40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardContent className="space-y-2 p-2">
        <Image
          width={640}
          height={360}
          src={photo.dataUrl}
          alt={`Foto ${index + 1}`}
          className="pointer-events-none aspect-video w-full rounded-md object-cover"
          unoptimized
        />
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-1 text-xs font-medium">
            {index === 0 && <Star className="size-3 fill-current text-primary" />}
            {index === 0 ? 'Principal' : `Foto ${index + 1}`}
          </span>
          <span className="text-xs text-muted-foreground">{formatBytes(dataUrlSize(photo.dataUrl))}</span>
        </div>
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-destructive"
            onPointerDown={event => event.stopPropagation()}
            onClick={onRemove}
            aria-label="Remover foto"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SortablePhotoCard({ photo, index, onRemove }: { photo: PollPhotoInput; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })

  return (
    <PhotoCard
      photo={photo}
      index={index}
      onRemove={onRemove}
      setNodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
    />
  )
}

export default function PollPhotoManager({
  photos,
  onChange,
  onFilesSelected,
  error,
}: {
  photos: PollPhotoInput[]
  onChange: (photos: PollPhotoInput[]) => void
  onFilesSelected: (files: FileList | File[]) => void
  error?: string
}) {
  const [activePhotoId, setActivePhotoId] = React.useState<string>()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActivePhotoId(String(active.id))
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActivePhotoId(undefined)
    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex(photo => photo.id === active.id)
    const newIndex = photos.findIndex(photo => photo.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    onChange(
      arrayMove(photos, oldIndex, newIndex).map((photo, index) => ({
        ...photo,
        isPrimary: index === 0,
      })),
    )
  }

  const activePhoto = activePhotoId ? photos.find(photo => photo.id === activePhotoId) : undefined
  const totalSize = photos.reduce((total, photo) => total + dataUrlSize(photo.dataUrl), 0)

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">Fotos do evento</p>
          <p className="text-xs text-muted-foreground">{photos.length}/10 fotos</p>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            A primeira imagem fica em destaque e será usada como capa na listagem de voluntariados. Arraste as fotos
            para reorganizar a ordem.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
          <ImagePlus className="size-4" />
          Adicionar fotos
          <Input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={event => {
              const files = event.target.files
              if (files) onFilesSelected(files)
            }}
          />
        </label>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Check className="size-3.5 text-primary" />
        Imagens otimizadas automaticamente · armazenamento estimado: {formatBytes(totalSize)}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {photos.length === 0 ? (
        <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma foto adicionada.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragCancel={() => setActivePhotoId(undefined)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={photos.map(photo => photo.id)} strategy={rectSortingStrategy}>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, index) => (
                <SortablePhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onRemove={() =>
                    onChange(
                      photos
                        .filter(item => item.id !== photo.id)
                        .map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === 0 })),
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            {activePhoto ? (
              <PhotoCard
                photo={activePhoto}
                index={photos.findIndex(photo => photo.id === activePhoto.id)}
                onRemove={() => undefined}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
