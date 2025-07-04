import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Étendre Vitest avec les matchers de jest-dom
expect.extend(matchers)

// Nettoyer après chaque test
afterEach(() => {
  cleanup()
})

// Mock du CSS et des modules statiques
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de ResizeObserver pour les composants qui l'utilisent
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock de DragEvent pour les tests de drag & drop
Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent extends Event {
    dataTransfer: DataTransfer
    
    constructor(type: string, init?: DragEventInit) {
      super(type, init)
      this.dataTransfer = {
        dropEffect: 'none',
        effectAllowed: 'all',
        files: [] as any,
        items: [] as any,
        types: [],
        clearData: vi.fn(),
        getData: vi.fn(),
        setData: vi.fn(),
        setDragImage: vi.fn(),
      } as DataTransfer
    }
  },
})

// Mock de PointerEvent pour les tests tactiles
Object.defineProperty(window, 'PointerEvent', {
  value: class PointerEvent extends Event {
    pointerId: number
    pointerType: string
    
    constructor(type: string, init?: PointerEventInit) {
      super(type, init)
      this.pointerId = init?.pointerId || 1
      this.pointerType = init?.pointerType || 'mouse'
    }
  },
})
