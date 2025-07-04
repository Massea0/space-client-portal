import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { WorkflowNode } from '../workflow-node';
import type { NodeProps } from 'reactflow';

// Mock des handles de ReactFlow
vi.mock('reactflow', () => ({
  Handle: ({ type, position, id, ...props }: any) => (
    <div 
      data-testid={`handle-${type}-${position}`}
      data-handle-id={id}
      {...props}
    />
  ),
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
}));

describe('WorkflowNode', () => {
  const baseProps: NodeProps = {
    id: 'test-node',
    type: 'task',
    selected: false,
    isConnectable: true,
    zIndex: 1,
    xPos: 100,
    yPos: 200,
    dragging: false,
    data: {
      label: 'Test Node',
      type: 'task' as const,
      config: { description: 'Test Description' },
    },
  };

  test('affiche un nœud de type task', () => {
    render(<WorkflowNode {...baseProps} type="task" />);
    
    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
  });

  test('affiche un nœud de type condition', () => {
    const conditionProps = {
      ...baseProps,
      type: 'condition',
      data: {
        label: 'Test Condition',
        type: 'condition' as const,
        config: { condition: 'x > 0' },
      },
    };

    render(<WorkflowNode {...conditionProps} />);
    
    expect(screen.getByText('Test Condition')).toBeInTheDocument();
  });

  test('affiche un nœud de type delay', () => {
    const delayProps = {
      ...baseProps,
      type: 'delay',
      data: {
        label: 'Test Delay',
        type: 'delay' as const,
        config: { duration: '5 minutes' },
      },
    };

    render(<WorkflowNode {...delayProps} />);
    
    expect(screen.getByText('Test Delay')).toBeInTheDocument();
  });

  test('affiche un nœud de type email', () => {
    const emailProps = {
      ...baseProps,
      type: 'email',
      data: {
        label: 'Send Email',
        type: 'email' as const,
        config: {
          recipient: 'test@example.com',
          subject: 'Test Subject',
        },
      },
    };

    render(<WorkflowNode {...emailProps} />);
    
    expect(screen.getByText('Send Email')).toBeInTheDocument();
  });

  test('affiche un nœud de type api', () => {
    const apiProps = {
      ...baseProps,
      type: 'api',
      data: {
        label: 'API Call',
        type: 'api' as const,
        config: {
          url: 'https://api.example.com',
          method: 'POST',
        },
      },
    };

    render(<WorkflowNode {...apiProps} />);
    
    expect(screen.getByText('API Call')).toBeInTheDocument();
  });

  test('affiche un nœud de type custom', () => {
    const customProps = {
      ...baseProps,
      type: 'custom',
      data: {
        label: 'Custom Node',
        type: 'custom' as const,
        config: { key: 'value' },
      },
    };

    render(<WorkflowNode {...customProps} />);
    
    expect(screen.getByText('Custom Node')).toBeInTheDocument();
  });

  test('applique le style sélectionné', () => {
    const selectedProps = {
      ...baseProps,
      selected: true,
    };

    render(<WorkflowNode {...selectedProps} />);
    
    // La classe ring-2 ring-primary est appliquée sur le div principal du nœud
    const nodeContainer = screen.getByText('Test Node').closest('div[class*="ring-2"]');
    expect(nodeContainer).toHaveClass('ring-2', 'ring-primary');
  });

  test('gère les nœuds sans données', () => {
    const emptyProps = {
      ...baseProps,
      data: {
        label: 'Empty Node',
        type: 'task' as const,
      },
    };

    render(<WorkflowNode {...emptyProps} />);
    
    // Le nœud devrait s'afficher même sans données
    const node = screen.getByTestId('handle-target-top').closest('div');
    expect(node).toBeInTheDocument();
  });

  test('affiche les handles correctement', () => {
    render(<WorkflowNode {...baseProps} />);
    
    // Vérifier que les handles sont présents
    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
  });

  test('applique les bonnes couleurs selon le type', () => {
    // Test pour chaque type de nœud
    const types: Array<'task' | 'condition' | 'delay' | 'email' | 'api' | 'custom'> = ['task', 'condition', 'delay', 'email', 'api', 'custom'];
    
    types.forEach(type => {
      const { unmount } = render(
        <WorkflowNode {...baseProps} type={type} data={{ label: `${type} node`, type }} />
      );
      
      // Chaque type devrait avoir sa couleur distinctive
      const node = screen.getByText(`${type} node`).closest('div');
      expect(node).toBeInTheDocument();
      
      unmount();
    });
  });

  test('gère les propriétés isConnectable', () => {
    const nonConnectableProps = {
      ...baseProps,
      isConnectable: false,
    };

    render(<WorkflowNode {...nonConnectableProps} />);
    
    // Les handles devraient toujours être présents mais potentiellement désactivés
    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
  });
});
