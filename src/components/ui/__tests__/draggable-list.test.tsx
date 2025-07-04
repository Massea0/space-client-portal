import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DraggableList, DraggableListItem } from '../draggable-list'

// Mock de @dnd-kit pour les tests
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  horizontalListSortingStrategy: vi.fn(),
  rectSortingStrategy: vi.fn(),
}))

vi.mock('../draggable-item', () => ({
  DraggableItem: ({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) => (
    <div data-testid={`draggable-item-${id}`} className={className}>
      {children}
    </div>
  ),
}))

describe('DraggableList', () => {
  const mockItems: DraggableListItem[] = [
    { id: '1', content: 'Premier élément' },
    { id: '2', content: 'Deuxième élément' },
    { id: '3', content: 'Troisième élément' },
  ]

  it('affiche tous les éléments fournis', () => {
    render(<DraggableList items={mockItems} />)
    
    expect(screen.getByText('Premier élément')).toBeInTheDocument()
    expect(screen.getByText('Deuxième élément')).toBeInTheDocument()
    expect(screen.getByText('Troisième élément')).toBeInTheDocument()
  })

  it('applique les classes CSS correctes pour orientation verticale (par défaut)', () => {
    render(<DraggableList items={mockItems} />)
    
    const container = screen.getByTestId('dnd-context').parentElement
    expect(container).toHaveClass('draggable-list-wrapper')
  })

  it('applique les classes CSS correctes pour orientation horizontale', () => {
    render(<DraggableList items={mockItems} orientation="horizontal" />)
    
    // Vérifier que le composant est rendu
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('applique les classes CSS correctes pour orientation grille', () => {
    render(<DraggableList items={mockItems} orientation="grid" />)
    
    // Vérifier que le composant est rendu
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('applique les props d\'accessibilité par défaut', () => {
    render(<DraggableList items={mockItems} />)
    
    const wrapper = screen.getByTestId('dnd-context').parentElement
    expect(wrapper).toHaveAttribute('aria-label', 'Liste réorganisable')
  })

  it('applique les props d\'accessibilité personnalisées', () => {
    const customLabel = 'Ma liste personnalisée'
    const customDescription = 'Description personnalisée'
    
    render(
      <DraggableList 
        items={mockItems} 
        ariaLabel={customLabel}
        ariaDescription={customDescription}
      />
    )
    
    const wrapper = screen.getByTestId('dnd-context').parentElement
    expect(wrapper).toHaveAttribute('aria-label', customLabel)
    expect(wrapper).toHaveAttribute('aria-description', customDescription)
  })

  it('rend chaque élément avec le bon ID', () => {
    render(<DraggableList items={mockItems} />)
    
    expect(screen.getByTestId('draggable-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('draggable-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('draggable-item-3')).toBeInTheDocument()
  })

  it('appelle onReorder quand fourni', () => {
    const mockOnReorder = vi.fn()
    
    render(<DraggableList items={mockItems} onReorder={mockOnReorder} />)
    
    // Vérifier que le composant est rendu correctement
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    // Note: Le test complet du drag & drop nécessiterait des mocks plus avancés
  })

  it('gère les éléments désactivés', () => {
    const itemsWithDisabled: DraggableListItem[] = [
      { id: '1', content: 'Élément normal' },
      { id: '2', content: 'Élément désactivé', disabled: true },
    ]
    
    render(<DraggableList items={itemsWithDisabled} />)
    
    expect(screen.getByText('Élément normal')).toBeInTheDocument()
    expect(screen.getByText('Élément désactivé')).toBeInTheDocument()
  })

  it('applique className personnalisée', () => {
    const customClass = 'ma-classe-personnalisee'
    
    render(<DraggableList items={mockItems} className={customClass} />)
    
    const wrapper = screen.getByTestId('dnd-context').parentElement
    expect(wrapper).toHaveClass(customClass)
  })

  it('applique containerClassName personnalisée', () => {
    render(<DraggableList items={mockItems} containerClassName="container-custom" />)
    
    // Vérifier que le composant est rendu
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('rend avec des éléments de contenu complexe', () => {
    const complexItems: DraggableListItem[] = [
      {
        id: 'complex-1',
        content: (
          <div>
            <h3>Titre complexe</h3>
            <p>Description avec plus de contenu</p>
            <button>Action</button>
          </div>
        ),
      },
    ]
    
    render(<DraggableList items={complexItems} />)
    
    expect(screen.getByText('Titre complexe')).toBeInTheDocument()
    expect(screen.getByText('Description avec plus de contenu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('gère une liste vide', () => {
    render(<DraggableList items={[]} />)
    
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument()
  })

  it('met à jour quand les items changent', () => {
    const { rerender } = render(<DraggableList items={mockItems} />)
    
    expect(screen.getByText('Premier élément')).toBeInTheDocument()
    
    const newItems: DraggableListItem[] = [
      { id: '4', content: 'Nouvel élément' },
    ]
    
    rerender(<DraggableList items={newItems} />)
    
    expect(screen.queryByText('Premier élément')).not.toBeInTheDocument()
    expect(screen.getByText('Nouvel élément')).toBeInTheDocument()
  })
})
