import '@testing-library/jest-dom'
import { createElement, type ImgHTMLAttributes } from 'react'

if (!window.PointerEvent) {
  window.PointerEvent = MouseEvent as typeof PointerEvent
}

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    unoptimized,
    fill,
    priority,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean; fill?: boolean; priority?: boolean }) => {
    void unoptimized
    void fill
    void priority
    return createElement('img', props)
  },
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

class ResizeObserverMock {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'blob:jest-object-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
})
