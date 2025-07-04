import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableItem } from '../draggable-item';

// Mock des icônes
vi.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-icon">GripVertical</div>,
}));

// Wrapper pour les tests avec DnD context
const DnDWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>
    <SortableContext items={['test-1']} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  </DndContext>
);

describe('DraggableItem', () => {
  const defaultProps = {
    id: 'test-1',
    children: <div>Test content</div>,
  };

  test('affiche le contenu fourni', () => {
    render(
      <DnDWrapper>
        <DraggableItem {...defaultProps} />
      </DnDWrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('applique les classes CSS par défaut', () => {
    render(
      <DnDWrapper>
        <DraggableItem {...defaultProps} />
      </DnDWrapper>
    );

    const item = screen.getByText('Test content').closest('.draggable-item');
    expect(item).toHaveClass('draggable-item');
    expect(item).toHaveClass('relative');
    expect(item).toHaveClass('rounded-md');
    expect(item).toHaveClass('bg-card');
  });

  test('affiche le handle de glissement quand handle=true', () => {
    render(
      <DnDWrapper>
        <DraggableItem {...defaultProps} handle={true} />
      </DnDWrapper>
    );

    expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
  });

  test('cache le handle de glissement quand handle=false', () => {
    render(
      <DnDWrapper>
        <DraggableItem {...defaultProps} handle={false} />
      </DnDWrapper>
    );

    expect(screen.queryByTestId('grip-icon')).not.toBeInTheDocument();
  });

  test('applique les classes personnalisées', () => {
    render(
      <DnDWrapper>
        <DraggableItem 
          {...defaultProps} 
          className="custom-item"
          handle={true}
        />
      </DnDWrapper>
    );

    const item = screen.getByText('Test content').closest('.draggable-item');
    expect(item).toHaveClass('custom-item');
  });

  test('gère les éléments désactivés', () => {
    render(
      <DnDWrapper>
        <DraggableItem {...defaultProps} disabled={true} />
      </DnDWrapper>
    );

    const item = screen.getByText('Test content').closest('.draggable-item');
    expect(item).toHaveClass('opacity-50');
    expect(item).toHaveClass('cursor-not-allowed');
  });

  test('applique les attributs d\'accessibilité', () => {
    render(
      <DnDWrapper>
        <DraggableItem 
          {...defaultProps} 
          handle={true}
        />
      </DnDWrapper>
    );

    const handle = screen.getByTitle('Glisser pour réorganiser');
    expect(handle).toHaveClass('drag-handle');
  });

  test('gère le contenu complexe', () => {
    const complexContent = (
      <div>
        <h3>Titre</h3>
        <p>Description</p>
        <button>Action</button>
      </div>
    );

    render(
      <DnDWrapper>
        <DraggableItem id="complex-1">
          {complexContent}
        </DraggableItem>
      </DnDWrapper>
    );

    expect(screen.getByText('Titre')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('applique les styles de survol', () => {
    render(
      <DnDWrapper>
        <DraggableItem {...defaultProps} />
      </DnDWrapper>
    );

    const item = screen.getByText('Test content').closest('.draggable-item');
    expect(item).toHaveClass('hover:shadow-sm');
  });

  test('gère les différentes orientations via CSS', () => {
    render(
      <DnDWrapper>
        <DraggableItem 
          {...defaultProps} 
          className="orientation-horizontal"
        />
      </DnDWrapper>
    );

    const item = screen.getByText('Test content').closest('.draggable-item');
    expect(item).toHaveClass('orientation-horizontal');
  });

  test('supporte les props data-* personnalisées', () => {
    render(
      <DnDWrapper>
        <DraggableItem 
          {...defaultProps} 
          data-testid="custom-draggable"
          data-position="0"
        />
      </DnDWrapper>
    );

    const item = screen.getByTestId('custom-draggable');
    expect(item).toHaveAttribute('data-position', '0');
  });
});
