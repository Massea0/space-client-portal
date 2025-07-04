import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import WorkflowBuilder from '../workflow-builder';
import type { Node, Edge } from 'reactflow';

// Mock ReactFlow
vi.mock('reactflow', () => ({
  default: ({ children, nodes, edges, onNodesChange, onEdgesChange, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      <div data-testid="workflow-nodes">
        {nodes?.map((node: Node) => (
          <div key={node.id} data-testid={`node-${node.id}`}>
            {node.data?.label || node.type}
          </div>
        ))}
      </div>
      <div data-testid="workflow-edges">
        {edges?.map((edge: Edge) => (
          <div key={edge.id} data-testid={`edge-${edge.id}`}>
            {edge.source} → {edge.target}
          </div>
        ))}
      </div>
      {children}
    </div>
  ),
  ReactFlow: ({ children, nodes, edges, onNodesChange, onEdgesChange, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      <div data-testid="workflow-nodes">
        {nodes?.map((node: Node) => (
          <div key={node.id} data-testid={`node-${node.id}`}>
            {node.data?.label || node.type}
          </div>
        ))}
      </div>
      <div data-testid="workflow-edges">
        {edges?.map((edge: Edge) => (
          <div key={edge.id} data-testid={`edge-${edge.id}`}>
            {edge.source} → {edge.target}
          </div>
        ))}
      </div>
      {children}
    </div>
  ),
  ReactFlowProvider: ({ children }: any) => <div data-testid="react-flow-provider">{children}</div>,
  MiniMap: () => <div data-testid="minimap" />,
  Controls: () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  useNodesState: (initialNodes: Node[]) => [initialNodes, vi.fn()],
  useEdgesState: (initialEdges: Edge[]) => [initialEdges, vi.fn()],
  addEdge: vi.fn(),
  ConnectionMode: { Loose: 'loose' },
}));

const mockNodes: Node[] = [
  {
    id: '1',
    type: 'task',
    position: { x: 100, y: 100 },
    data: { label: 'Tâche 1', description: 'Description tâche 1' },
  },
  {
    id: '2',
    type: 'condition',
    position: { x: 300, y: 100 },
    data: { label: 'Condition 1', condition: 'x > 0' },
  },
];

const mockEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
];

describe('WorkflowBuilder', () => {
  const defaultProps = {
    initialNodes: mockNodes,
    initialEdges: mockEdges,
    onSave: vi.fn(),
  };

  test('affiche le composant WorkflowBuilder', () => {
    render(<WorkflowBuilder {...defaultProps} />);
    
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
    expect(screen.getByTestId('background')).toBeInTheDocument();
  });

  test('affiche les nœuds initiaux', () => {
    render(<WorkflowBuilder {...defaultProps} />);
    
    expect(screen.getByTestId('node-1')).toBeInTheDocument();
    expect(screen.getByTestId('node-2')).toBeInTheDocument();
    expect(screen.getByText('Tâche 1')).toBeInTheDocument();
    expect(screen.getByText('Condition 1')).toBeInTheDocument();
  });

  test('affiche les arêtes initiales', () => {
    render(<WorkflowBuilder {...defaultProps} />);
    
    expect(screen.getByTestId('edge-e1-2')).toBeInTheDocument();
    expect(screen.getByText('1 → 2')).toBeInTheDocument();
  });

  test('applique les classes CSS personnalisées', () => {
    render(<WorkflowBuilder {...defaultProps} className="custom-workflow" />);
    
    const reactFlow = screen.getByTestId('react-flow');
    expect(reactFlow).toHaveClass('custom-workflow');
  });

  test('gère le mode lecture seule', () => {
    render(<WorkflowBuilder {...defaultProps} readOnly={true} />);
    
    const reactFlow = screen.getByTestId('react-flow');
    expect(reactFlow).toBeInTheDocument();
    // En mode lecture seule, les contrôles peuvent être désactivés
  });

  test('gère les workflows vides', () => {
    render(<WorkflowBuilder initialNodes={[]} initialEdges={[]} />);
    
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-nodes')).toBeEmptyDOMElement();
    expect(screen.getByTestId('workflow-edges')).toBeEmptyDOMElement();
  });

  test('applique la hauteur par défaut', () => {
    render(<WorkflowBuilder {...defaultProps} />);
    
    const reactFlow = screen.getByTestId('react-flow');
    expect(reactFlow).toHaveClass('h-[400px]');
  });

  test('applique une hauteur personnalisée', () => {
    render(<WorkflowBuilder {...defaultProps} className="h-[600px]" />);
    
    const reactFlow = screen.getByTestId('react-flow');
    expect(reactFlow).toHaveClass('h-[600px]');
  });

  test('gère les nœuds de différents types', () => {
    const nodesWithAllTypes: Node[] = [
      { id: '1', type: 'task', position: { x: 0, y: 0 }, data: { label: 'Task' } },
      { id: '2', type: 'condition', position: { x: 0, y: 100 }, data: { label: 'Condition' } },
      { id: '3', type: 'delay', position: { x: 0, y: 200 }, data: { label: 'Delay' } },
      { id: '4', type: 'email', position: { x: 0, y: 300 }, data: { label: 'Email' } },
      { id: '5', type: 'api', position: { x: 0, y: 400 }, data: { label: 'API' } },
      { id: '6', type: 'custom', position: { x: 0, y: 500 }, data: { label: 'Custom' } },
    ];

    render(<WorkflowBuilder initialNodes={nodesWithAllTypes} initialEdges={[]} />);
    
    expect(screen.getByTestId('node-1')).toBeInTheDocument();
    expect(screen.getByTestId('node-2')).toBeInTheDocument();
    expect(screen.getByTestId('node-3')).toBeInTheDocument();
    expect(screen.getByTestId('node-4')).toBeInTheDocument();
    expect(screen.getByTestId('node-5')).toBeInTheDocument();
    expect(screen.getByTestId('node-6')).toBeInTheDocument();
  });

  test('gère les workflows complexes avec de nombreuses connexions', () => {
    const complexEdges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-1', source: '2', target: '1' },
    ];

    render(<WorkflowBuilder initialNodes={mockNodes} initialEdges={complexEdges} />);
    
    expect(screen.getByTestId('edge-e1-2')).toBeInTheDocument();
    expect(screen.getByTestId('edge-e2-1')).toBeInTheDocument();
  });
});
