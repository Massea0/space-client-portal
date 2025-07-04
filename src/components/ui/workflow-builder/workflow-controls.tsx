// src/components/ui/workflow-builder/workflow-controls.tsx
import * as React from "react";
import { Node } from "reactflow";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkflowNodeData, WorkflowOperationType } from "./workflow-builder";
import { 
  Plus, Save, Clock, Mail, Code, CheckCircle, 
  HelpCircle, Trash2, Settings, Edit, AlertCircle
} from "lucide-react";

interface WorkflowControlsProps {
  onAddNode: (type: WorkflowOperationType, position: { x: number; y: number }) => void;
  onSave: () => void;
  selectedNode: Node<WorkflowNodeData> | null;
  onNodeUpdate: (updatedNode: Node<WorkflowNodeData>) => void;
  onNodeDelete?: (nodeId: string) => void;
}

const nodeTypes: Array<{ type: WorkflowOperationType; label: string; icon: React.ReactNode }> = [
  { type: "task", label: "Tâche", icon: <CheckCircle className="h-4 w-4" /> },
  { type: "condition", label: "Condition", icon: <HelpCircle className="h-4 w-4" /> },
  { type: "delay", label: "Délai", icon: <Clock className="h-4 w-4" /> },
  { type: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { type: "api", label: "API", icon: <Code className="h-4 w-4" /> },
  { type: "custom", label: "Personnalisé", icon: <Settings className="h-4 w-4" /> },
];

export function WorkflowControls({
  onAddNode,
  onSave,
  selectedNode,
  onNodeUpdate,
  onNodeDelete,
}: WorkflowControlsProps) {
  // État pour suivre les modifications du nœud sélectionné
  const [nodeLabel, setNodeLabel] = React.useState<string>("");
  const [nodeConfig, setNodeConfig] = React.useState<Record<string, any>>({});

  // Mise à jour des valeurs quand un nœud est sélectionné
  React.useEffect(() => {
    if (selectedNode) {
      setNodeLabel(selectedNode.data.label);
      setNodeConfig(selectedNode.data.config || {});
    } else {
      setNodeLabel("");
      setNodeConfig({});
    }
  }, [selectedNode]);

  // Mise à jour du nœud sélectionné
  const handleUpdateNode = () => {
    if (selectedNode) {
      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          label: nodeLabel,
          config: nodeConfig,
        },
      };
      onNodeUpdate(updatedNode);
    }
  };

  // Ajout d'une nouvelle configuration
  const handleAddConfig = () => {
    setNodeConfig({
      ...nodeConfig,
      [`option${Object.keys(nodeConfig).length + 1}`]: "",
    });
  };

  // Mise à jour d'une configuration
  const handleConfigChange = (key: string, value: string) => {
    setNodeConfig({
      ...nodeConfig,
      [key]: value,
    });
  };

  // Suppression d'une configuration
  const handleRemoveConfig = (key: string) => {
    const newConfig = { ...nodeConfig };
    delete newConfig[key];
    setNodeConfig(newConfig);
  };

  // Suppression du nœud sélectionné
  const handleDeleteNode = () => {
    if (selectedNode && onNodeDelete) {
      onNodeDelete(selectedNode.id);
    }
  };

  return (
    <div className="workflow-controls absolute right-4 top-4 z-10 flex flex-col gap-2">
      {/* Bouton de sauvegarde */}
      <Button variant="default" size="sm" onClick={onSave}>
        <Save className="mr-1 h-4 w-4" />
        Enregistrer
      </Button>

      {/* Popover pour ajouter un nœud */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Ajouter un nœud
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60 p-0">
          <div className="grid gap-1 p-2">
            {nodeTypes.map((nodeType) => (
              <Button
                key={nodeType.type}
                variant="ghost"
                className="flex w-full justify-start"
                size="sm"
                onClick={() => onAddNode(nodeType.type, { x: 100, y: 100 })}
              >
                <span className="mr-2">{nodeType.icon}</span>
                {nodeType.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Panneau d'édition pour le nœud sélectionné */}
      {selectedNode && (
        <div className="mt-2 w-64 rounded-md border bg-background p-3 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Éditer le nœud</h3>
            {onNodeDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive"
                onClick={handleDeleteNode}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Separator className="my-2" />

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basique</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-2 space-y-2">
              <div className="space-y-1">
                <Label htmlFor="node-label">Étiquette</Label>
                <Input
                  id="node-label"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleUpdateNode}>
                  <Edit className="mr-1 h-4 w-4" />
                  Mettre à jour
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="config" className="mt-2 space-y-2">
              <ScrollArea className="h-[180px] pr-4">
                <div className="space-y-2">
                  {Object.entries(nodeConfig).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[1fr_auto] gap-1">
                      <Input
                        value={String(value)}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        className="h-8"
                        placeholder={key}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={() => handleRemoveConfig(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-between">
                <Button size="sm" variant="outline" onClick={handleAddConfig}>
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter un champ
                </Button>
                <Button size="sm" onClick={handleUpdateNode}>
                  Appliquer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

export default WorkflowControls;
