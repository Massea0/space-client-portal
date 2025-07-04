// src/components/ui/workflow-builder/workflow-builder.tsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Edge,
  Connection,
  Node,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Edit } from 'lucide-react';
import { WorkflowNode } from './workflow-node';
import { WorkflowControls } from './workflow-controls';

// Types de nœuds personnalisés
const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

// Types de connexions personnalisés
const edgeTypes: EdgeTypes = {};

// Types d'opérations supportées
export type WorkflowOperationType = 'task' | 'condition' | 'delay' | 'email' | 'api' | 'custom';

// Données des nœuds
export interface WorkflowNodeData {
  label: string;
  type: WorkflowOperationType;
  config?: Record<string, any>;
  icon?: React.ReactNode;
}

// Props du composant
interface WorkflowBuilderProps {
  className?: string;
  initialNodes?: Node<WorkflowNodeData>[];
  initialEdges?: Edge[];
  readOnly?: boolean;
  onNodesChange?: (nodes: Node<WorkflowNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onSave?: (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
}

/**
 * WorkflowBuilder - Composant pour créer et éditer des workflows visuels
 */
export function WorkflowBuilder({
  className,
  initialNodes = [],
  initialEdges = [],
  readOnly = false,
  onSave,
  ...props
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);

  // Gestion des connexions entre nœuds
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((edges) => addEdge({
        ...connection,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      }, edges));
    },
    [setEdges]
  );

  // Sélection d'un nœud
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node as Node<WorkflowNodeData>);
    },
    []
  );

  // Sauvegarde du workflow
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  // Ajout d'un nouveau nœud
  const addNode = useCallback(
    (type: WorkflowOperationType, position: { x: number; y: number }) => {
      const newNode: Node<WorkflowNodeData> = {
        id: `node_${Date.now()}`,
        type: 'workflowNode',
        position,
        data: {
          label: `Nouvelle ${type}`,
          type,
          config: {},
        },
      };
      
      setNodes((nodes) => [...nodes, newNode]);
    },
    [setNodes]
  );

  // Mise à jour d'un nœud
  const handleNodeUpdate = useCallback(
    (updatedNode: Node<WorkflowNodeData>) => {
      setNodes((nodes) => 
        nodes.map((node) => 
          node.id === updatedNode.id ? updatedNode : node
        )
      );
    },
    [setNodes]
  );

  // Suppression d'un nœud
  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
      setEdges((edges) => edges.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode]
  );

  return (
    <div className={cn("workflow-builder flex h-[600px] w-full border rounded-md", className)} {...props}>
      {/* Panneau de contrôles à gauche */}
      {!readOnly && (
        <div className="w-80 border-r bg-muted/20 p-4">
          <WorkflowControls
            onAddNode={addNode}
            onSave={handleSave}
            selectedNode={selectedNode}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
          />
        </div>
      )}
      
      {/* Zone de workflow principal */}
      <div className="flex-1">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeInternal}
            onEdgesChange={onEdgesChangeInternal}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
