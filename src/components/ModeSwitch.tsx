'use client'

import { useSyncExternalStore } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

const themeOptions = [
  ['system', 'Sistema', Monitor],
  ['light', 'Claro', Sun],
  ['dark', 'Escuro', Moon],
] as const

export default function ModeSwitch() {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!mounted) {
    return <div className="size-9" aria-hidden="true" />
  }

  const selectedTheme = theme === 'light' || theme === 'dark' ? theme : 'system'
  const selectedOption = themeOptions[selectedTheme === 'system' ? 0 : selectedTheme === 'light' ? 1 : 2]
  const SelectedIcon = selectedOption[2]

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(open => !open)}
        aria-label={`Tema: ${selectedOption[1]}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="theme-menu"
      >
        <SelectedIcon className="size-4" />
      </Button>
      {isOpen && (
        <div
          id="theme-menu"
          role="menu"
          aria-label="Selecionar tema"
          className="absolute top-full right-0 z-30 mt-2 min-w-36 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {themeOptions.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="menuitemradio"
              aria-checked={selectedTheme === id}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              onClick={() => {
                setTheme(id)
                setIsOpen(false)
              }}
            >
              <Icon className="size-4" />
              <span className="flex-1">{label}</span>
              {selectedTheme === id && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
