// src/components/ui/workflow-builder/workflow-edge.tsx
import * as React from "react";
import { EdgeProps, getBezierPath } from "reactflow";
import { cn } from "@/lib/utils";

type WorkflowEdgeType = "default" | "success" | "failure" | "conditional";

interface WorkflowEdgeData {
  label?: string;
  type?: WorkflowEdgeType;
}

export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  style = {},
  markerEnd,
}: EdgeProps<WorkflowEdgeData>) {
  const edgeType = data?.type || "default";
  
  // Paramètres pour le chemin bezier
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Couleurs selon le type de connexion
  const getEdgeColor = () => {
    switch (edgeType) {
      case "success":
        return "#10B981"; // vert
      case "failure":
        return "#EF4444"; // rouge
      case "conditional":
        return "#F59E0B"; // orange
      default:
        return "#64748B"; // gris bleu par défaut
    }
  };

  const color = getEdgeColor();
  const strokeWidth = selected ? 3 : 2;

  return (
    <>
      <path
        id={id}
        className={cn("react-flow__edge-path transition-all", 
          selected ? "opacity-100" : "opacity-80"
        )}
        d={edgePath}
        strokeWidth={strokeWidth}
        stroke={color}
        style={style}
        markerEnd={markerEnd}
      />
      
      {/* Étiquette de la connexion si présente */}
      {data?.label && (
        <foreignObject
          width={100}
          height={40}
          x={labelX - 50}
          y={labelY - 20}
          className="overflow-visible"
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-md bg-background px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-inset ring-ring/10">
              {data.label}
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
}

export default WorkflowEdge;
