// src/components/ui/workflow-builder/workflow-node.tsx
import * as React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { WorkflowNodeData, WorkflowOperationType } from "./workflow-builder";
import { 
  Clock, Mail, Code, CheckCircle, HelpCircle, 
  AlertCircle, Gauge, MessageSquare 
} from "lucide-react";

const nodeTypeIcons: Record<WorkflowOperationType, React.ReactNode> = {
  task: <CheckCircle className="h-4 w-4" />,
  condition: <HelpCircle className="h-4 w-4" />,
  delay: <Clock className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  api: <Code className="h-4 w-4" />,
  custom: <Gauge className="h-4 w-4" />,
};

const nodeTypeColors: Record<WorkflowOperationType, string> = {
  task: "bg-blue-100 border-blue-300 text-blue-700",
  condition: "bg-amber-100 border-amber-300 text-amber-700",
  delay: "bg-purple-100 border-purple-300 text-purple-700",
  email: "bg-green-100 border-green-300 text-green-700",
  api: "bg-indigo-100 border-indigo-300 text-indigo-700",
  custom: "bg-rose-100 border-rose-300 text-rose-700",
};

export function WorkflowNode({ data, isConnectable, selected }: NodeProps<WorkflowNodeData>) {
  const { label, type, icon, config } = data;
  const nodeIcon = icon || nodeTypeIcons[type];
  const nodeColor = nodeTypeColors[type];

  return (
    <div
      className={cn(
        "workflow-node rounded-md border-2 p-3 shadow-sm transition-all",
        "min-w-[180px] max-w-[250px]",
        nodeColor,
        selected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {/* Connecteur d'entrée en haut */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !bg-primary !border-2 !border-background"
        isConnectable={isConnectable}
      />

      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 p-1">
          {nodeIcon}
        </div>
        <span className="font-medium">{label}</span>
      </div>

      {config && Object.keys(config).length > 0 && (
        <div className="mt-2 rounded-sm bg-white/40 p-2 text-xs">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="mb-1 flex items-center justify-between gap-2">
              <span className="font-medium">{key}:</span>
              <span className="truncate">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Connecteur de sortie en bas */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !bg-primary !border-2 !border-background"
        isConnectable={isConnectable}
      />
    </div>
  );
}
